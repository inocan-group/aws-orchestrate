# Getting Started

## Installing

```sh
# npm
npm install --save aws-orchestrate
# yarn
yarn add aws-orchestrate
```

## Basic Usage

Here is a _very_ brief overview of syntax used in the various functional areas. For more detail, use the menu choices in the header bar.

### Wrapper

To use the wrapper you would do something like the following:

```typescript
import { wrapper } from 'aws-orchestrate';

const fn: IHandlerFunction<<Request, Response>> = async (request, context) {
  // your handler function goes here
}

export handler = wrapper(fn)
```


### Orchestration

The primary API for orchestration is via the `LambdaSequence` class and an example implementation might look like this:

```typescript
import { LambdaSequence } from 'aws-orchestrate';

const sequence = LambdaSequence
  .add<IFn1Request>('fn1', { foo: 1, bar: 2})
  .add<IFn2Request>('fn2', { baz: 1234 })
  .onError('myErrorHandler', { 
    foo: dynamic('fn1', 'foo'), 
    baz: dynamic('fn2', 'baz') 
  })
  .addConditionally(myCondition, 'fn3', { mySecret: 'roses are red' })
  .add('wrapThisUpFn')
```

This defined orchestration could then be executed and dictate a coordinated set of lambda executions which collaboratively achieve a functional goal.

### HTTP Transactions

Unlike the prior two examples, the HTTP Transaction is largely involved with the client web application using the exported `transaction` symbol. This functionality is still a proof of concept, more will be documented once this feature reaches maturity.