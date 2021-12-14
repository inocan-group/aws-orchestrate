import { AwsResourceType } from "common-types";
import { DynamoTable, INamedResource, PermissionsRunTime, PropertiesTransformerRt } from "~/devops";
import { getRuntime } from "~/devops/run-time/getRuntime";

describe("DynamoTable() resource helper", () => {
  it("Can build configuration with just a name", async () => {
    const t = DynamoTable("customers");
    const rt = { ...(await getRuntime()), properties: t.resource.Properties };

    expect(t.name).toBe("customers");
    expect(JSON.stringify(t)).toInclude("customers");
    expect(t.resource.Type).toBe(AwsResourceType.dynamoTable);

    expect(t.transformResource).toBeTruthy();
    if (t.transformResource) {
      const props = t.transformResource(rt) || undefined;
      expect(typeof props).toBe("object");
      expect(props.TableName).toBe("customers-dev");
      expect(props.BillingMode).toBe("PAY_PER_REQUEST");
    }
  });

  it("Setting provisioned throughput, sets billing mode", async () => {
    const t = DynamoTable("customers", {
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    });
    const rt = { ...(await getRuntime()), properties: t.resource.Properties };

    expect(typeof t.resource.Properties.ProvisionedThroughput).toBe("object");
    expect(t.transformResource).toBeTruthy();
    if (t.transformResource) {
      const props = t.transformResource(rt) || undefined;
      expect(props.BillingMode).toBe("PROVISIONED");
    }
  });

  it("Setting a GSI shows in stringified report", async () => {
    const t = DynamoTable("customers", {
      GlobalSecondaryIndexes: [
        {
          IndexName: "when",
          KeySchema: ["created", "updated"],
          Projection: {
            NonKeyAtttributes: [],
          },
        },
      ],
    });

    expect(t.resource.Properties.GlobalSecondaryIndexes).not.toBeUndefined();
    expect(JSON.stringify(t)).toInclude("gsi1");
  });

  it("Setting a LSI shows in stringified report", async () => {
    const t = DynamoTable("customers", {
      LocalSecondaryIndexes: [
        {
          IndexName: "when",
          KeySchema: ["created", "updated"],
          Projection: {
            NonKeyAtttributes: [],
          },
        },
      ],
    });

    expect(t.resource.Properties.GlobalSecondaryIndexes).not.toBeUndefined();
    expect(JSON.stringify(t)).toInclude("lsi1");
  });

  it.todo("The default permissions provided by a Table are found on returned resource", () => {
    const t = DynamoTable("customers");
    const rt = getRuntime();
    const rt2 = { ...rt, properties: t.resource.Properties } as unknown as PropertiesTransformerRt<
      INamedResource<"customers", AwsResourceType.dynamoTable>
    >;
    if (t.transformResource) {
      const rt3 = t.transformResource(rt2) as PermissionsRunTime<
        INamedResource<"customers", AwsResourceType.dynamoTable>
      >;
      if (t.providePermissions) {
        const permissionSets = t.providePermissions(rt3);
        expect(permissionSets).toHaveLength(3);
      } else {
        throw new Error("Was intended to have providePermissions() callback");
      }
    } else {
      throw new Error("Was intended to have transformResource() callback");
    }
  });
});
