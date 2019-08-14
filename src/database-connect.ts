let _database: import("abstracted-admin").DB;
type IFirebaseConfig = import("abstracted-firebase").IFirebaseAdminConfig;

/**
 * **database**
 *
 * Provides a convenient means to connect to the database which lives
 * outside the _handler_ function's main thread. This allows the connection
 * to the database to sometimes be preserved between function executions.
 *
 * This is loaded asynchronously and the containing code must explicitly
 * load the `abstracted-admin` library (as this library only lists it as
 * a devDep)
 */
export const database = async (config?: IFirebaseConfig) => {
  if (!_database) {
    const DB = (await import("abstracted-admin")).DB;
    _database = await DB.connect(config);
  }

  return _database;
};
