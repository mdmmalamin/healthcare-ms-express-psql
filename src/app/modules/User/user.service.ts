import { Prisma, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import { httpStatus, prisma } from "../../../shared";
import config from "../../../config";
import { fileUploader, paginationFormate } from "../../../helpers";
import { TAuthUser, TFile } from "../../interfaces";
import { TPaginationOptions } from "../../interfaces/pagination.type";
import { userSearchableFields } from "./user.constant";
import ApiError from "../../errors/ApiError";

const createAdminIntoDB = async (file: TFile | undefined, payload: any) => {
  if (file) {
    const fileName = `${payload?.admin?.name}-${payload?.admin?.phone}`;
    const { secure_url } = await fileUploader.uploadToCloudinary(
      file,
      fileName,
      "profile/admin"
    );
    payload.admin.avatar = secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt.salt_rounds)
  );

  const userData = {
    password: hashedPassword,
    email: payload.admin.email,
    phone: payload.admin.phone,
    role: UserRole.ADMIN,
  };

  const adminData = payload.admin;

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: adminData,
    });

    return createdAdminData;
  });

  return result;
};

const createDoctorIntoDB = async (file: TFile | undefined, payload: any) => {
  if (file) {
    const fileName = `${payload?.doctor?.name}-${payload?.doctor?.phone}`;
    const { secure_url } = await fileUploader.uploadToCloudinary(
      file,
      fileName,
      "profile/doctor"
    );
    payload.doctor.avatar = secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt.salt_rounds)
  );

  const userData = {
    password: hashedPassword,
    email: payload.doctor.email,
    phone: payload.doctor.phone,
    role: UserRole.DOCTOR,
  };

  const doctorData = payload.doctor;

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdDoctorData = await transactionClient.doctor.create({
      data: doctorData,
    });

    return createdDoctorData;
  });

  return result;
};

const createPatientIntoDB = async (file: TFile | undefined, payload: any) => {
  if (file) {
    const fileName = `${payload?.patient?.name}-${payload?.patient?.phone}`;
    const { secure_url } = await fileUploader.uploadToCloudinary(
      file,
      fileName,
      "profile/patient"
    );
    payload.patient.avatar = secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt.salt_rounds)
  );

  const userData = {
    password: hashedPassword,
    email: payload.patient.email,
    phone: payload.patient.phone,
    role: UserRole.PATIENT,
  };

  const patientData = payload.patient;

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdPatientData = await transactionClient.patient.create({
      data: patientData,
    });

    return createdPatientData;
  });

  return result;
};

const retrievedAllUserFromDB = async (
  params: any,
  options: TPaginationOptions
) => {
  const { page, skip, limit, sortBy, sortOrder } = paginationFormate(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,

    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      needPasswordChange: true,
      createdAt: true,
      updatedAt: true,

      admin: true,
      doctor: true,
      patient: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const changeProfileStatusIntoDB = async (
  id: string,
  payload: { status: UserStatus }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const updateUserStatus = await prisma.user.update({
    where: {
      id,
    },
    data: payload,
  });

  return updateUserStatus;
};

const getMyProfileFromDB = async (user: TAuthUser) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      phone: user?.phone,
      status: "ACTIVE",
    },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      needPasswordChange: true,
    },
  });

  let profileInfo;

  switch (user?.role) {
    case UserRole.SUPER_ADMIN:
      profileInfo = await prisma.admin.findUnique({
        where: {
          phone: user.phone,
        },
      });
      break;
    case UserRole.ADMIN:
      profileInfo = await prisma.admin.findUnique({
        where: {
          phone: user.phone,
        },
      });
      break;
    case UserRole.DOCTOR:
      profileInfo = await prisma.doctor.findUnique({
        where: {
          phone: user.phone,
        },
      });
      break;
    case UserRole.PATIENT:
      profileInfo = await prisma.patient.findUnique({
        where: {
          phone: user.phone,
        },
      });
      break;

    default:
      throw new ApiError(httpStatus.FORBIDDEN, "Forbidden.");
      break;
  }

  return {
    ...userInfo,
    ...profileInfo,
  };
};

const updateMyProfileIntoDB = async (user: TAuthUser, payload: any) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      phone: user?.phone,
      status: "ACTIVE",
    },
  });

  let profileInfo;

  switch (user?.role) {
    case UserRole.SUPER_ADMIN:
      profileInfo = await prisma.admin.update({
        where: {
          phone: user.phone,
        },
        data: payload,
      });
      break;
    case UserRole.ADMIN:
      profileInfo = await prisma.admin.update({
        where: {
          phone: user.phone,
        },
        data: payload,
      });
      break;
    case UserRole.DOCTOR:
      profileInfo = await prisma.doctor.update({
        where: {
          phone: user.phone,
        },
        data: payload,
      });
      break;
    case UserRole.PATIENT:
      profileInfo = await prisma.patient.update({
        where: {
          phone: user.phone,
        },
        data: payload,
      });
      break;

    default:
      throw new ApiError(httpStatus.FORBIDDEN, "Forbidden.");
      break;
  }

  return profileInfo;
};

const updateMyAvatarIntoCloudinary = async (user: TAuthUser, file: TFile) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: "ACTIVE",
    },
  });

  if (!file) {
    throw new ApiError(httpStatus.NO_CONTENT, "File not found.");
  }

  const avatarData = async ({
    role,
    name,
    phone,
  }: {
    role: string;
    name: string;
    phone: string;
  }) => {
    const fileName = `${name}-${phone}`;
    let filePath;

    switch (role) {
      case UserRole.SUPER_ADMIN:
        filePath = "profile/admin";
        break;
      case UserRole.ADMIN:
        filePath = "profile/admin";
        break;
      case UserRole.DOCTOR:
        filePath = "profile/doctor";
        break;
      case UserRole.PATIENT:
        filePath = "profile/patient";
        break;

      default:
        break;
    }
    const { secure_url } = await fileUploader.uploadToCloudinary(
      file,
      fileName,
      filePath!
    );

    return secure_url;
  };

  let profileInfo;

  switch (user?.role) {
    case UserRole.SUPER_ADMIN:
      const superAdminInfo = await prisma.admin.findUniqueOrThrow({
        where: {
          email: user.email,
        },
        select: {
          name: true,
          phone: true,
        },
      });
      console.log(superAdminInfo);

      const superAdminAvatarUrl = await avatarData({
        role: user.role,
        ...superAdminInfo,
      });

      profileInfo = await prisma.admin.update({
        where: {
          phone: user.phone,
        },
        data: {
          avatar: superAdminAvatarUrl,
        },
      });
      break;
    case UserRole.ADMIN:
      const adminInfo = await prisma.admin.findUniqueOrThrow({
        where: {
          email: user.email,
        },
        select: {
          name: true,
          phone: true,
        },
      });
      console.log(adminInfo);

      const adminAvatarUrl = await avatarData({
        role: user.role,
        ...adminInfo,
      });

      profileInfo = await prisma.admin.update({
        where: {
          email: user.email,
        },
        data: {
          avatar: adminAvatarUrl,
        },
      });
      break;
    case UserRole.DOCTOR:
      const doctorInfo = await prisma.doctor.findUniqueOrThrow({
        where: {
          email: user.email,
        },
        select: {
          name: true,
          phone: true,
        },
      });
      console.log(doctorInfo);

      const doctorAvatarUrl = await avatarData({
        role: user.role,
        ...doctorInfo,
      });

      profileInfo = await prisma.doctor.update({
        where: {
          email: user.email,
        },
        data: {
          avatar: doctorAvatarUrl,
        },
      });
      break;
    case UserRole.PATIENT:
      const patientInfo = await prisma.patient.findUniqueOrThrow({
        where: {
          email: user.email,
        },
        select: {
          name: true,
          phone: true,
        },
      });
      console.log(patientInfo);

      const patientAvatarUrl = await avatarData({
        role: user.role,
        ...patientInfo,
      });

      profileInfo = await prisma.patient.update({
        where: {
          email: user.email,
        },
        data: {
          avatar: patientAvatarUrl,
        },
      });
      break;

    default:
      throw new ApiError(httpStatus.FORBIDDEN, "Forbidden.");
  }

  return profileInfo;
};

export const UserService = {
  createAdminIntoDB,
  createDoctorIntoDB,
  createPatientIntoDB,

  retrievedAllUserFromDB,
  changeProfileStatusIntoDB,

  getMyProfileFromDB,
  updateMyProfileIntoDB,
  updateMyAvatarIntoCloudinary,
};
