import { prisma } from "../../../shared";
import * as bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtHelper } from "../../../helpers";

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
    throw new Error("Password incorrect.");
  }

  const tokenPayload = {
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  const accessToken = jwtHelper.generateToken(tokenPayload, "abcdefgh", "1h");

  const refreshToken = jwtHelper.generateToken(tokenPayload, "abcdefgh", "30d");

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

const refreshTokenFromCookies = async (token: string) => {
  let decoded;
  try {
    decoded = jwtHelper.verifyToken(token, "abcdefgh");
  } catch (error) {
    throw new Error("Your are not authorized.");
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

  const accessToken = jwtHelper.generateToken(tokenPayload, "abcdefgh", "1h");

  return {
    accessToken,
    needPasswordChange: user.needPasswordChange,
  };
};

export const AuthService = {
  loginUserFromDB,
  refreshTokenFromCookies,
};
