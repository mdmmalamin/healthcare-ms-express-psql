import express from "express";
import { UserRole } from "@prisma/client";
import { auth, validateRequest } from "../../middlewares";
import { SpecialtiesController } from "./specialties.controller";
import { fileUploader, formDataParser } from "../../../helpers";
import { SpecialtiesValidation } from "./specialties.validation";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  fileUploader.upload.single("file"),
  formDataParser,
  validateRequest(SpecialtiesValidation.createSpecialtiesSchema),
  SpecialtiesController.insertSpecialties
);

router.get("/", SpecialtiesController.getAllSpecialties);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SpecialtiesController.hardDeleteSpecialties
);

export const SpecialtiesRoutes = router;
