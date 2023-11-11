"use strict";

import { IResolvers } from "npm:mercurius";

import persons from "./persons.ts";
import courses from "./courses.ts";
import accounts from "./accounts.ts";

const resolvers: IResolvers = {
  Query: {
    person: persons.getPerson,
    persons: persons.getPersons,

    course: courses.getCourse,
    courses: courses.getCourses,

    account: accounts.getAccount,
    accounts: accounts.getAccounts,
    self: accounts.getSelf,
    login: accounts.login,
  },
  Mutation: {
    addPerson: persons.addPerson,
    addPersons: persons.addPersons,
    updatePerson: persons.updatePerson,

    addCourse: courses.addCourse,
    addCourses: courses.addCourses,
    updateCourse: courses.updateCourse,

    registerAccount: accounts.registerAccount,
  },
  Person: {
    attending: persons.attendingField,
    lecturing: persons.lecturingField,
  },
  Course: {
    lecturer: courses.lecturerField,
    students: courses.studentsField,
  },
  Account: {
    personalData: accounts.personalData,
  },
};

export default resolvers;
