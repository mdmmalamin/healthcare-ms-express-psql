import express, { Request, Response } from "express";
import { UserController } from "./user.controller";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.createAdmin
);

export const UserRoutes = router;
