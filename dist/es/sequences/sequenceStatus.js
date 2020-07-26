/**
 * A higher order function which first takes a `correlationId` and returns a function which provides
 * a simple status of the sequence.
 */
export const sequenceStatus = (correlationId) => 
/**
 * Reduces a sequence object to a simple "status" based representation
 */
(s, dataOrError) => {
    const status = s.isDone
        ? dataOrError instanceof Error
            ? "error"
            : "success"
        : "running";
    const response = {
        status,
        correlationId,
        currentFn: s.activeFn ? s.activeFn.arn : "",
        originFn: s.activeFn ? s.steps[0].arn : "",
        total: s.steps.length,
        current: s.completed.length
    };
    switch (status) {
        case "error":
            return { ...response, error: dataOrError };
        case "success":
            return { ...response, data: dataOrError };
        case "running":
            return response;
    }
};
//# sourceMappingURL=sequenceStatus.js.map