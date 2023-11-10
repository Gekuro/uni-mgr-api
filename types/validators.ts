import jwt from "jsonwebtoken";
import { Credentials } from "./account";

export interface CorrectEnv {
  API_PORT: string;
  MONGO_CONN_STR: string;
  MONGO_DB_NAME: string;
  SESSION_SECRET: string;
  EXPIRES_IN: string;
}

export interface CorrectJWT extends jwt.JwtPayload {
  UUID: string;
}

export function isEnvValid(env: object): asserts env is CorrectEnv {
  [
    "API_PORT",
    "MONGO_CONN_STR",
    "MONGO_DB_NAME",
    "SESSION_SECRET",
    "EXPIRES_IN",
  ].forEach((key: string) => {
    if (!env.hasOwnProperty(key))
      throw new Error(`missing .env variable: ${key}`);
  });
}

export function isObjectUndefined(
  obj: object | undefined
): asserts obj is object {
  if (obj === undefined) throw new Error("object is undefined");
}

export function isTokenBodyValid(
  token: string | jwt.JwtPayload
): asserts token is CorrectJWT {
  const invTokenError = new Error("invalid token");

  if (typeof token === "string") throw invTokenError;
  if (!token.hasOwnProperty("UUID")) throw invTokenError;
}

export function isCredentialsObjValid(
  body: unknown
): asserts body is Credentials {
  const invCredentialsObj = new Error("invalid credentials");

  if (typeof body !== "object" || body === null) throw invCredentialsObj;
  if (!body.hasOwnProperty("UUID") || !body.hasOwnProperty("password"))
    throw invCredentialsObj;
}
