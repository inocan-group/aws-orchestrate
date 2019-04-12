# AWS Orchestrate

This library is intended to help projects intending to build a "micro-service architecture" to achieve those ambitions with some handy orchestration classes and types.

## `AwsSequence` class

The `AwsSequence` class provides a standardized way of chaining a set of Lambda functions together into a _sequence_. It also provides for features such as:

1. **Branching**

     For Boolean branches:

      ```typescript
      const ifTrue = LambdaSequence.add('trueFn1').add('trueFn2');
      const ifFalse = LambdaSequence.add('falseFn1').add('falseFn2');
      const branchingCondition = (ctx) => ctx.value > 10;
      const sequence = LambdaSequence.add('fn1').branch(branchingCondition, ifTrue, ifFalse);
      ```

    For multiple outlet branches:

      ```typescript
      const red = LambdaSequence.add('redFn1').add('redFn2');
      const orange = LambdaSequence.add('orangeFn1').add('orangeFn2');
      const blue = LambdaSequence.add('blueFn1').add('blueFn2');
      const branchingCondition = (ctx) => ctx.favoriteColor;
      const sequence = LambdaSequence.add('fn1').branch(branchingCondition, { red, orange, blue });
      ```

2. **Error Handling** - send any task that fails with an error to a designated handler function:

    ```typescript
    const sequence = LambdaSequence.add('fn1').add('fn2').errorHandler('errFn');
    ```

### Chaining Execution

The current function must call the `invoke` function from the **aws-log** library and provide it with the parameters which come from this library's `next()` function:

```typescript
export async function handler(event, context, cb) {
  try {
    // ... do stuff
    await invoke(...sequence.next(output));
    cb(null, output)
  } catch(e) {
    if(sequence.errorHandler) {
      await invoke(sequence.errorHandler);
    }
    cb(e);
  }
}
```

The next function in the chain will then pickup the sequence with:

```typescript
export async function handler(event, context, cb) {
  const sequence = LambdaSequence.from(event);
  // ... do stuff
}
```

## `FanOut` class

not yet implemented