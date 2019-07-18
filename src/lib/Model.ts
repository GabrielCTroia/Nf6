import { JsonDB } from "node-json-db";
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';

type __Record = {
  __updatedAt: Date;
  __createdAt: Date;
}

const read = <R>(db: JsonDB, path: string): R | null => {
  try {
    return <R>db.getData(path);
  } catch {
    return null;
  }
}

const createOrUpdate = <R>(db: JsonDB, path: string, record: R) => {
  const prev = read<R & __Record>(db, path);

  if (prev) {

    const { __updatedAt: __prevUpdatedAt, __createdAt, ...prevWithoutMeta } = prev;

    // TODO: Check if the stringify actually respects order, or do I need to do 
    //  a deep lookup or use a different diffing method
    const prevHash = JSON.stringify(prevWithoutMeta);
    const nextHash = JSON.stringify(record);

    db.push(path, {
      ...record,
      __createdAt,

      // Reset the updatedAt only if the hashes are different
      __updatedAt: (prevHash === nextHash) ? __prevUpdatedAt : new Date(),
    });
  } else {
    db.push(path, {
      ...record,
      __createdAt: new Date(),
      __updatedAt: new Date(),
    });
  }
}

export const getModel = <R>({ name, path = `/${name}`, keyExtractor }: {
  name: string;
  keyExtractor: (r: R) => string;
  path?: string;
}) => {
  const db = new JsonDB(new Config(`./db/${name}`, true, true, '/'));

  return {
    read: (key: string) => read<R>(db, `${path}/${key}`),
    createOrUpdate: (record: R, key: string = keyExtractor(record)) => createOrUpdate(db, `${path}/${key}`, record),
    all: () => db.filter<R>(`${path}`, () => true) || [],
    filter: (cb: (r: R) => boolean) => db.filter<R>(`${path}`, cb) || [],
    map: <T>(cb: (r: R) => T) => {
      const res: T[] = [];

      // Hack: Make use of the provided method filer since this is the only iterator given
      db.filter<R>(`${path}`, (r) => {
        res.push(cb(r));

        // don't fill an extra array
        return false;
      });

      return res;
    },
    forEach: (cb: (r: R) => void) => {
      // Hack: Make use of the provided method filer since this is the only iterator given
      db.filter<R>(`${path}`, (r) => {
        cb(r);

        // don't fill an extra array
        return false;
      });
    },
    find: (cb: (r: R) => boolean) => db.find<R>(`${path}`, cb),
  }
}