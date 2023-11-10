export type Account = {
  UUID: string;
  passwordHash: string;
};

export type RegisterStatus = {
  success: boolean;
  error?: string;
};

export type Credentials = {
  UUID: string;
  password: string;
};

export type TokenHeader = {
  Authorization: `Bearer ${string}`;
};

export type LoginStatus = { token: TokenHeader } | { error: string };

export type AccountGQLReply = Omit<Account, "passwordHash">;
