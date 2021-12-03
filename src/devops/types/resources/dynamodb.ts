export type DynamoDbAttributeType = "S" | "N" | "BOOL" | 0 | 1 | "B" | "SS" | "NS" | "BS";

export interface IDynamoDbTableResource {
  Type: "AWS::DynamoDB::Table";
  Properties: {
    TableName: string;
    AttributeDefinitions: Array<{
      AttributeName: string;
      AttributeType: DynamoDbAttributeType;
    }>;
    KeySchema: Array<{ AttributeName: string; KeyType: "HASH" | string }>;
    ProvisionedThroughput?: {
      ReadCapacityUnits?: number;
      WriteCapacityUnits?: number;
    };
  };
}
