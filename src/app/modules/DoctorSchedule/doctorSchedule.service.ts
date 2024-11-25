import { Prisma } from "@prisma/client";
import { paginationFormate } from "../../../helpers";
import { httpStatus, prisma } from "../../../shared";
import { TAuthUser, TPaginationOptions } from "../../interfaces";
import {
  TDoctorScheduleCreate,
  TDoctorScheduleFilterRequest,
} from "./doctorSchedule.interface";
import ApiError from "../../errors/ApiError";

const createDoctorScheduleIntoDB = async (
  user: TAuthUser,
  payload: TDoctorScheduleCreate
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));

  return await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });
};

const getMyScheduleFromDB = async (
  user: TAuthUser,
  filters: any,
  options: TPaginationOptions
) => {
  const { page, skip, limit, sortBy, sortOrder } = paginationFormate(options);
  const { startDate, endDate, ...filterData } = filters;

  const andConditions: Prisma.DoctorSchedulesWhereInput[] = [];

  if (startDate && endDate) {
    andConditions.push({
      AND: [
        {
          schedule: {
            startDateTime: { gte: startDate },
          },
        },
        {
          schedule: {
            endDateTime: { lte: endDate },
          },
        },
      ],
    });
  }

  if (Object.keys(filterData).length > 0) {
    if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "true"
    ) {
      filterData.isBooked === true;
    } else if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "false"
    ) {
      filterData.isBooked === false;
    }
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.DoctorSchedulesWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const result = await prisma.doctorSchedules.findMany({
    where: {
      doctorId: doctorData.id,
      ...whereConditions,
    },
    skip,
    take: limit,
    // orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : {},

    include: {
      schedule: true,
    },
  });

  const total = await prisma.doctorSchedules.count({
    where: {
      doctorId: doctorData.id,
      ...whereConditions,
    },
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const hardDeleteMyScheduleFromDB = async (user: TAuthUser, id: string) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const isBooked = await prisma.doctorSchedules.findUnique({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: id,
      },
      isBooked: true,
    },
  });

  if (isBooked) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can not delete the schedule because of the schedule already booked."
    );
  }

  const result = await prisma.doctorSchedules.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: id,
      },
      isBooked: false,
    },
  });

  return result;
};

const getAllDoctorScheduleFromDB = async (
  filters: TDoctorScheduleFilterRequest,
  options: TPaginationOptions
) => {
  const { limit, page, skip } = paginationFormate(options);
  const { searchTerm, ...filterData } = filters;
  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      doctor: {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "true"
    ) {
      filterData.isBooked = true;
    } else if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "false"
    ) {
      filterData.isBooked = false;
    }
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: any =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.doctorSchedules.findMany({
    include: {
      doctor: true,
      schedule: true,
    },
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {},
  });
  const total = await prisma.doctorSchedules.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

export const DoctorScheduleService = {
  createDoctorScheduleIntoDB,
  getMyScheduleFromDB,
  hardDeleteMyScheduleFromDB,
  getAllDoctorScheduleFromDB,
};
