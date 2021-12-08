import { IDynamoDbTableResource } from "common-types";
import { dynamoTable } from "~/devops/builders/resources";
import type { RunTime } from "~/devops/types";
import type { IGenericResource } from "~/devops/types/resources";

export function addResourceApi() {
  return {
    /**
     * add _any_ resource type but get only limited type support
     */
    addResource: <R extends string>(
      name: R,
      config: IGenericResource | RunTime<IGenericResource>
    ) => {
      //
    },
    addDynamoTable: <R extends string>(
      name: R,
      config: IDynamoDbTableResource<R> | RunTime<IDynamoDbTableResource<R>>
    ) => {
      return dynamoTable(name, config);
    },
  };
}
