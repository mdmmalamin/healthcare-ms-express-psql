import { z } from "zod";

const createSpecialtiesSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: "Title is required.",
    }),
  }),
});

export const SpecialtiesValidation = {
  createSpecialtiesSchema,
};
