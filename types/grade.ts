export type FinalGrade = {
  studentId: string;
  courseId: string;
  points: number;
  final: boolean;
};

export type NamedActivityGrade = {
  studentId: string;
  courseId: string;
  points: number;
  name: string;
};

export type Grade = FinalGrade | NamedActivityGrade;

export type GradeInput = {
  studentId: string;
  courseId: string;
  points: number;
  name?: string;
  final?: boolean;
};
