import { httpStatus, prisma } from "../../../shared";
import * as bcrypt from "bcrypt";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { jwtHelper } from "../../../helpers";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import sendEmail from "../../../utils/sendEmail";

const loginUserFromDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: email,
      status: "ACTIVE",
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    password,
    user.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect.");
  }

  const tokenPayload = {
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  const accessToken = jwtHelper.generateToken(
    tokenPayload,
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  const refreshToken = jwtHelper.generateToken(
    tokenPayload,
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

const refreshTokenFromCookies = async (token: string) => {
  let decoded;
  try {
    decoded = jwtHelper.verifyToken(token, config.jwt.refresh_secret as Secret);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your are not authorized.");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: decoded?.email,
      status: "ACTIVE",
    },
  });

  const tokenPayload = {
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  const accessToken = jwtHelper.generateToken(
    tokenPayload,
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  return {
    accessToken,
    needPasswordChange: user.needPasswordChange,
  };
};

const changePasswordIntoDB = async (user: any, payload: any) => {
  const { oldPassword, newPassword } = payload;

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect.");
  }

  const hashedPassword: string = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await prisma.user.update({
    where: {
      email: user.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password changed successfully.",
  };
};

const forgetPassword = async (payload: { email: string }) => {
  const { email } = payload;

  const userData = await prisma.user.findFirstOrThrow({
    where: {
      email,
      status: "ACTIVE",
    },
  });

  const resetPasswordToken = jwtHelper.generateToken(
    {
      email: userData.email,
      role: userData.role,
      type: "Forget_Password",
    },
    config.jwt.reset_password_secret as Secret,
    config.jwt.reset_password_expires_in as string
  );

  const resetPassLink = `${config.reset_pass_link}?userId=${userData.id}&token=${resetPasswordToken}`;

  await sendEmail(
    userData.email,
    `<div>
      <p>Dear User,</p>
        <p>Your Reset Password Link: </p>
        <a href=${resetPassLink}>
        <button>
        Reset Password
        </button>
      </a>
    </div>`
  );
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findFirstOrThrow({
    where: {
      id: payload.id,
      status: "ACTIVE",
    },
  });

  const isValidToken = jwtHelper.verifyToken(
    token,
    config.jwt.reset_password_secret as Secret
  );

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden.");
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  await prisma.user.update({
    where: {
      id: payload.id,
      status: "ACTIVE",
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password reset successfully. Please login...",
  };
};

export const AuthService = {
  loginUserFromDB,
  refreshTokenFromCookies,
  changePasswordIntoDB,
  forgetPassword,
  resetPassword,
};
