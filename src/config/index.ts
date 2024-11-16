import dotenv from "dotenv";
import path from "path";
import { emit } from "process";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    reset_password_secret: process.env.JWT_RESET_PASSWORD_SECRET,
    reset_password_expires_in: process.env.JWT_RESET_EXPIRES_IN,
  },
  reset_pass_link: process.env.RESET_PASS_LINK,
  sendEmail: {
    email: process.env.EMAIL,
    app_pass: process.env.APP_PASS,
  },
};
