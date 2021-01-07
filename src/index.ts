// #autoindex

// #region autoindexed files

// index last changed at: 1st Jan, 2021, 04:31 PM ( GMT-8 )
// export: named; exclusions: index, private.
// files: @types, LambdaEventParser, LambdaSequence, wrapper.
// directories: errors, exported-functions, invoke, sequences, shared.

// local file exports
export * from './@types'
export * from './LambdaEventParser'
export * from './LambdaSequence'
export * from './wrapper'

// directory exports
export * from './errors/index'
export * from './exported-functions/index'
export * from './invoke/index'
export * from './sequences/index'
export * from './shared/index'

// there were directories orphaned: wrapper-fn

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
// files: @types, LambdaEventParser, LambdaSequence, wrapper.
// directories: errors, exported-functions, invoke, sequences, shared, wrapper-fn.

// local file exports
export {  default as @types} from "./@types";
export {  default as LambdaEventParser} from "./LambdaEventParser";
export {  default as LambdaSequence} from "./LambdaSequence";
export {  default as wrapper} from "./wrapper";

// directory exports
export * from "./errors/index";
export * from "./exported-functions/index";
export * from "./invoke/index";
export * from "./sequences/index";
export * from "./shared/index";
export * from "./wrapper-fn/index";

//#endregion