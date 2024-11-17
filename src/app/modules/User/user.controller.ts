import { Request, Response } from "express";
import { UserService } from "./user.service";
import {
  apiResponse,
  catchAsync,
  httpStatus,
  queryParamsPick,
} from "../../../shared";
import { userFilterableFields, userOptionsFields } from "./user.constant";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  const data = req.body;
  const result = await UserService.createAdminIntoDB(file, data);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Admin created successfully.",
    data: result,
  });
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  const data = req.body;
  const result = await UserService.createDoctorIntoDB(file, data);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Doctor created successfully.",
    data: result,
  });
});

const createPatient = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  const data = req.body;
  const result = await UserService.createPatientIntoDB(file, data);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Patient created successfully.",
    data: result,
  });
});

const retrievedAllUser = catchAsync(async (req: Request, res: Response) => {
  const filters = queryParamsPick(req.query, userFilterableFields);
  const options = queryParamsPick(req.query, userOptionsFields);

  const { meta, data } = await UserService.retrievedAllUserFromDB(
    filters,
    options
  );

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved all user data.",
    meta: meta,
    data: data,
  });
});

const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.changeProfileStatusIntoDB(id, req.body);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User profile status changed successfully.",
    data: result,
  });
});

export const UserController = {
  createAdmin,
  createDoctor,
  createPatient,

  retrievedAllUser,
  changeProfileStatus,
};
