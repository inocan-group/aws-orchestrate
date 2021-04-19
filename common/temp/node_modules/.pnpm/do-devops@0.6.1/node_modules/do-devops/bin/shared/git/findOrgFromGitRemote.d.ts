/**
 * Looks in the **git** remotes and -- favoring "origin" -- trys to determine
 * what the organization or user the repo is published under. If there are no remotes, or there
 * is any other failure to find the org name this function will return `false`.
 */
export declare function findOrgFromGitRemote(baseDir?: string): Promise<string | false>;
