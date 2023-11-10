"use strict";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { CorrectEnv, isTokenBodyValid } from "../types/validators";
import { FastifyRequest, RouteOptions } from "fastify";
import { ServerContext } from "../types/context";
import { Accounts, Persons } from "../data/dataHandler";

const env = process.env as unknown as CorrectEnv; // vaildated in main.ts
const DIGITS = "1234567890";
const SPECIAL_CHARACTERS = "!@#$%^&*?<>(){}[]:;'\"\\";
const LETTERS = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";

export const register = async (
  UUID: string,
  password: string
): Promise<void> => {
  if (!isPasswordAllowed(password)) throw new Error("password is not allowed");

  const account = await Accounts.collection.findOne({ UUID });
  const person = await Persons.collection.findOne({ UUID });

  if (account !== null)
    throw new Error("account associated with this UUID already exists");
  if (person === null)
    throw new Error("person associated with this UUID doesn't exist");

  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  await Accounts.collection.insertOne({ UUID, passwordHash });
};

export const readTokenIntoContext = async (
  req: FastifyRequest
): Promise<ServerContext> => {
  if (!req.headers["authorization"]) {
    return {};
  }

  try {
    const token = req.headers["authorization"].split(" ")[1];

    let decoded = jwt.verify(token, env.SESSION_SECRET);
    isTokenBodyValid(decoded);
    return {
      UUID: decoded.UUID,
    };
  } catch (err) {
    return {};
  }
};

const isPasswordAllowed = (password: string): boolean => {
  // Password should be between 7 and 20 characters,
  // should include at least one letter, digit and special character,
  // and cannot include emojis and the like.
  const containsOneOf = (str: string, chars: string): boolean => {
    for (let letter of str) {
      if (chars.includes(letter)) return true;
    }
    return false;
  };

  for (let letter of password) {
    if (
      !DIGITS.includes(letter) &&
      !SPECIAL_CHARACTERS.includes(letter) &&
      !LETTERS.includes(letter)
    )
      return false;
  }

  return (
    containsOneOf(password, DIGITS) &&
    containsOneOf(password, SPECIAL_CHARACTERS) &&
    containsOneOf(password, LETTERS) &&
    password.length <= 20 &&
    password.length >= 7
  );
};
