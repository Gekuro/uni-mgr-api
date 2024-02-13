"use strict";

import { Store } from "../data/store";
import { Activity, ActivityInput } from "../types/activity";
import { isActivityInputValid } from "../types/validators";

const finalActivityWithNameMsg =
  "Grade activity can either be final or it needs to have a name";

const concatActivityDetails = (
  activity: ActivityInput | Activity,
  msg: string
): string =>
  msg +
  `. Course: ${activity.courseId}, ${
    "final" in activity && activity.final !== null
      ? "Final grade."
      : `Name: ${activity.name}`
  }`;

const assertActivityDoesntExist = async (activity: Activity) => {
  const store = Store.getStore();
  const existingActivity = await store.activites.findOne({
    courseId: activity.courseId,
    ...("final" in activity
      ? { final: activity.final }
      : { name: activity.name }),
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
      throw new Error(finalActivityWithNameMsg);
    }
    const newActivity: Activity = activity as Activity; // TODO why doesn't TS narrow this type?
    assertActivityDoesntExist(newActivity);

    store.activites.insertOne(newActivity);
    return newActivity;
  },

  // addActivities(activity: [ActivityInput!]!): [Activity!]!
  // updateActivity(activity: ActivityInput!): Activity!
};
