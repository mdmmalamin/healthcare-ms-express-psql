import { Admin, Prisma } from "@prisma/client";
import { adminSearchableFields } from "./admin.constant";
import { prisma } from "../../../shared";
import { TAdminFilterRequest } from "./admin.interface";
import { TPaginationOptions } from "../../interfaces/pagination.type";
import { paginationFormate } from "../../../helpers";

const retrievedAllFromDB = async (
  params: TAdminFilterRequest,
  options: TPaginationOptions
) => {
  const { page, skip, limit, sortBy, sortOrder } = paginationFormate(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.AdminWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: adminSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.AdminWhereInput = { AND: andConditions };

  const result = await prisma.admin.findMany({
    where: whereConditions,

    skip,
    take: limit,

    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : { createdAt: "desc" },
  });

  const total = await prisma.admin.count({
    where: whereConditions,
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const retrievedByIdFromDB = async (id: string): Promise<Admin | null> => {
  const result = await prisma.admin.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  return result;
};

const updateByIdIntoDB = async (
  id: string,
  payload: Partial<Admin>
): Promise<Admin> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.admin.update({
    where: {
      id,
    },

    data: payload,
  });

  return result;
};

const softDeleteByIdIntoDB = async (id: string): Promise<Admin> => {
  await prisma.admin.findUniqueOrThrow({
    where: { id },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const softDeletedAdmin = await transactionClient.admin.update({
      where: { id },

      data: { isDeleted: true },
    });

    await transactionClient.user.update({
      where: {
        email: softDeletedAdmin.email,
      },

      data: {
        status: "DELETED",
      },
    });

    return softDeletedAdmin;
  });

  return result;
};

const hardDeleteByIdIntoDB = async (id: string): Promise<Admin> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const hardDeletedAdmin = await transactionClient.admin.delete({
      where: { id },
    });

    await transactionClient.user.delete({
      where: {
        email: hardDeletedAdmin.email,
      },
    });

    return hardDeletedAdmin;
  });

  return result;
};

export const AdminService = {
  retrievedAllFromDB,
  retrievedByIdFromDB,
  updateByIdIntoDB,
  softDeleteByIdIntoDB,
  hardDeleteByIdIntoDB,
};
