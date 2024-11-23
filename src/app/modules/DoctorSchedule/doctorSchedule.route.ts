import express from "express";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.createDoctorSchedule
);

router.get(
  "/my-schedule",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.getMySchedule
);

router.delete(
  "/my-schedule/:id",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.hardDeleteMySchedule
);

export const DoctorScheduleRoutes = router;
