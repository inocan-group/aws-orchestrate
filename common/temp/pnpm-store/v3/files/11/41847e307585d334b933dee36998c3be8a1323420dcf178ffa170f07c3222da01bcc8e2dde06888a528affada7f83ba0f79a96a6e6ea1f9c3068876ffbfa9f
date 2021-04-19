"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVersionNumber = void 0;
const SsmError_1 = require("./SsmError");
function checkVersionNumber(parts) {
    if (Number.isNaN(Number(parts[1]))) {
        throw new SsmError_1.SsmError(`aws-ssm/invalid-format`, `You appear to be using a fully-qualified naming convension with the name "${parts.join("/")}" but the version specified [ ${parts[1]} ] is not a valid number!`);
    }
}
exports.checkVersionNumber = checkVersionNumber;
//# sourceMappingURL=checkVersionNumber.js.map