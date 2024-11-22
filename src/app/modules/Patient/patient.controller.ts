import { RequestHandler } from "express";
import {
  apiResponse,
  catchAsync,
  httpStatus,
  queryParamsPick,
} from "../../../shared";
import {
  patientFilterableFields,
  patientOptionsFields,
} from "./patient.constant";
import { PatientService } from "./patient.service";

const getAllPatient: RequestHandler = catchAsync(async (req, res) => {
  const filters = queryParamsPick(req.query, patientFilterableFields);
  const options = queryParamsPick(req.query, patientOptionsFields);

  const { meta, data } = await PatientService.getAllFromDB(filters, options);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All patient retrieved successfully.",
    meta: meta,
    data: data,
  });
});

const getById: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientService.getByIdFromDB(id);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved patient data by ID.",
    data: result,
  });
});

const updatePatient: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await PatientService.updatePatientIntoDB(id, payload);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Updated patient successfully.",
    data: result,
  });
});

const softDeletePatient: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientService.softDeletePatientFromDB(id);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient data deleted.",
    data: result,
  });
});

const hardDeletePatient: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientService.hardDeletePatientFromDB(id);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Hard deleted patient successfully.",
    data: result,
  });
});

export const PatientController = {
  getAllPatient,
  getById,
  updatePatient,
  softDeletePatient,
  hardDeletePatient,
};
