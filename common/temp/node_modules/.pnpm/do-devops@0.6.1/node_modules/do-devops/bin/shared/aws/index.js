"use strict";
// #autoindex:named
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// #region autoindexed files
// index last changed at: 10th Oct, 2020, 09:14 AM ( GMT-7 )
// export: named; exclusions: index, private.
// files: addAwsProfile, askForAwsProfile, askForAwsRegion, checkIfAwsInstalled, convertProfileToApiCredential, getApiGatewayEndpoints, getAwsIdentityFromProfile, getAwsProfile, getAwsProfileList, getAwsUserProfile, hasAwsCredentialsFile, userHasAwsProfile.
// local file exports
__exportStar(require("./addAwsProfile"), exports);
__exportStar(require("./askForAwsProfile"), exports);
__exportStar(require("./askForAwsRegion"), exports);
__exportStar(require("./checkIfAwsInstalled"), exports);
__exportStar(require("./convertProfileToApiCredential"), exports);
__exportStar(require("./getApiGatewayEndpoints"), exports);
__exportStar(require("./getAwsIdentityFromProfile"), exports);
__exportStar(require("./getAwsProfile"), exports);
__exportStar(require("./getAwsProfileList"), exports);
__exportStar(require("./getAwsUserProfile"), exports);
__exportStar(require("./hasAwsCredentialsFile"), exports);
__exportStar(require("./userHasAwsProfile"), exports);
// Note:
// -----
// This file was created by running: "do devops autoindex"; it assumes you have
// the 'do-devops' pkg installed as a dev dep.
//
// By default it assumes that exports are named exports but this can be changed by
// adding a modifier to the '// #autoindex' syntax:
//
//    - autoindex:named     same as default, exports "named symbols"
//    - autoindex:default   assumes each file is exporting a default export
//                          and converts the default export to the name of the
//                          file
//    - autoindex:offset    assumes files export "named symbols" but that each
//                          file's symbols should be offset by the file's name
//                          (useful for files which might symbols which collide
//                          or where the namespacing helps consumers)
//
// You may also exclude certain files or directories by adding it to the
// autoindex command. As an example:
//
//    - autoindex:named, exclude: foo,bar,baz
//
// Also be aware that all of your content outside the defined region in this file
// will be preserved in situations where you need to do something paricularly awesome.
// Keep on being awesome.
// #endregion
