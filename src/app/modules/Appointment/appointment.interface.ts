import { AppointmentStatus, PaymentStatus } from "@prisma/client";

export type TAppointment = {
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
};
