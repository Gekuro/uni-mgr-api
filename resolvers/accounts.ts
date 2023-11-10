"use strict";

import { register } from "../auth/auth";
import { Persons, Accounts } from "../data/dataHandler";
import { Account, RegisterStatus } from "../types/account";
import { ServerContext } from "../types/context";
import { Person } from "../types/person";

type AccountGQLReply = Omit<Account, "passwordHash">;

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

  registerAccount: async (
    _: unknown,
    { UUID, password }: { UUID: string; password: string }
  ): Promise<RegisterStatus> => {
    try {
      await register(UUID, password);
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

    return person;
  },
};
