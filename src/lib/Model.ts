import { JsonDB } from "node-json-db";
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { createException } from './util';

type __Record = {
  __updatedAt: Date;
  __createdAt: Date;
}

export enum ModelExceptions {
  AttemptingToUpdateUnexistentRecord,
  AttemptingToCreateExistentRecord,
}


const read = <R>(db: JsonDB, path: string): R | null => {
  try {
    return <R>db.getData(path);
  } catch {
    return null;
  }
}

type CreateUpdate = <R>(db: JsonDB, path: string, record: R) => void;

// Replaces old record
const create: CreateUpdate = (db, path, record) => {
  db.push(path, {
    ...record,
    __createdAt: new Date(),
    __updatedAt: new Date(),
  });
}

const update: CreateUpdate = (db, path, existentRecord) => {
  const prev = read<__Record>(db, path);

  if (!prev) {
    throw ModelExceptions.AttemptingToUpdateUnexistentRecord;
  }

  const { __updatedAt: __prevUpdatedAt, __createdAt, ...prevWithoutMeta } = prev;

  // TODO: Check if the stringify actually respects order, or do I need to do 
  //  a deep lookup or use a different diffing method
  const prevHash = JSON.stringify(prevWithoutMeta);
  const nextHash = JSON.stringify(existentRecord);

  db.push(path, {
    ...existentRecord,
    __createdAt,

    // Reset the updatedAt only if the hashes are different
    __updatedAt: (prevHash === nextHash) ? __prevUpdatedAt : new Date(),
  });
}

const createOrUpdate: CreateUpdate = (db, path, record) => {
  const prev = read<__Record>(db, path);

  if (prev) {
    update(db, path, record);
  } else {
    create(db, path, record);
  }
}

const createOrFailOnUpdate = <R>(db: JsonDB, path: string, record: R) => {
  const prev = read<R & __Record>(db, path);

  if (prev) {
    throw ModelExceptions.AttemptingToCreateExistentRecord;
  }

  create(db, path, record);
}

export class Model<R> {
  private db: JsonDB;
  private path: string;
  private keyExtractor: (r: R) => string;

  constructor({ name, path = `/${name}`, keyExtractor }: {
    name: string;
    keyExtractor: (r: R) => string;
    path?: string;
  }) {
    this.db = new JsonDB(new Config(`./db/${name}`, true, true, '/'));
    this.path = path;
    this.keyExtractor = keyExtractor;
  }

  read(key: string) {
    read<R>(this.db, `${this.path}/${key}`)
  }

  createOrUpdate(record: R, key: string = this.keyExtractor(record)) {
    return createOrUpdate(this.db, `${this.path}/${key}`, record);
  }

  createOrFailOnUpdate(record: R, key: string = this.keyExtractor(record)) {
    return createOrFailOnUpdate(this.db, `${this.path}/${key}`, record);
  }

  all() {
    return this.db.filter<R>(`${this.path}`, () => true) || [];
  }

  filter(cb: (r: R) => boolean) {
    return this.db.filter<R>(`${this.path}`, cb) || [];
  }

  map<T>(cb: (r: R) => T) {
    const res: T[] = [];

    // Hack: Make use of the provided method filer since this is the only iterator given
    this.db.filter<R>(`${this.path}`, (r) => {
      res.push(cb(r));

      // don't fill an extra array
      return false;
    });

    return res;
  }

  forEach(cb: (r: R) => void) {
    // Hack: Make use of the provided method filer since this is the only iterator given
    this.db.filter<R>(`${this.path}`, (r) => {
      cb(r);

      // don't fill an extra array
      return false;
    });
  }

  find(cb: (r: R) => boolean) {
    return this.db.find<R>(`${this.path}`, cb)
  }

}
