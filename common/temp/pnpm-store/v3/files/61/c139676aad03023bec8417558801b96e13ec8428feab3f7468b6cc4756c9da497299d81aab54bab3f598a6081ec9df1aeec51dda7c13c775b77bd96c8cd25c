import { CredentialsOptions } from "aws-sdk/lib/credentials";
export declare type IAwsCredentials = CredentialsOptions & {
    region?: string;
};
/**
 * Uses a users "credentials" file to lookup region, access_key, access_secret
 *
 * @param profile the text name which serves as a lookup to the users ~/.aws/credentials file
 */
export declare function getAwsCredentials(profile: string, directory?: string): CredentialsOptions & {
    region?: string;
};
