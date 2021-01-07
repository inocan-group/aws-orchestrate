import { getNewSequence, ILoggedMessages } from "..";
import { setWorkflowStatus } from "../wrapper-fn/workflowStatus";

/**
 * Manages running a wrapped handler function through the
 * workflow of a LambdaSequence.
 */
export async function manageSequence(msg: ILoggedMessages, log, req, ctx) {
  // #region CALL the HANDLER FUNCTION
  setWorkflowStatus("running-function");
  result = await fn(request, handlerContext);
  log.debug(`handler function returned to wrapper function`, { result });
  setWorkflowStatus("function-complete");
  // #endregion CALL the HANDLER FUNCTION

  //#region SEQUENCE (next)
  if (sequence.isSequence && !sequence.isDone) {
    setWorkflowStatus("invoke-started");
    const [fn, requestBody] = sequence.next<O>(result);
    msg.startingInvocation(fn, requestBody);
    const invokeParams = await invoke(fn, requestBody);
    msg.completingInvocation(fn, invokeParams);
    setWorkflowStatus("invoke-complete");
  } else {
    msg.notPartOfExistingSequence();
  }
  //#endregion

  //#region SEQUENCE (orchestration starting)
  if (getNewSequence().isSequence) {
    setWorkflowStatus("sequence-starting");
    msg.sequenceStarting();
    const seqResponse = await invokeNewSequence(result);
    msg.sequenceStarted(seqResponse);
    setWorkflowStatus("sequence-started");
  } else {
    msg.notPartOfNewSequence();
  }
  //#endregion

  //#region SEQUENCE (send to tracker)
  if (options.sequenceTracker && sequence.isSequence) {
    setWorkflowStatus("sequence-tracker-starting");
    msg.sequenceTracker(options.sequenceTracker, getWorkflowStatus());
    await invokeLambda(
      options.sequenceTracker,
      buildOrchestratedRequest<ISequenceTrackerStatus>(status(sequence))
    );
    if (sequence.isDone) {
      msg.sequenceTrackerComplete(true);
    } else {
      msg.sequenceTrackerComplete(false);
    }
  }
  //#endregion
}
