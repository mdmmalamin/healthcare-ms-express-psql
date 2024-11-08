import { RequestHandler } from "express";
import { AdminService } from "./admin.service";
import { adminFilterableFields, adminOptionsFields } from "./admin.constant";
import {
  apiResponse,
  catchAsync,
  httpStatus,
  queryParamsPick,
} from "../../../shared";

const retrievedAllAdmin: RequestHandler = catchAsync(async (req, res) => {
  const filters = queryParamsPick(req.query, adminFilterableFields);
  const options = queryParamsPick(req.query, adminOptionsFields);

  const { meta, data } = await AdminService.retrievedAllFromDB(
    filters,
    options
  );

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved all admin data.",
    meta: meta,
    data: data,
  });
});

const retrievedAdmin: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.retrievedByIdFromDB(id);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved admin data by ID.",
    data: result,
  });
});

const updateAdmin: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await AdminService.updateByIdIntoDB(id, payload);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Updated admin data by ID.",
    data: result,
  });
});

const softDeleteAdmin: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.softDeleteByIdIntoDB(id);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin data deleted.",
    data: result,
  });
});

const hardDeleteAdmin: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.hardDeleteByIdIntoDB(id);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Hard deleted admin data by ID.",
    data: result,
  });
});

export const AdminController = {
  retrievedAllAdmin,
  retrievedAdmin,
  updateAdmin,
  softDeleteAdmin,
  hardDeleteAdmin,
};
