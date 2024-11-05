import express from "express";
import { AdminController } from "./admin.controller";

const router = express.Router();

router.get("/", AdminController.retrievedAllAdmin);

router.get("/:id", AdminController.retrievedAdmin);

router.patch("/:id", AdminController.updateAdmin);

router.delete("/soft/:id", AdminController.softDeleteAdmin);

router.delete("/hard/:id", AdminController.hardDeleteAdmin);

export const AdminRoutes = router;
