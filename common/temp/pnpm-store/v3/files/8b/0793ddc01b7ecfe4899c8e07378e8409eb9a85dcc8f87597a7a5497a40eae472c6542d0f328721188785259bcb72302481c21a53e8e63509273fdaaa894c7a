"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAwsCredentials = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function after(position, things, onUndefined) {
    if (things && things.length > 0) {
        return things.slice(position);
    }
    else {
        if (onUndefined) {
            onUndefined();
        }
        else {
            const e = new Error("first() was passed an empty array!");
            e.name = "EmptyArray";
            throw e;
        }
    }
}
/**
 * Uses a users "credentials" file to lookup region, access_key, access_secret
 *
 * @param profile the text name which serves as a lookup to the users ~/.aws/credentials file
 */
function getAwsCredentials(profile, directory) {
    const homedir = directory
        ? path.join(__dirname, directory)
        : path.join(require("os").homedir(), ".aws");
    const credentials = after(1, fs
        .readFileSync(`${homedir}/credentials`, { encoding: "utf-8" })
        .split("[")
        .map(i => i.split("\n"))
        .filter(i => i[0].slice(0, i[0].length - 1) === profile)
        .pop());
    const credentialsObj = {
        accessKeyId: "",
        secretAccessKey: ""
    };
    credentials.map(i => {
        if (i.includes("aws_access_key_id")) {
            credentialsObj.accessKeyId = i.replace(/.*aws_access_key_id\s*=\s*/, "");
        }
        if (i.includes("aws_secret_access_key")) {
            credentialsObj.secretAccessKey = i.replace(/.*aws_secret_access_key\s*=\s*/, "");
        }
        if (i.includes("region")) {
            credentialsObj.region = i.replace(/.*region\s*=\s*/, "");
        }
    });
    return credentialsObj;
}
exports.getAwsCredentials = getAwsCredentials;
//# sourceMappingURL=getAwsCredentials.js.map