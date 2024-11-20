import { Doctor, Prisma } from "@prisma/client";
import { paginationFormate } from "../../../helpers";
import { TPaginationOptions } from "../../interfaces";
import { doctorSearchableFields } from "./doctor.constant";
import { prisma } from "../../../shared";
import { TDoctorFilterRequest, TDoctorSpecialties } from "./doctor.interface";

const getAllFromDB = async (
  params: TDoctorFilterRequest,
  options: TPaginationOptions
) => {
  const { page, skip, limit, sortBy, sortOrder } = paginationFormate(options);
  const { searchTerm, specialties, ...filterData } = params;

  const andConditions: Prisma.DoctorWhereInput[] = [];

  if (searchTerm) {
    //? searchTerm condition
    andConditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (specialties && specialties.length > 0) {
    //? specialties condition
    //* doctor -> doctorSpecialties -> specialties -> title
    andConditions.push({
      doctorSpecialties: {
        some: {
          specialties: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : { createdAt: "desc" },
    include: {
      doctorSpecialties: {
        select: {
          specialties: true,
        },
      },
    },
  });

  const total = await prisma.doctor.count({
    where: whereConditions,
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getByIdFromDB = async (id: string): Promise<Doctor | null> => {
  const result = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      doctorSpecialties: {
        select: {
          specialties: true,
        },
      },
    },
  });

  return result;
};

const updateByIdIntoDB = async (id: string, payload: any) => {
  const { specialties, ...doctorData } = payload;
  await prisma.doctor.findUniqueOrThrow({
    where: { id, isDeleted: false },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    //? Doctor Specialties delete & create
    if (specialties && specialties.length) {
      //? Delete Specialties
      const deleteSpecialtiesIds = specialties.filter(
        (specialty: TDoctorSpecialties) => specialty.isDeleted
      );

      for (const specialty of deleteSpecialtiesIds) {
        await transactionClient.doctorSpecialties.deleteMany({
          where: {
            doctorId: id,
            specialtiesId: specialty.specialtiesId,
          },
        });
      }

      //? Create Specialties
      const createSpecialtiesIds = specialties.filter(
        (specialty: TDoctorSpecialties) => !specialty.isDeleted
      );

      for (const specialty of createSpecialtiesIds) {
        await transactionClient.doctorSpecialties.create({
          data: {
            doctorId: id,
            specialtiesId: specialty.specialtiesId,
          },
        });
      }
    }

    const updateDoctorData = await transactionClient.doctor.update({
      where: { id },
      data: doctorData,
      include: {
        doctorSpecialties: {
          select: {
            specialties: true,
          },
        },
      },
    });

    return updateDoctorData;
  });

  return result;
};

const softDeleteByIdIntoDB = async (id: string): Promise<Doctor> => {
  await prisma.doctor.findUniqueOrThrow({
    where: { id },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const softDeletedDoctor = await transactionClient.doctor.update({
      where: { id },

      data: { isDeleted: true },
    });

    await transactionClient.user.update({
      where: {
        email: softDeletedDoctor.email,
      },

      data: {
        status: "DELETED",
      },
    });

    return softDeletedDoctor;
  });

  return result;
};

const hardDeleteByIdIntoDB = async (id: string): Promise<Doctor> => {
  await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const hardDeletedDoctor = await transactionClient.doctor.delete({
      where: { id },
    });

    await transactionClient.user.delete({
      where: {
        email: hardDeletedDoctor.email,
      },
    });

    return hardDeletedDoctor;
  });

  return result;
};

export const DoctorService = {
  getAllFromDB,
  getByIdFromDB,
  updateByIdIntoDB,
  softDeleteByIdIntoDB,
  hardDeleteByIdIntoDB,
};
