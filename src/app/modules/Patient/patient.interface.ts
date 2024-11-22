import { BloodGroup, Gender, MaritalStatus } from "@prisma/client";

export type TPatientFilterRequest = {
  searchTerm?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  gender?: string | undefined;
};

type TPatientHealthData = {
  dateOfBirth: string;
  gender: Gender;
  bloodGroup: BloodGroup;
  hasAllergies?: boolean;
  hasDiabetes?: boolean;
  height: string;
  weight: string;
  smokingStatus?: boolean;
  dietaryPreferences?: null;
  pregnancyStatus?: boolean;
  mentalHealthHistory?: null;
  immunizationStatus?: null;
  hasPastSurgeries?: boolean;
  recentAnxiety?: boolean;
  recentDepression?: boolean;
  maritalStatus?: MaritalStatus;
};

type TMedicalReport = {
  reportName: string;
  reportLink: string;
};

export type TPatientUpdate = {
  name?: string;
  address?: string;
  patientHealthData: TPatientHealthData;
  medicalReport: TMedicalReport;
};
