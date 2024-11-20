import { fileUploader } from "../../../helpers";
import { httpStatus, prisma } from "../../../shared";
import ApiError from "../../errors/ApiError";
import { TFile } from "../../interfaces";

const insertSpecialtiesIntoDB = async (
  file: TFile,
  payload: { title: string }
) => {
  if (!file) {
    throw new ApiError(httpStatus.NO_CONTENT, "File not found.");
  }

  // const isExist = await prisma.specialties.findUnique({
  //   where: {
  //     title: payload.title,
  //   },
  // });

  // if (isExist) {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     "This specialties title already exist in DB."
  //   );
  // }

  const { secure_url } = await fileUploader.uploadToCloudinary(
    file,
    payload.title,
    "specialties"
  );

  const specialtiesData = {
    ...payload,
    icon: secure_url,
  };

  const result = await prisma.specialties.create({
    data: specialtiesData,
  });

  return result;
};

const getAllSpecialtiesFromDB = async () => {
  const result = await prisma.specialties.findMany();

  return result;
};

const hardDeleteSpecialtiesFromDB = async (id: string) => {
  await prisma.specialties.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.specialties.delete({
    where: {
      id,
    },

    select: {
      title: true,
    },
  });

  return result;
};

export const SpecialtiesService = {
  insertSpecialtiesIntoDB,
  getAllSpecialtiesFromDB,
  hardDeleteSpecialtiesFromDB,
};
