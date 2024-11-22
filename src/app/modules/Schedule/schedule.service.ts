import { Prisma, Schedule } from "@prisma/client";
import { formateDate, paginationFormate } from "../../../helpers";
import { prisma } from "../../../shared";
import { TSchedule, TScheduleFilterRequest } from "./schedule.interface";
import { TAuthUser, TPaginationOptions } from "../../interfaces";

const createScheduleIntoDB = async (
  payload: TSchedule
): Promise<Schedule[]> => {
  const { startDate, endDate, startTime, endTime } = payload;

  const intervalTime = "00:30";
  const schedules = [];

  let dateStart = new Date(startDate); //? formatted start date
  let dateEnd = new Date(endDate); //? formatted end date

  while (dateStart <= dateEnd) {
    const startDateTime = formateDate.addTime(dateStart, startTime);
    const endDateTime = formateDate.addTime(dateStart, endTime);

    let startSchedule = startDateTime;
    while (startSchedule < endDateTime) {
      const scheduleDateTime = {
        startDateTime: startSchedule,
        endDateTime: formateDate.addTime(startSchedule, intervalTime),
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleDateTime.startDateTime,
          endDateTime: scheduleDateTime.endDateTime,
        },
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleDateTime,
        });

        schedules.push(result);
      }

      startSchedule = scheduleDateTime.endDateTime;
    }

    dateStart = formateDate.addDay(dateStart, 1);
  }

  return schedules;
};

const getAllScheduleFromDB = async (
  user: TAuthUser,
  filters: TScheduleFilterRequest,
  options: TPaginationOptions
) => {
  const { page, skip, limit, sortBy, sortOrder } = paginationFormate(options);
  const { startDate, endDate, ...filterData } = filters;

  const andConditions: Prisma.ScheduleWhereInput[] = [];

  if (startDate && endDate) {
    andConditions.push({
      AND: [
        {
          startDateTime: { gte: startDate },
        },
        {
          endDateTime: { lte: endDate },
        },
      ],
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

  const whereConditions: Prisma.ScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const doctorSchedules = await prisma.doctorSchedules.findMany({
    where: { doctor: { email: user?.email } },
  });

  const doctorScheduleIds = doctorSchedules.map(
    (schedule) => schedule.scheduleId
  );

  const result = await prisma.schedule.findMany({
    where: {
      ...whereConditions,
      id: { notIn: doctorScheduleIds },
    },
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : { createdAt: "desc" },
  });

  const total = await prisma.schedule.count({
    where: {
      ...whereConditions,
      id: { notIn: doctorScheduleIds },
    },
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

export const ScheduleService = {
  createScheduleIntoDB,
  getAllScheduleFromDB,
};
