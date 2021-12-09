# Resources

## General Data Structure

Resources defined in the Serverless Configuration are really just Cloudfront configurations. We have added _typings_ for a number of resources into the `common-types` repo to facilitate strong typing but at the most basic level the structure is always as follows:

```ts
export interface IGenericResource<T extends string = string> {
  Type: T;
  Properties: Record<string, any>;
}
```

Any resource which recieves a type `T` which is _not_ one of the recognized types will immediately be associated generic form which allows for any data structure in the `Properties` body.

## Preparing for Runtime

When you are designing a stack, the goal is to _partially_ configure the stack but intentionally leave some aspects of configuration for "run time" where the term "run time" means the point at which a user **deploys** the stack to the cloud.



## Discuss

[] Resource at Design and Runtime
[] Typing 