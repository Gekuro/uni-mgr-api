export interface CorrectEnv {
  API_PORT: string;
  MONGO_CONN_STR: string;
  MONGO_DB_NAME: string;
}

export function isEnvValid(env: object): asserts env is CorrectEnv {
  if (!env.hasOwnProperty("API_PORT"))
    throw new Error("missing .env variable: API_PORT");

  if (!env.hasOwnProperty("MONGO_CONN_STR"))
    throw new Error("missing .env variable: MONGO_CONN_STR");

  if (!env.hasOwnProperty("MONGO_DB_NAME"))
    throw new Error("missing .env variable: MONGO_DB_NAME");
}

export function isObjectUndefined(
  obj: object | undefined
): asserts obj is object {
  if (obj === undefined) throw new Error("object is undefined");
}
