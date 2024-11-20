import { Request, Response } from "express";
import { SpecialtiesService } from "./specialties.service";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { TFile } from "../../interfaces";

const insertSpecialties = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialtiesService.insertSpecialtiesIntoDB(
    req.file as TFile,
    req.body
  );

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties created successfully.",
    data: result,
  });
});

const getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialtiesService.getAllSpecialtiesFromDB();

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All specialties retrieved successfully.",
    data: result,
  });
});

const hardDeleteSpecialties = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SpecialtiesService.hardDeleteSpecialtiesFromDB(id);

    apiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `${result.title} specialties hard deleted successfully.`,
      data: null,
    });
  }
);

export const SpecialtiesController = {
  insertSpecialties,
  getAllSpecialties,
  hardDeleteSpecialties,
};
