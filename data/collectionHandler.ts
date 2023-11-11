import { Collection, Db } from "npm:mongodb";

export class CollectionHandler<T extends object> {
  constructor(db: Db, name: string) {
    this.collection = db.collection<T>(name);
  }

  public collection: Collection<T>;
}
