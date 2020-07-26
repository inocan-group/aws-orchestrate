import { wrapper, getSecrets } from "../private";
export const SequenceTrackerConfig = {
    description: `Allows writing the status of LambdaSequence's to Firebase to open up the possibility of providing functional HTTP statuses`,
};
const fn = async (event, context) => {
    const firebaseModule = event.firebaseSecretLocation || "firebase/SERVICE_ACCOUNT";
    const secrets = await getSecrets([firebaseModule]);
    const db = await context.database(secrets.firebase.SERVICE_ACCOUNT);
    const stage = process.env.AWS_STAGE || process.env.NODE_ENV;
    if (!stage) {
        throw new Error(`The "stage" could not be determined; set the AWS_STAGE or NODE_ENV environment variables!`);
    }
    const databasePath = `aws-orchestrate/${stage}/${event.status.correlationId}`;
    await db.set(databasePath, event.status);
    return event.status;
};
/**
 * This function is provided as an _export_ for consumers to use
 * in situations where their handler functions are involved in a
 * `LambdaSequence` and the entry point to the sequence is an **API Gateway**
 * endpoint.
 *
 * The goal of this function is to track -- _step_ by _step_ -- the sequence being
 * executed and eventually to arrive at either a successful or error state. This
 * tracking "state" will be written to the Firebase database so that the frontend/caller
 * of the endpoint can _watch_ this database path to gain a _functional_ understanding
 * of the outcome of the endpoint (rather than just a response that the sequence has
 * been started).
 *
 * To ensure this serverless function is engaged be sure that all handler functions
 * which are starting a `LambdaSequence` wrap themselves with the following option:
 *
 * ```typescript
 * export handler = wrapper(fn, { archiveTracker: "myFunction" })
 * ```
 *
 * where `myFunction` is the AWS _arn_ for **this** function. The _arn_ can be a
 * partial arn so long as you are using the appropriate ENV variables to activate
 * partial arns.
 *
 * For more information see the docs at:
 * [SequenceTracker](aws-orchestrate.netlify.com/transaction#SequenceTracker)
 */
export const SequenceTracker = wrapper(fn);
//# sourceMappingURL=SequenceTracker.js.map