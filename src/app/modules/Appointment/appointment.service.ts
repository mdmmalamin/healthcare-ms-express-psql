import { prisma } from "../../../shared";
import { TAuthUser, TPaginationOptions } from "../../interfaces";
import { v4 as uuidV4 } from "uuid";
import crypto from "crypto";
import { paginationFormate } from "../../../helpers";
import { Prisma, UserRole } from "@prisma/client";

const createAppointmentIntoDB = async (user: TAuthUser, payload: any) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
    },
  });

  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const result = await prisma.$transaction(async (txClient) => {
    const newAppointment = await txClient.appointment.create({
      data: {
        ...payload,
        patientId: patientData.id,
        videoCallingId: uuidV4(),
      },
      include: {
        doctor: true,
        patient: true,
        schedule: true,
      },
    });

    await txClient.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          // doctorId: payload.doctorId,
          // scheduleId: payload.scheduleId,
          ...payload,
        },
      },
      data: {
        isBooked: true,
        appointmentId: newAppointment.id,
      },
    });

    //? TXN-HC-Date.now()-crypto.randomBytes(4).toString('hex')
    const randomStr = crypto.randomBytes(4).toString("hex"); //? Random 8-character hex string
    const transactionId = `TXN-HC-${Date.now()}-${randomStr}`.toUpperCase();

    await txClient.payment.create({
      data: {
        appointmentId: newAppointment.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    return newAppointment;
  });

  return result;
};

const getMyAppointmentFromDB = async (
  user: TAuthUser,
  filters: any,
  options: TPaginationOptions
) => {
  const { page, skip, limit, sortBy, sortOrder } = paginationFormate(options);
  const { ...filterData } = filters;

  const andConditions: Prisma.AppointmentWhereInput[] = [];

  switch (user?.role) {
    case UserRole.DOCTOR:
      andConditions.push({
        doctor: { email: user?.email },
      });

      break;

    case UserRole.PATIENT:
      andConditions.push({
        patient: { email: user?.email },
      });

      break;

    default:
      break;
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : { createdAt: "desc" },
    include:
      user?.role === "DOCTOR"
        ? {
            patient: {
              include: {
                medicalReport: true,
                patientHealthData: true,
              },
            },
            schedule: true,
          }
        : { doctor: true, schedule: true },
  });

  const total = await prisma.appointment.count({
    where: whereConditions,
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getAllAppointmentFromDB = async (
  filters: any,
  options: TPaginationOptions
) => {
  const { page, skip, limit, sortBy, sortOrder } = paginationFormate(options);
  const { doctorEmail, patientEmail, ...filterData } = filters;

  const andConditions: Prisma.AppointmentWhereInput[] = [];

  if (doctorEmail) {
    andConditions.push({
      doctor: { email: doctorEmail },
    });
  }

  if (patientEmail) {
    andConditions.push({
      patient: {
        email: patientEmail,
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

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // console.dir(andConditions, { depth: Infinity });

  const result = await prisma.appointment.findMany({
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
      doctor: true,
      patient: true,
      doctorSchedules: true,
      schedule: true,
      payment: true,
    },
  });

  const total = await prisma.appointment.count({
    where: whereConditions,
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

export const AppointmentService = {
  createAppointmentIntoDB,
  getMyAppointmentFromDB,
  getAllAppointmentFromDB,
};
