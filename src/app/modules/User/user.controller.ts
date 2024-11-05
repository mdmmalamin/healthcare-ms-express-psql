import { Request, Response } from "express";
import { UserService } from "./user.service";
import { apiResponse, httpStatus } from "../../../shared";

const createAdmin = async (req: Request, res: Response) => {
  try {
    const result = await UserService.createAdminIntoDB(req.body);

    apiResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Admin created successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.name || "Something went wrong.",
      error: error,
    });
  }
};

export const UserController = {
  createAdmin,
};
