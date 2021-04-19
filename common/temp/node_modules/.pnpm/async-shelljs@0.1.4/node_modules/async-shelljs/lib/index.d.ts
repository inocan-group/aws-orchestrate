import { ExecOptions } from "shelljs";
export { cat, cd, chmod, cp, pushd, popd, dirs, echo, exec, find, grep, ln, ls, mkdir, mv, pwd, rm, sed, set, tempdir, test, touch, which, exit, error, env, config, ShellString, ExecOptions, ExecOutputReturnValue, ShellArray, ShellReturnValue } from "shelljs";
export interface IExecFunctionOptions extends ExecOptions {
    silent?: boolean;
    async?: false;
}
export declare function asyncExec(command: string, options?: IExecFunctionOptions): Promise<string>;
