// #autoindex

// #region autoindexed files

// index last changed at: 1st Jan, 2021, 05:33 PM ( GMT-8 )
// export: named; exclusions: index, private.
// files: CallDepthExceeded, ErrorHandler, ErrorMeta, ErrorWithinError, HandledError, LambdaError, RethrowError, ServerlessError, UnhandledError, convertToApiGatewayError.

// local file exports
export * from "./CallDepthExceeded";
export * from "./ErrorHandler";
export * from "./ErrorMeta";
export * from "./ErrorWithinError";
export * from "./HandledError";
export * from "./LambdaError";
export * from "./RethrowError";
export * from "./ServerlessError";
export * from "./UnhandledError";
export * from "./convertToApiGatewayError";

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

//#region autoindexed files

// index last changed at: 1st Jan, 2021, 01:14 PM ( GMT-8 )
// export: default; exclusions: foo, bar, baz, index, private.
// files: ErrorHandler, ErrorMeta, HandledError, ServerlessError, UnhandledError, convertToApiGatewayError.

// local file exports
export {  default as ErrorHandler} from "./ErrorHandler";
export {  default as ErrorMeta} from "./ErrorMeta";
export {  default as HandledError} from "./HandledError";
export {  default as ServerlessError} from "./ServerlessError";
export {  default as UnhandledError} from "./UnhandledError";
export {  default as convertToApiGatewayError} from "./convertToApiGatewayError";

//#endregion