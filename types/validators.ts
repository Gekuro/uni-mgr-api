import jwt from "jsonwebtoken";
import { Credentials } from "./account";

export interface CorrectEnv {
  API_PORT: string;
  API_HOST: string;
  CORS_ENABLED: string;
  CORS_ENABLED_ORIGIN: string;
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
    "API_HOST",
    "CORS_ENABLED",
    "CORS_ENABLED_ORIGIN",
    "MONGO_CONN_STR",
    "MONGO_DB_NAME",
    "SESSION_SECRET",
    "EXPIRES_IN",
  ].forEach((key: string) => {
    if (!(key in env)) throw new Error(`missing .env variable: ${key}`);
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
  if (!("UUID" in token)) throw invTokenError;
}

export function isCredentialsObjValid(
  body: unknown
): asserts body is Credentials {
  const invCredentialsObj = new Error("invalid credentials");

  if (typeof body !== "object" || body === null) throw invCredentialsObj;
  if (!("UUID" in body) || !("password" in body)) throw invCredentialsObj;
}
