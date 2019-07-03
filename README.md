# AWS Orchestrate

This library is intended to help projects intending to build a "micro-service architecture" to achieve those ambitions with some handy orchestration classes and types.

## `LambdaSequence` class

The `LambdaSequence` class provides a standardized way of chaining a set of Lambda functions together into a _sequence_. It  provides the following high level features:

1. **Chaining**

    A "conductor" can build the sequence simply and gracefully with the `.add()` method. For example, a conductor may build a sequence like this:

    ```typescript
    const geoCode = '1234';
    const sequence = LambdaSequence.add('getCustomer', { id: "abcd" })
      .add('getProducts', { geoCode })
      .add('getSpecials', { products: ':data', geoCode })
      .add('specialsForUser', {
        customer: ':getCustomer.data',
        specials: ':data',
        includeAllSpecials: true
      });
    ```

    In this example we see that not only can we setup a *sequence* of functions but also we can state what inputs each function can get. These inputs can be:

    - values known at run time by the conductor (see `geoCode` and `id` for customer)
    - a remapping of the prior functions outputs into our inputs (see props with value of `:data`)
    - adding the output of a prior function's output (see props with value of `:getCustomer.data`)

    By allowing the conductor to not only provide data inputs for values it knows at the time of its execution but also use indirection to shape the input with future values coming out of the sequence's execution we give the conductor the ability to direct the flow with great control and at the same time allow the functions that are being orchestrated to stay ignorant about the sequence details.

2. **Branching**

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

3. **Error Handling** - send any task that fails with an error to a designated handler function:

    ```typescript
    const sequence = LambdaSequence.add('fn1').add('fn2').errorHandler('errFn');
    ```

### Usage / Chaining Execution

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