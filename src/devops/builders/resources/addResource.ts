import { omit } from "native-dash";
import {
  AtDesignTime,
  IStackResource,
  Resource,
  DesignTimeCallbacks,
} from "~/devops/types/resources";

export function addResource<TResourceName extends string, TAwsType extends string>(
  name: TResourceName,
  resource: AtDesignTime<TAwsType, Resource<TResourceName, TAwsType>>,
  /**
   * Allows helper functions to provide a string description of the resource.
   *
   * Where this is provided it will be funneled into the resource object's `toString()`
   * and `toJSON()` methods.
   */
  info?: string
) {
  const p2 = omit(resource.Properties, "providePermissions", "transformResource");
  const callbacks: DesignTimeCallbacks<TAwsType, Resource<TResourceName, TAwsType>> = {
    providePermissions: resource.Properties.providePermissions,
    transformResource: resource.Properties.transformResource,
  };

  const r2 = {
    name,
    type: resource.Type as TAwsType,
    resource: { ...resource, Properties: p2 } as Resource<TResourceName, TAwsType>,
    ...callbacks,
  } as IStackResource<TResourceName, TAwsType>;

  return {
    ...r2,
    toString() {
      return info || `${resource.Type}('${name}')`;
    },
    toJSON() {
      return info || `${resource.Type}('${name}')`;
    },
  } as IStackResource<TResourceName, TAwsType>;
}
