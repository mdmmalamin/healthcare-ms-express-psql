import { Request, Response } from "express";
import { UserService } from "./user.service";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createAdminIntoDB(req.body);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Admin created successfully.",
    data: result,
  });
});

export const UserController = {
  createAdmin,
};
