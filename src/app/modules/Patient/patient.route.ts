import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { PatientController } from "./patient.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PatientController.getAllPatient
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PatientController.getById
);

router.patch(
  "/:id",
  // auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  // validateRequest(adminValidation.updateSchema),
  PatientController.updatePatient
);

router.delete(
  "/soft/:id",
  // auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PatientController.softDeletePatient
);

router.delete(
  "/hard/:id",
  // auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PatientController.hardDeletePatient
);

export const PatientRoutes = router;
