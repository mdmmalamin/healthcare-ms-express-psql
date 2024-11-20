import { UserRole } from "@prisma/client";

export type TAuthUser = {
  email: string;
  phone: string;
  role: UserRole;
} | null;
