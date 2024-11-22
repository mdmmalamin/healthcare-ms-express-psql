import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { DoctorScheduleService } from "./doctorSchedule.service";
import { TAuthUser } from "../../interfaces";

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

// const getAllSchedule: RequestHandler = catchAsync(async (req, res) => {
//   // const filters = queryParamsPick(req.query, patientFilterableFields);
//   // const options = queryParamsPick(req.query, patientOptionsFields);

//   // const { meta, data } = await ScheduleService.getAllScheduleFromDB(
//   //   filters,
//   //   options
//   // );

//   apiResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "All doctor schedules retrieved successfully.",
//     // meta: meta,
//     data: null,
//   });
// });

export const DoctorScheduleController = {
  createDoctorSchedule,
};
