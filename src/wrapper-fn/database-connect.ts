import { logger } from "aws-log";
import { IAdminConfig, IMockConfig, IRealTimeAdmin, RealTimeAdmin } from "universal-fire";

import { getSecrets } from "../private";

let _database: IRealTimeAdmin

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
export const database = async (config?: IAdminConfig | IMockConfig) => {
  const log = logger().reloadContext();
  let serviceAccount: string = process.env.FIREBASE_SERVICE_ACCOUNT;
  let databaseURL: string = process.env.FIREBASE_DATABASE_URL || process.env.FIREBASE_DATA_ROOT_URL;

  if (!_database) {
    if (!config) {
      if (serviceAccount && databaseURL) {
        config = { serviceAccount, databaseURL };
        log.debug(`Environment variables were used to configure Firebase's Admin SDK`, { databaseURL });
      } else {
        const { firebase } = await getSecrets(["firebase"]);
        if (!firebase) {
          throw new Error(
            `After checking ENV variables, the SSM module "firebase" was not found. Firebase configuration could not be established!`
          );
        }
        config = {
          serviceAccount: serviceAccount || firebase.SERVICE_ACCOUNT,
          databaseURL: databaseURL || firebase.DATABASE_URL,
        };
        if (!config.serviceAccount) {
          throw new Error(`The Firebase service account could not be found in ENV or SSM variables!`);
        }
        if (!config.databaseURL) {
          throw new Error(`The Firebase database URL could not be found in ENV or SSM variables!`);
        }
        log.debug(`A combination of ENV and SSM variables was used to configure Firebase's Admin SDK`);
      }
    }

    _database = await RealTimeAdmin(config);
  }

  return _database;
};
