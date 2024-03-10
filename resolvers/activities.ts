"use strict";

import { Store } from "../data/store";
import { Activity, ActivityInput } from "../types/activity";
import { Course } from "../types/course";
import { Grade } from "../types/grade";
import {
  isActivityInputArrayValid,
  isActivityInputValid,
} from "../types/validators";

const invalidActivity =
  "Grade activity can either be final or it needs to have a name";

const concatActivityDetails = (
  activity: ActivityInput | Activity,
  msg: string
): string =>
  msg +
  `. Course: ${activity.courseId}, ${
    activity.final ? "Final grade." : `Name: ${activity.name}`
  }`;

const assertActivityDoesntExist = async (activity: Activity) => {
  const store = Store.getStore();
  const existingActivity = await store.activities.findOne({
    courseId: activity.courseId,
    final: activity.final,
    ...(!activity.final && { name: activity.name }),
  });

  if (existingActivity)
    throw new Error(
      concatActivityDetails(activity, "Grade activity already exists.")
    );
};

export default {
  getCourseActivities: async (
    _: unknown,
    { courseId }: { courseId: string }
  ): Promise<Activity[]> => {
    const store = Store.getStore();
    const cursor = store.activities.find({ courseId });

    const activities: Activity[] = [];
    for await (const activity of cursor) {
      activities.push(activity);
    }

    return activities;
  },

  addActivity: async (
    _: unknown,
    { activity }: { activity: ActivityInput }
  ): Promise<Activity> => {
    const store = Store.getStore();
    if (!isActivityInputValid(activity)) {
      throw new Error(invalidActivity);
    }
    const delayedAssertion = assertActivityDoesntExist(activity);

    const newActivity: Activity = {
      courseId: activity.courseId,
      limit: activity.limit,
      final: activity.final ?? false,
      ...(!activity.final && { name: activity.name }),
    };

    await delayedAssertion;

    store.activities.insertOne(newActivity);
    return newActivity;
  },

  addActivities: async (
    _: unknown,
    { activities }: { activities: ActivityInput[] }
  ): Promise<Activity[]> => {
    const store = Store.getStore();
    if (!isActivityInputArrayValid(activities)) {
      throw new Error(invalidActivity);
    }

    const newActivities: Activity[] = [];
    const assertionPromises: Promise<void>[] = [];

    for (const activity of activities) {
      const newActivity: Activity = {
        courseId: activity.courseId,
        limit: activity.limit,
        final: activity.final ?? false,
        ...(!activity.final && { name: activity.name }),
      };
      assertionPromises.push(assertActivityDoesntExist(newActivity));
      newActivities.push(newActivity);
    }
    await Promise.all(assertionPromises);

    store.activities.insertMany(newActivities);
    return newActivities;
  },

  updateActivity: async (
    _: unknown,
    { activity }: { activity: ActivityInput }
  ): Promise<Activity | null> => {
    const store = Store.getStore();
    if (!isActivityInputValid(activity)) throw new Error(invalidActivity);

    const result = await store.activities.findOneAndUpdate(
      {
        courseId: activity.courseId,
        final: activity.final ?? false,
        ...(activity.final && { name: activity.name }),
      },
      {
        $set: {
          limit: activity.limit,
        },
      },
      {
        returnDocument: "after",
      }
    );

    return result;
  },

  courseField: async (root: Activity): Promise<Course | null> => {
    const store = Store.getStore();
    return store.courses.findOne({ UUID: root.courseId });
  },

  gradesField: async (root: Activity): Promise<Grade[]> => {
    const store = Store.getStore();
    const cursor = store.grades.find({
      courseId: root.courseId,
      final: root.final,
      ...(!root.final && { name: root.name }),
    });

    const grades: Grade[] = [];
    for await (const grade of cursor) {
      grades.push(grade);
    }

    return grades;
  },
};
