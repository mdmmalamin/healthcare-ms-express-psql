import { Gender, UserStatus } from "@prisma/client";
import { z } from "zod";

const createAdminSchema = z.object({
  body: z.object({
    password: z.string({
      required_error: "Password is required.",
    }),
    admin: z.object({
      name: z.string({ required_error: "Name is required." }),
      email: z.string({ required_error: "Email is required." }),
      phone: z.string({ required_error: "Phone number is required." }),
    }),
  }),
});

const createDoctorSchema = z.object({
  body: z.object({
    password: z.string({
      required_error: "Password is required.",
    }),
    doctor: z.object({
      name: z.string({ required_error: "Name is required." }),
      email: z.string({ required_error: "Email is required." }),
      phone: z.string({ required_error: "Phone number is required." }),
      address: z.string().optional(),
      registrationNo: z.string({
        required_error: "Registration No is required.",
      }),
      experience: z.number().optional(),
      gender: z.enum([Gender.MALE, Gender.FEMALE]),
      appointmentFee: z.number({
        required_error: "Appointment Fee is required.",
      }),
      qualification: z.string({
        required_error: "Qualification is required.",
      }),
      currentWorkingPlace: z.string({
        required_error: "Current Working Place is required.",
      }),
      designation: z.string({
        required_error: "Designation is required.",
      }),
    }),
  }),
});

const createPatientSchema = z.object({
  body: z.object({
    password: z.string({
      required_error: "Password is required.",
    }),
    patient: z.object({
      name: z.string({ required_error: "Name is required." }),
      email: z.string({ required_error: "Email is required." }),
      phone: z.string({ required_error: "Phone number is required." }),
      address: z.string().optional(),
    }),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCK, UserStatus.DELETED]),
  }),
});

export const UserValidation = {
  createAdminSchema,
  createDoctorSchema,
  createPatientSchema,

  updateStatusSchema,
};
