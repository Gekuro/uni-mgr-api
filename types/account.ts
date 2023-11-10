export type Account = {
  UUID: string;
  passwordHash: string;
};

export type RegisterStatus = {
  success: boolean;
  error?: string;
};
