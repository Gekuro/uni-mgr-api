import { Credentials } from "./account.ts";

export interface CorrectEnv {
  API_PORT: string;
  MONGO_CONN_STR: string;
  MONGO_DB_NAME: string;
  SESSION_SECRET: string;
  EXPIRES_IN: string;
}

export interface CorrectJWT {
  UUID: string;
}

export function isObjectUndefined(
  obj: object | undefined
): asserts obj is object {
  if (obj === undefined) throw new Error("object is undefined");
}

export function isTokenBodyValid(
  token: string | object
): asserts token is CorrectJWT {
  const invTokenError = new Error("invalid token");

  if (typeof token === "string") throw invTokenError;
  if (Object.prototype.hasOwnProperty.call(token, "UUID")) throw invTokenError;
}

export function isCredentialsObjValid(
  body: unknown
): asserts body is Credentials {
  const invCredentialsObj = new Error("invalid credentials");

  if (typeof body !== "object" || body === null) throw invCredentialsObj;
  if (
    Object.prototype.hasOwnProperty.call(body, "UUID") ||
    Object.prototype.hasOwnProperty.call(body, "password")
  )
    throw invCredentialsObj;
}
