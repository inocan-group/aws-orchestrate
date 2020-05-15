import { DB } from "abstracted-admin";
declare type IFirebaseConfig = import("abstracted-firebase").IFirebaseAdminConfig;
/**
 * **database**
 *
 * Provides a convenient means to connect to the database which lives
 * outside the _handler_ function's main thread. You _can_ pass in a
 * **Firebase** configuration if you want but the only two things which
 * are needed for the Admin API is a "service account" and a "database URL"
 * so more typically you'll set these as ENV variables and/or you can just
 * let this function retrieve the _secrets_ from SSM for you.
 *
 * If you want to have this function configure the connection for you please
 * just use the following naming convention:
 *
 * 1. For the **service account**:
 *    - for ENV: `FIREBASE_SERVICE_ACCOUNT`
 *    - for SSM: `/[version]/[stage]/firebase/SERVICE_ACCOUNT`
 * 2. For the **database URL** -- due to historical reasons -- there are two ENV names which will work:
 *    - for ENV: `FIREBASE_DATA_ROOT_URL` or `FIREBASE_DATABASE_URL`
 *    - for SSM: `/[version]/[stage]/firebase/DATABASE_URL`
 *
 * > Note that `FIREBASE_DATABASE_URL` is preferred over `FIREBASE_DATA_ROOT_URL` for ENV naming
 */
export declare const database: (config?: IFirebaseConfig) => Promise<DB>;
export {};
