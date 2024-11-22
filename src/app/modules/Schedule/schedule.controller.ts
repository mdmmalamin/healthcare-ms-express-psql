import { RequestHandler } from "express";
import {
  apiResponse,
  catchAsync,
  httpStatus,
  queryParamsPick,
} from "../../../shared";
import { ScheduleService } from "./schedule.service";

const createSchedule: RequestHandler = catchAsync(async (req, res) => {
  const result = await ScheduleService.createScheduleIntoDB(req.body);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Schedule created successfully.",
    data: result,
  });
});

const getAllSchedule: RequestHandler = catchAsync(async (req, res) => {
  // const filters = queryParamsPick(req.query, patientFilterableFields);
  // const options = queryParamsPick(req.query, patientOptionsFields);

  // const { meta, data } = await ScheduleService.getAllScheduleFromDB(
  //   filters,
  //   options
  // );

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All schedules retrieved successfully.",
    // meta: meta,
    data: null,
  });
});

export const ScheduleController = {
  createSchedule,
  getAllSchedule,
};
