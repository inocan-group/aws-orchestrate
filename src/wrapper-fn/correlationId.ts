let correlationId: string;

/**
 * Saves the `correlationId` for easy retrieval across various functions
 */
export function setCorrelationId(id: string) {
  correlationId = id;
}

/**
 * Gets the `correlationId` for a running sequence (or an
 * API Gateway request where the client sent in one)
 */
export function getCorrelationId() {
  return correlationId;
}
