"use strict";

import { IResolvers } from "mercurius";

import persons from "./persons";
import courses from "./courses";
import accounts from "./accounts";

const resolvers: IResolvers = {
  Query: {
    person: persons.getPerson,
    persons: persons.getPersons,

    course: courses.getCourse,
    courses: courses.getCourses,

    account: accounts.getAccount,
    accounts: accounts.getAccounts,
    self: accounts.getSelf,
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
