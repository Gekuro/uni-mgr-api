export type Grade = {
  studentId: string;
  courseId: string;
  points: number;
  final: boolean;
  name?: string;
};

export type GradeInput = {
  studentId: string;
  courseId: string;
  points: number;
  final?: boolean;
  name?: string;
};
