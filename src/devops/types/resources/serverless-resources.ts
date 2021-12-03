import { IDynamoDbTableResource } from "common-types";

export type IGenericResource = {
  Type: string;
  Properties: Record<string, unknown>;
};

export type ServerlessResource = IGenericResource | IDynamoDbTableResource;

/**
 * The configuration of serverless resources
 */
export interface IServerlessResources {
  Resources?: { [key: string]: ServerlessResource };
}

export interface IServerlessOutput {
  Description?: string;
  /**
   * Example:
   *
   * ```yaml
   * Value:
   *  'Fn::GetAtt': [userTable, Arn]
   * ```
   */
  Value: any;
  Export: {
    /**
     *  see Fn::ImportValue to use in other services and
     * [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/outputs-section-structure.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/outputs-section-structure.html)
     * for documentation on use.
     */
    Name: string;
  };
}
