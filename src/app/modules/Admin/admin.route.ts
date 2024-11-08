import express from "express";
import { AdminController } from "./admin.controller";
import { validateRequest } from "../../middlewares";
import { adminValidation } from "./admin.validation";

const router = express.Router();

router.get("/", AdminController.retrievedAllAdmin);

router.get("/:id", AdminController.retrievedAdmin);

router.patch(
  "/:id",
  validateRequest(adminValidation.updateSchema),
  AdminController.updateAdmin
);

router.delete("/soft/:id", AdminController.softDeleteAdmin);

router.delete("/hard/:id", AdminController.hardDeleteAdmin);

export const AdminRoutes = router;
