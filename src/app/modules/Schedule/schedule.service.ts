import { Schedule } from "@prisma/client";
import { formateDate } from "../../../helpers";
import { prisma } from "../../../shared";
import { TSchedule } from "./schedule.interface";

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

const getAllScheduleFromDB = async () => {
  const result = await prisma.schedule.findMany({});

  return result;
};

export const ScheduleService = {
  createScheduleIntoDB,
  getAllScheduleFromDB,
};
