import { Request, Response } from "express";
import {
  apiResponse,
  catchAsync,
  httpStatus,
  queryParamsPick,
} from "../../../shared";
import { AppointmentService } from "./appointment.service";
import { TAuthUser } from "../../interfaces";
import {
  AllAppointmentFilterableFields,
  appointmentOptionsFields,
  myAppointmentFilterableFields,
} from "./appointment.constant";

const createAppointment = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;
    const result = await AppointmentService.createAppointmentIntoDB(
      user as TAuthUser,
      req.body
    );

    apiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Appointment created successfully.",
      data: result,
    });
  }
);

const getMyAppointment = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;
    const filters = queryParamsPick(req.query, myAppointmentFilterableFields);
    const options = queryParamsPick(req.query, appointmentOptionsFields);
    const { meta, data } = await AppointmentService.getMyAppointmentFromDB(
      user as TAuthUser,
      filters,
      options
    );

    apiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My appointment retrieved successfully.",
      meta: meta,
      data: data,
    });
  }
);

const getAllAppointment = catchAsync(async (req: Request, res: Response) => {
  const filters = queryParamsPick(req.query, AllAppointmentFilterableFields);
  const options = queryParamsPick(req.query, appointmentOptionsFields);
  const { meta, data } = await AppointmentService.getAllAppointmentFromDB(
    filters,
    options
  );

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All appointment retrieved successfully.",
    meta: meta,
    data: data,
  });
});

export const AppointmentController = {
  createAppointment,
  getMyAppointment,
  getAllAppointment,
};
