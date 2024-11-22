import { Request, Response } from "express";
import {
  apiResponse,
  catchAsync,
  httpStatus,
  queryParamsPick,
} from "../../../shared";
import { ScheduleService } from "./schedule.service";
import {
  scheduleFilterableFields,
  scheduleOptionsFields,
} from "./schedule.constant";
import { TAuthUser } from "../../interfaces";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleService.createScheduleIntoDB(req.body);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Schedule created successfully.",
    data: result,
  });
});

const getAllSchedule = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;
    const filters = queryParamsPick(req.query, scheduleFilterableFields);
    const options = queryParamsPick(req.query, scheduleOptionsFields);

    const { meta, data } = await ScheduleService.getAllScheduleFromDB(
      user as TAuthUser,
      filters,
      options
    );

    apiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All schedules retrieved successfully.",
      meta: meta,
      data: data,
    });
  }
);

export const ScheduleController = {
  createSchedule,
  getAllSchedule,
};
