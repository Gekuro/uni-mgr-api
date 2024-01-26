import { Store } from "../../data/store";

const PERSON_UUID_LEN = 6;
const COURSE_UUID_LEN = 4;

const getRandomUUID = (length: number): string => {
  const chars = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890";
  let out = "";

  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return out;
};

export const getUnusedPersonUUID = async (): Promise<string> => {
  const store = Store.getStore();
  while (true) {
    const UUID = getRandomUUID(PERSON_UUID_LEN);
    if ((await store.persons.findOne({ UUID })) === null) return UUID;
  }
};

export const getUnusedCourseUUID = async (): Promise<string> => {
  const store = Store.getStore();
  while (true) {
    const UUID = getRandomUUID(COURSE_UUID_LEN);
    if ((await store.courses.findOne({ UUID })) === null) return UUID;
  }
};
