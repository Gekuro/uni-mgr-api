"use strict";

import jwt from "npm:jsonwebtoken";
import bcrypt from "npm:bcryptjs";

import { register } from "../auth/auth.ts";
import { Persons, Accounts } from "../data/dataHandler.ts";
import {
  AccountGQLReply,
  Credentials,
  LoginStatus,
  RegisterStatus,
} from "../types/account.ts";
import { ServerContext } from "../types/context.ts";
import { Person } from "../types/person.ts";

const wrongCredentials = new Error("UUID or password are invalid");

export default {
  getAccount: async (
    _: unknown,
    { UUID }: { UUID: string }
  ): Promise<AccountGQLReply | null> => {
    return await Accounts.collection.findOne(
      { UUID: UUID },
      { projection: { passwordHash: 0 } }
    );
  },

  getAccounts: async (): Promise<AccountGQLReply[]> => {
    const cursor = Accounts.collection.find();

    const accounts: AccountGQLReply[] = [];
    for await (const account of cursor) {
      accounts.push(account);
    }

    return accounts;
  },

  getSelf: async (
    _root: unknown,
    _params: unknown,
    ctx: ServerContext
  ): Promise<AccountGQLReply | null> => {
    if (!ctx.UUID) return null;

    return await Accounts.collection.findOne(
      { UUID: ctx.UUID },
      { projection: { passwordHash: 0 } }
    );
  },

  login: async (
    _: unknown,
    { credentials }: { credentials: Credentials }
  ): Promise<LoginStatus> => {
    try {
      const account = await Accounts.collection.findOne({
        UUID: credentials.UUID,
      });
      if (account === null) throw wrongCredentials;

      if (!(await bcrypt.compare(credentials.password, account.passwordHash)))
        throw wrongCredentials;

      const token = jwt.sign(
        { UUID: credentials.UUID },
        Deno.env.get("SESSION_SECRET")!,
        {
          expiresIn: Deno.env.get("EXPIRES_IN")!,
        }
      );

      return {
        token: { Authorization: `Bearer ${token}` },
      };
    } catch (err) {
      return { error: `${err}` };
    }
  },

  registerAccount: async (
    _: unknown,
    { credentials }: { credentials: Credentials }
  ): Promise<RegisterStatus> => {
    try {
      await register(credentials.UUID, credentials.password);
      return { success: true };
    } catch (err) {
      return { success: false, error: `${err}` };
    }
  },

  personalData: async (root: AccountGQLReply): Promise<Person> => {
    const person = (await Persons.collection.findOne({
      UUID: root.UUID,
    })) as Person;
    // accounts can only be registered for existing persons, so this will never be null
    // unless the db was manually tampered with

    return person;
  },
};
