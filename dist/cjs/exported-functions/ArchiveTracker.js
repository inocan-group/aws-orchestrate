"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wrapper_1 = require("../wrapper");
/**
 * Usable as _inline-configuration_ of this function if using the
 * `serverless-microservices` yeoman template.
 */
exports.ArchiveTrackerConfig = {
    description: `Removes the SequenceTracker's status messages after they become stale`,
    events: [
        {
            schedule: {
                rate: "cron(0 1 * * *)"
            }
        }
    ]
};
const fn = async (request, context) => {
    // TODO: implement
};
/**
 * A Serverless handler function that can be added to an existing project
 * so that the Frontend's `transaction` helper can be used to request full
 * Sequence based response codes from an API endpoint instead of just getting
 * a response from the "Conductor" when a sequence kicks off.
 *
 * To use this you must add this function to your project and then when you
 * write serverless functions which are initiating a sequence (aka, a "conductor")
 * then you will define the wrapper like so:
 *
 * ```typescript
 * export handler = wrapper(fn, { archiveTracker: "myFunction" })
 * ```
 *
 * where `myFunction` is the AWS _arn_ for this function. The _arn_ can be a
 * partial arn so long as you are using the appropriate ENV variables to activate
 * partial arns.
 */
exports.handler = wrapper_1.wrapper(fn);
//# sourceMappingURL=ArchiveTracker.js.map