"use strict";

import { Store } from "../data/store";
import { Activity, ActivityInput } from "../types/activity";
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
  const existingActivity = await store.activites.findOne({
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
    const cursor = store.activites.find({ courseId });

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

    const newActivity: Activity = {
      courseId: activity.courseId,
      limit: activity.limit,
      final: activity.final ?? false,
      ...(!activity.final && { name: activity.name }),
    };
    await assertActivityDoesntExist(newActivity);

    store.activites.insertOne(newActivity);
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

    store.activites.insertMany(newActivities);
    return newActivities;
  },

  updateActivity: async (
    _: unknown,
    { activity }: { activity: ActivityInput }
  ): Promise<Activity | null> => {
    const store = Store.getStore();

    if (!isActivityInputValid(activity)) throw new Error(invalidActivity);

    const result = await store.activites.findOneAndUpdate(
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
};
