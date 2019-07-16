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

export const getModel = (name: string, dirPath = './db') => {
  const db = new JsonDB(new Config(`${dirPath}/${name}`, true, true, '/'));

  return {
    read: <R>(path: string): R | null => read(db, path),
    createOrUpdate: <R>(path: string, record: R) => createOrUpdate(db, path, record),
  }
}