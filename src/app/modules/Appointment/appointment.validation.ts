import { z } from "zod";

const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string({
      required_error: "Doctor ID is required.",
    }),
    scheduleId: z.string({
      required_error: "Doctor Schedule ID is required.",
    }),
  }),
});

export const AppointmentValidation = {
  createAppointmentSchema,
};
