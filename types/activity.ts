export type Activity = {
  courseId: string;
  limit: number;
  final: boolean;
  name?: string;
};

export type ActivityInput = {
  courseId: string;
  limit: number;
  name?: string;
  final?: boolean;
};
