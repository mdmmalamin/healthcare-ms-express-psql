export type TDoctorFilterRequest = {
  searchTerm?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  gender?: string | undefined;
  specialties?: string | undefined;
};

export type TDoctorSpecialties = { specialtiesId: string; isDeleted: boolean };
