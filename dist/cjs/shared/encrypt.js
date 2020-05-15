"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = void 0;
/**
 * **encrypt**
 *
 * Encrypts a function and it's _context_ so it may be passed along in a more secure manner to
 * future functions. Note that this encryption is not meant to be industrial strength but rather
 * just a simple counter measure to discourage downstream functions from injecting malicious
 * replacement functions. This risk, however, is best addressed by strong
 *
 * @param input the plain-text string representing a function and it's context
 */
function encrypt(input) {
    return input;
}
exports.encrypt = encrypt;
//# sourceMappingURL=encrypt.js.map