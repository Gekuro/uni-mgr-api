export type FinalGradeActivity = {
  courseId: string;
  limit: number;
  final: boolean;
};

export type NamedActivity = {
  courseId: string;
  limit: number;
  name: string;
};

export type Activity = FinalGradeActivity | NamedActivity;

export type ActivityInput = {
  courseId: string;
  limit: number;
  name?: string;
  final?: boolean;
};
