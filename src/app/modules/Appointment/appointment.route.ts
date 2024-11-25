import express from "express";
import { AppointmentController } from "./appointment.controller";
import { auth, validateRequest } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { AppointmentValidation } from "./appointment.validation";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.PATIENT),
  validateRequest(AppointmentValidation.createAppointmentSchema),
  AppointmentController.createAppointment
);

router.get(
  "/my-appointment",
  auth(UserRole.DOCTOR, UserRole.PATIENT),
  AppointmentController.getMyAppointment
);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AppointmentController.getAllAppointment
);

export const AppointmentRoutes = router;
