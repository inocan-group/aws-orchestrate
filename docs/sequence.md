---
sidebarDepth: 3
---
# Orchestrated Sequences

## Overview

The `LambdaSequence` class provides the core API for this libraries orchestration services and is meant to work in a collaborative way with the [`wrapper`](/wrapper.html) function. The intent is that you assign a handler function as a "conductor" who's single responsibility is to setup and then start the execution of a orchestrated sequence.


## Adding Tasks

To start we will need to create a _sequence_ as a set of Lambda functions that should be executed one after another. This simple example would be defined within a handler function and would look something like this:


**`/src/handlers/myConductor.ts`**
```typescript
const fn: IHandlerFunction<Request, Response> = async (request, context) {
  const sequence = LambdaSequence
    .add('fn1')
    .add('fn2')
    .add('fn3')

  context.registerSequence(sequence)
}
```

In the above example the `fn1`, `fn2`, `fn3` references are AWS ARN's. And as you probably know, ARN variables are long and somewhat unweildy in length but the very last part of the ARN is the name of the function. So long as we have a few handy ENV variables set we can avoid writing out the whole name and just use the function name and `LambdaSequence` will resolve the full ARN for us.

### Environment Variables

The ENV variables that are needed to allow us the shortened ARN names are:

- `AWS_REGION`
- `AWS_STAGE`
- `AWS_ACCOUNT_ID`

Ensuring that these are set is a best practice not only because it is more convenient to refer to functions by their short names but by allowing the other parts of the ARN to be abstracted allows each environment to adjust the right _context_ that they are operating. In particular **Stage** and **Region** are typically best kept contextual and isolated: 

- if you are executing in `us-east-1` then the sequences which you invoke downstream should also be found in that region
- certainly if you are starting execution in the `test` stage, you want to ensure that downstream functions are consistently executed in that stage as well.



### Parameter Passing

In our simple example above we just ran three functions back-to-back without passing any parameters to them. This is possible but a very limiting scenario. In most cases we'll want to organize what data each function is given in the _request_ as well as potentially put return values to use in some other part of the sequence.

`LambdaSequence` makes parameter passing easy. You can pass data into the functions which have discrete values known at the time of the _conductor's_ execution by simply passing them as a second parameter of `add()`; if the value you want to pass in not yet known but will be resolved by a future Lamdba function you map the inputs and outputs with the `dynamic` symbol:

```typescript
const fn: IHandlerFunction<Request, Response> = async (request, context) {

  const sequence = LambdaSequence
    .add('getPersonInfo', { name: "Bob Marley", age: request.age })
    .add('weather', { location: "Kingston, Jamica", date: dynamic('getPersonInfo', 'birthday') })
    .add('horoscope', { 
      birthday: dynamic<IGetPersonResponse>('getPersonInfo', 'birthday'), 
      gender: dynamic<IGetPersonResponse>('getPersonInfo', 'gender'),
      weatherWhenBorn: dynamic<IWeatherResponse>('weather', 'data') 
    })

  context.registerSequence(sequence)

}
```

Here we again see three functions strung together but now the inputs and outputs are creatively mapped to one another. Not only can we map inputs and outputs but so long as we having _typings_ for the Request/Response interfaces of the various functions we can ensure a strongly typed environment in the use of the `dynamic()` operator.

## Conditional Tasks

### Syntax 

So far we've added Tasks to the sequence which _always_ get executed as part of the sequence but sometimes you want to add certain steps only under certain conditions. This is achieved with the `addConditionally()` method and will look something like this:

```typescript
const sequence = LambdaSequence
  .addConditionally(
    myCondition({ myVal: dynamic('fn1', 'age') }), 
    'getPersonInfo', { foo: 1, bar: 2 }
  )
```

where `myCondition` is a function defined by the `OrchestratedCondition` type:

```typescript
const myCondition: OrchestratedCondition = ( params ) => () => { ... } as boolean
```

### Timing of Condition Evaluation

The `myCondition` variable is a higher order function which is evaluated at two differnt points in time. As can be seen in the example, the first call -- to define the _parameters_ the condition will need to properly run -- is done immediately in the conductor during the setup of the sequence. However, this call simply states what information _will_ be needed in the future when the dynamic variables can be resolved.

During execution of the sequence, when the Task _immediately prior_ to the conditional task, the `wrapper` function prepares the the invocation of the `next()` function/task and it's at this point that it identifies that the next step is conditional and then runs the `myCondition`'s second function. Conditions always return a boolean response which tells the sequence whether to _execute_ or _skip_ the conditional task.

## Error Handling
### Overview

By default, when an unhandled error is encountered in a sequence, the sequence is immediately stopped. The function which errored will -- as part of default behavior -- be logged to STDOUT (and ideally shipped to a log monitoring/reporting solution). And while the `wrapper` function provides an API for handler authors to manage errors; often the appropriate way of handling errors is not at the granularity of a single function but rather at inter-function or orchestration level.

Therefore, the `LambdaOrchestrate` class provides us an API to manage errors strategically from within the definition of the sequence itself. An example might be:

```typescript
const sequence = LambdaSequence
  .add('fn1').forwardError('handleError', { foo: 1 })
  .add('fn2').continueOnError( myFn )
  .add('fn3').forwardError('handleError2').continueOnError( myFn2 )
```

### Error API

Here we are introduced to two new API methods:

- `forwardError(fn, additionalParams)` - this method attachs to the last task defined and ensures that any error encountered will be forwarded onto a Lambda function for further processing. A few points to note:

    - if the handler function itself has a error forwarder, this poses no conflict ... both forward functions are respected passed the error to process
    - this API endpoint does not change any behavior with regards to whether the sequence should continue or not (it will _not_ continue by default)

- `continueOnError( fn )` - you may pass in either a boolean value or a function (to be executed when the error is encountered) to tell the sequence whether it should continue executing the sequence based on an error occurring. 

> Note: as we see with `fn3` we can chain both of these API methods together


## Fan-Outs

So far we have discussed a linear process of execution that can solve many problems but a common demand for solving some problems is to parallelize the problem and this is where the `fanOut` operation comes into play.