import { prisma } from "../../../shared";
import { TAuthUser } from "../../interfaces";
import { TDoctorScheduleCreate } from "./doctorSchedule.interface";

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

export const DoctorScheduleService = {
  createDoctorScheduleIntoDB,
};
