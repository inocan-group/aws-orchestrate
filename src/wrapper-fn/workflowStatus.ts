import { WorkflowStatus } from "./wrapper-types";

let workflowStatus: WorkflowStatus;

export function setWorkflowStatus(status: WorkflowStatus) {
  workflowStatus = status;
}

export function getWorkflowStatus(): WorkflowStatus {
  return workflowStatus;
}
