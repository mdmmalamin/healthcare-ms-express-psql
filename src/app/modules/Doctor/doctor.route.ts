import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { DoctorController } from "./doctor.controller";

const router = express.Router();

router.get(
  "/",
  // auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorController.getAllDoctor
);

router.get(
  "/:id",
  // auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorController.getDoctor
);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  // validateRequest(adminValidation.updateSchema),
  DoctorController.updateDoctor
);

router.delete(
  "/soft/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorController.softDeleteDoctor
);

router.delete(
  "/hard/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorController.hardDeleteDoctor
);

export const DoctorRoutes = router;
