import { RequestHandler } from "express";
import {
  apiResponse,
  catchAsync,
  httpStatus,
  queryParamsPick,
} from "../../../shared";
import { doctorFilterableFields, doctorOptionsFields } from "./doctor.constant";
import { DoctorService } from "./doctor.service";

const getAllDoctor: RequestHandler = catchAsync(async (req, res) => {
  const filters = queryParamsPick(req.query, doctorFilterableFields);
  const options = queryParamsPick(req.query, doctorOptionsFields);

  const { meta, data } = await DoctorService.getAllFromDB(filters, options);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All doctor retrieved successfully.",
    meta: meta,
    data: data,
  });
});

const getDoctor: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DoctorService.getByIdFromDB(id);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved doctor data by ID.",
    data: result,
  });
});

const updateDoctor: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await DoctorService.updateByIdIntoDB(id, payload);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Updated doctor data by ID.",
    data: result,
  });
});

const softDeleteDoctor: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DoctorService.softDeleteByIdIntoDB(id);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor data deleted.",
    data: result,
  });
});

const hardDeleteDoctor: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DoctorService.hardDeleteByIdIntoDB(id);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Hard deleted doctor data by ID.",
    data: result,
  });
});

export const DoctorController = {
  getAllDoctor,
  getDoctor,
  updateDoctor,
  softDeleteDoctor,
  hardDeleteDoctor,
};
