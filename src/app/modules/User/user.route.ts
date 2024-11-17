import express from "express";
import { UserController } from "./user.controller";
import { auth, validateRequest } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpers/fileUploader";
import { UserValidation } from "./user.validation";
import { formDataParser } from "../../../helpers/formDataParser";

const router = express.Router();

router.post(
  "/create-admin", //? specific Route for creating an admin
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), //? for Authorization guard
  fileUploader.upload.single("file"), //? for multer file upload
  formDataParser, //? for formData stringify to JSON.parse
  validateRequest(UserValidation.createAdminSchema), //? for Zod validation schema
  UserController.createAdmin //? for create an admin service controller
);

router.post(
  "/create-doctor",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single("file"),
  formDataParser,
  validateRequest(UserValidation.createDoctorSchema),
  UserController.createDoctor
);

router.post(
  "/create-patient",
  fileUploader.upload.single("file"),
  formDataParser,
  validateRequest(UserValidation.createPatientSchema),
  UserController.createPatient
);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.retrievedAllUser
);

router.patch(
  "/:id/status",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(UserValidation.updateStatusSchema),
  UserController.changeProfileStatus
);

export const UserRoutes = router;
