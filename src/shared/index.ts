// #autoindex

// #region autoindexed files

// index last changed at: 1st Jan, 2021, 05:36 PM ( GMT-8 )
// export: named; exclusions: index, private.
// files: decrypt, deserialize, encrypt, ensureFunctionName, serialize.

// local file exports
export * from "./decrypt";
export * from "./deserialize";
export * from "./encrypt";
export * from "./ensureFunctionName";
export * from "./serialize";

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
// files: decrypt, deserialize, encrypt, ensureFunctionName, serialize.

// local file exports
export {  default as decrypt} from "./decrypt";
export {  default as deserialize} from "./deserialize";
export {  default as encrypt} from "./encrypt";
export {  default as ensureFunctionName} from "./ensureFunctionName";
export {  default as serialize} from "./serialize";

//#endregion