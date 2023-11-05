export type Person = {
  UUID: string;
  name: string;
  surname: string;
  birthDate: string; // TODO construct literal type
  type: PersonType;
};

export enum PersonType {
  STUDENT,
  EMPLOYEE,
  DOCTOR,
  PROFESSOR,
  ADMINISTRATIVE,
}
