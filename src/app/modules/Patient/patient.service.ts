import { Patient, Prisma } from "@prisma/client";
import { paginationFormate } from "../../../helpers";
import { TPaginationOptions } from "../../interfaces";
import { TPatientFilterRequest, TPatientUpdate } from "./patient.interface";
import { patientSearchableFields } from "./patient.constant";
import { prisma } from "../../../shared";

const getAllFromDB = async (
  filters: TPatientFilterRequest,
  options: TPaginationOptions
) => {
  const { page, skip, limit, sortBy, sortOrder } = paginationFormate(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.PatientWhereInput[] = [];

  if (searchTerm) {
    //? searchTerm condition
    andConditions.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
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

  const whereConditions: Prisma.PatientWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.patient.findMany({
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
      medicalReport: true,
      patientHealthData: true,
    },
  });

  const total = await prisma.patient.count({
    where: whereConditions,
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getByIdFromDB = async (id: string): Promise<Patient | null> => {
  const result = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      medicalReport: true,
      patientHealthData: true,
    },
  });

  return result;
};

const updatePatientIntoDB = async (
  id: string,
  payload: Partial<TPatientUpdate>
): Promise<Patient | null> => {
  const { patientHealthData, medicalReport, ...patientData } = payload;

  await prisma.patient.findUniqueOrThrow({
    where: { id, isDeleted: false },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    if (patientHealthData) {
      //? Patient Health Data Update or Create
      await transactionClient.patientHealthData.upsert({
        where: {
          patientId: id,
        },
        update: patientHealthData,
        create: { patientId: id, ...patientHealthData },
      });
    }

    if (medicalReport) {
      //? Patient Medical Report Update or Create
      await transactionClient.medicalReport.createMany({
        data: { patientId: id, ...medicalReport },
      });
    }

    //? Update Patient Data
    const updatedPatient = await transactionClient.patient.update({
      where: { id },
      data: patientData,
      include: {
        patientHealthData: true,
        medicalReport: true,
        _count: true,
      },
    });

    return updatedPatient;
  });

  return result;
};

const softDeletePatientFromDB = async (id: string) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: { id, isDeleted: false },
  });

  return await prisma.$transaction(async (txClient) => {
    await txClient.patient.update({
      where: { id },
      data: { isDeleted: true },
    });

    await txClient.user.update({
      where: { email: patientData.email },
      data: { status: "DELETED" },
    });
  });
};

const hardDeletePatientFromDB = async (id: string) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: { id },
    include: { medicalReport: true, patientHealthData: true },
  });

  return await prisma.$transaction(async (txClient) => {
    if (patientData.medicalReport) {
      //? Medical Report Deleted
      await txClient.medicalReport.deleteMany({
        where: { patientId: id },
      });
    }

    if (patientData.patientHealthData) {
      //? Health Data Deleted
      await txClient.patientHealthData.delete({
        where: { patientId: id },
      });
    }

    //? Patient Data Deleted
    await txClient.patient.delete({ where: { id } });

    //? User Data Deleted
    await txClient.user.delete({
      where: { email: patientData.email },
    });
  });
};

export const PatientService = {
  getAllFromDB,
  getByIdFromDB,
  updatePatientIntoDB,
  softDeletePatientFromDB,
  hardDeletePatientFromDB,
};
