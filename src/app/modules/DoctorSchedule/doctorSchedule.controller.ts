import { Request, Response } from "express";
import {
  apiResponse,
  catchAsync,
  httpStatus,
  queryParamsPick,
} from "../../../shared";
import { DoctorScheduleService } from "./doctorSchedule.service";
import { TAuthUser } from "../../interfaces";
import {
  doctorScheduleFilterableFields,
  doctorScheduleOptionsFields,
} from "./doctorSchedule.constant";

const createDoctorSchedule = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;
    const result = await DoctorScheduleService.createDoctorScheduleIntoDB(
      user as TAuthUser,
      req.body
    );

    apiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Doctor schedule created successfully.",
      data: result,
    });
  }
);

const getMySchedule = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;
    const filters = queryParamsPick(req.query, doctorScheduleFilterableFields);
    const options = queryParamsPick(req.query, doctorScheduleOptionsFields);

    const { meta, data } = await DoctorScheduleService.getMyScheduleFromDB(
      user as TAuthUser,
      filters,
      options
    );

    apiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My schedules retrieved successfully.",
      meta: meta,
      data: data,
    });
  }
);

const hardDeleteMySchedule = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;
    const { id } = req.params;

    const result = await DoctorScheduleService.hardDeleteMyScheduleFromDB(
      user as TAuthUser,
      id
    );

    apiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My schedules deleted successfully.",
      data: result,
    });
  }
);

const getAllDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
  const filters = queryParamsPick(req.query, doctorScheduleFilterableFields);
  const options = queryParamsPick(req.query, doctorScheduleOptionsFields);
  const { meta, data } = await DoctorScheduleService.getAllDoctorScheduleFromDB(
    filters,
    options
  );

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My schedules deleted successfully.",
    meta: meta,
    data: data,
  });
});

export const DoctorScheduleController = {
  createDoctorSchedule,
  getMySchedule,
  hardDeleteMySchedule,

  getAllDoctorSchedule,
};
