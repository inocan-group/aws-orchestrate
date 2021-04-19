"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAwsProfileList = void 0;
const index_1 = require("../index");
const readFile_1 = require("../readFile");
/**
 * Interogates the `~/.aws/credentials` file to get a hash of
 * profiles (name/dictionary of values) the user has available.
 */
async function getAwsProfileList() {
    try {
        const credentialsFile = index_1.hasAwsProfileCredentialsFile();
        if (!credentialsFile) {
            return false;
        }
        const data = await readFile_1.readFile(credentialsFile);
        const targets = ["aws_access_key_id", "aws_secret_access_key", "region"];
        // extracts structured information from the semi-structured
        // array of arrays
        const extractor = (agg, curr) => {
            let profileSection = "unknown";
            curr.forEach((lineOfFile) => {
                if (lineOfFile.slice(-1) === "]") {
                    profileSection = lineOfFile.slice(0, lineOfFile.length - 1);
                    agg[profileSection] = {};
                }
                targets.forEach((t) => {
                    if (lineOfFile.includes(t)) {
                        const [devnull, key, value] = lineOfFile.match(/\s*(\S+)\s*=\s*(\S+)/);
                        agg[profileSection][key] = value;
                    }
                });
            });
            return agg;
        };
        const credentials = data
            .split("[")
            .map((i) => i.split("\n"))
            .reduce(extractor, {});
        return credentials;
    }
    catch (e) {
        return {};
    }
}
exports.getAwsProfileList = getAwsProfileList;
