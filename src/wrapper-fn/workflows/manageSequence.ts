import { IWrapperOptions } from "../../@types";
import {
  getNewSequence,
  getWorkflowStatus,
  ILoggedMessages,
  invokeNewSequence,
  setWorkflowStatus
} from "..";
import { LambdaSequence } from "../../LambdaSequence";
import { invoke } from "../../invoke";
import { buildOrchestratedRequest, sequenceStatus } from "../../sequences";
import { ISequenceTrackerStatus } from "../../exported-functions";

/**
 * Manages running a wrapped handler function through the
 * workflow of a LambdaSequence. If this function is not
 * being managed as part of sequence, it will return gracefully.
 */
export async function manageSequence<O>(
  sequence: LambdaSequence,
  result: Readonly<O>,
  correlationId: string,
  msg: ILoggedMessages,
  options: IWrapperOptions
): Promise<void> {
  // #region SEQUENCE (next)
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
  // #endregion

  // #region SEQUENCE (orchestration starting)
  if (getNewSequence().isSequence) {
    setWorkflowStatus("sequence-starting");
    msg.sequenceStarting();
    const seqResponse = await invokeNewSequence(result);
    msg.sequenceStarted(seqResponse);
    setWorkflowStatus("sequence-started");
  } else {
    msg.notPartOfNewSequence();
  }
  // #endregion

  // #region SEQUENCE (send to tracker)
  if (options.sequenceTracker && sequence.isSequence) {
    setWorkflowStatus("sequence-tracker-starting");
    const status = sequenceStatus(correlationId);
    msg.sequenceTracker(options.sequenceTracker, getWorkflowStatus());
    await invoke(
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
