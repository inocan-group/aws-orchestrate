/**
 * Saves the `correlationId` for easy retrieval across various functions
 */
export declare function setCorrelationId(id: string): void;
/**
 * Gets the `correlationId` for a running sequence (or an
 * API Gateway request where the client sent in one)
 */
export declare function getCorrelationId(): string;
