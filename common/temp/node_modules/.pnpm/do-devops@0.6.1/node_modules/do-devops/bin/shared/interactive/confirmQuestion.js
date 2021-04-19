"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmQuestion = void 0;
/**
 * A helpful low-level primative that returns a valid "confirm" based question
 * that may then be asked using the **Inquirer** npm package.
 *
 * This primitive can be combined with the generic `ask` function like so:
 *
 * ```typescript
 * const answer = ask(confirmQuestion({name: 'continue', message: 'should we continue?' }));
 * if(answer.continue) { ... }
 * ```
 *
 * @param q the question parameters for a confirm question. Typically you'll want to set
 * at least the `name` and maybe the `message`.
 */
const confirmQuestion = (q) => {
    return {
        ...q,
        type: "confirm",
    };
};
exports.confirmQuestion = confirmQuestion;
