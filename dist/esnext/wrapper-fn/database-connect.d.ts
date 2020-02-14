import { DB } from "abstracted-admin";
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
export declare const database: (config?: import("abstracted-firebase").IFirebaseAdminConfig) => Promise<DB>;
