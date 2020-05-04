"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_log_1 = require("aws-log");
const abstracted_admin_1 = require("abstracted-admin");
const private_1 = require("../private");
let _database;
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
exports.database = async (config) => {
    const log = aws_log_1.logger().reloadContext();
    if (!_database) {
        if (!config) {
            if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_DATA_ROOT_URL) {
                log.debug(`The environment variables are in place to configure database connectivity`, {
                    firebaseDataRootUrl: process.env.FIREBASE_DATA_ROOT_URL,
                });
            }
            else {
                const { firebase } = await private_1.getSecrets(["firebase"]);
                if (!firebase) {
                    throw new Error(`The module "firebase" was not found in SSM; Firebase configuration could not be established`);
                }
                if (!firebase.SERVICE_ACCOUNT) {
                    throw new Error(`The module "firebase" was found but it did not have a `);
                }
                log.debug(`The Firebase service account has been retrieved from SSM and will be used.`);
                config = {
                    serviceAccount: firebase.SERVICE_ACCOUNT,
                    databaseUrl: firebase.DATABASE_URL,
                };
            }
        }
        _database = await abstracted_admin_1.DB.connect(config);
    }
    return _database;
};
//# sourceMappingURL=database-connect.js.map