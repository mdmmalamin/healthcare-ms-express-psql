import express from "express";
import { AdminController } from "./admin.controller";
import { auth, validateRequest } from "../../middlewares";
import { adminValidation } from "./admin.validation";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminController.retrievedAllAdmin
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminController.retrievedAdmin
);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(adminValidation.updateSchema),
  AdminController.updateAdmin
);

router.delete(
  "/soft/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminController.softDeleteAdmin
);

router.delete(
  "/hard/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminController.hardDeleteAdmin
);

export const AdminRoutes = router;
