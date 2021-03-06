---
sidebar: auto
---

# Step Functions

## Introduction

AWS offers their [**Step Functions**](https://aws.amazon.com/step-functions/) as a means to create powerful orchestration of lambda functions through a proprietary UDL .

We can write a definition of our desired _step function_ that would be composed of multiple steps that would receive an state that can be manipulated (handled) by steps (as `Task Step`) _aka State Machine_.

As we metioned earlier _step functions_ definition is composed of **States**, and already mentioned one above (**Task Step**), which is the most common used state because it let us call an aws service as _AWS Lambda function_. There are others state types as conditional, map/parallel, and terminal states like `Fail` or `Success`.

The intent of this `module` is to give users and strongly typed and friendly API that let define step functions with more `confidence` and integrate smoothly with other `aws-orchestrate` functionalities as passing, correlation id, ssm secrets, etc.

## Terminology

### Overview

We will attempt to define key terms which will be reinforced in the API (and type system) to describe key constructs when writing step functions:

```mermaid
erDiagram
    StateMachine ||--|| StepFunction : has
    StepFunction ||--|{ State : contains
    StateMachine ||--o| Catch : has
    StepFunction ||--o| Catch : has
    State ||--o| Catch: has
    State ||--o| Retry: has
    Catch ||--|| StepFunctionn : has
```

### State Machine

Even though the service is called "Step Functions", ultimately it a **State Machine** that you "deploy" to AWS and get a uniquely identifying ARN back to make reference to. There are two key parts of the "meta-data" which help define a State Machine:

1. `name` - the name of your state machine, it should be unique for the given repo you're working on but there's no need to assure uniqueness across repos as this is what the ARN is for
2. `type` - historically there was only one type but more recently an EXPRESS type has been introduced and it's important to [know which _type_ your state machine should use](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-standard-vs-express.html). In most cases, if you can use Express than you _should_ use express.

The bulk of the _state_ in the State Machine, however, is not in the meta data but in the `definition` property which we will refer to as a **Step Function** (see next section).

### Step Function

A **Step Function** is a definition of all possible states/steps which can be _moved into_ in the state machine, along with instruction on how to move to the _next_ state. A complex step function can indeed be quite complex and because the AWS State Definitions are in YAML, you get no typing support at design time. Furthermore, step functions require a "full deploy" to get new versions to AWS.

This can lead to a sometimes tiresome loop of: "making silly mistake, deploying, identifying new mistake, deploying, etc." The **aws-orchestrate** library dramatically helps reduce this loop by providing a `StepFunction` utility function which provides strong typing that ensures what you've _built_ will _deploy_.

There will be much more detail in the [Examples](#examples) section but you might expect a Step Function to be defined something like this:

```typescript
import { StepFunction } from "aws-orchestrate";

const myStepFn = StepFunction()
  .task(HandlerFn.first)
  .task(HandlerFn.next)
  .task(HandlerFn.last, { timeout: 3000 });
```

### State(s)

A state machine must have "states" but of course from a terminology standpoint we say that a _state_ belongs to the **Step Function** and that this function is then formalized by being wrapped by a **State Machine**. Anyway ... semantics. Who has the time?

```mermaid
classDiagram
    class StepFunction
    class State
    State : String Type
    State : String Comment
    State : Boolean Ends
    class Task
    State <|-- Task
    State <|-- Parallel
    class Parallel
    Parallel "1" --> "*" StepFunction
    State <|-- Choice
    class Choice
    class ChoiceItem
    Choice "1" --> "*" ChoiceItem
    ChoiceItem "1" --> "1" StepFunction
    State <|-- Map
    class Map
    Map "1" --> "1" StepFunction
```

In the next section we'll review all of the "kinds" of states that you can use to compose a Step Function.

## Getting Started

### Options

1. CLI based on directory and default export

   - User creates StepFunction in `/src/state-machines` directory

     - File has single _default_ export

       **my-state-machine.ts**

       ```ts
         export default StateMachine("EmailCampaign", {
             stepFunction: StepFunction()
                 .task(HandlerFn.GetLeadsInfo)
                 .task(HandlerFn.RequestExternalInfo)
                 .map('$.users', mapOptions).use(s =>
                     s.task(HandlerFn.EmailNotification')
                     .task(HandlerFn.PersistNotificationResults)
                     .succeed()
               ),
         });
       ```

       - When step function CLI is executed, yaml config file will be named based on TS file

2. CLI based on AST detection

   - We will again suggest that people create a `/src/state-machines` directory
   - But we will run an AST parser over all TS files in this directory and look for exports of type `IStateMachine`
   - CLI: `build-sm -o state-machines` will produce `.yaml` files for each state machine into the root directory or any directory stated with `-o` modifier.

3. file services to YAML built into StateMachine API
4. Other?

### Basic Usage

If you are using `aws-orchestrate` , you should have a `<root>/serverless-config/stepFunctions` directory in your project root. That is the place where we are going to declare all our state machines.

#### Fluent API Syntax

In our app we are going to have times when we want to specify a collection of states or other unit of work. We are going to be able to specify them by concatenating a fn and calling other from the returned object.

```ts
export const pState = Parallel((p) => p.addBranch(b1).addBranch(b2));
```

```ts
export const cState = Choice((c) => c.stringEquals("a", stepFn1).stringEquals("b", stepFn2));
```

#### Shorthand Syntax

If our requirements of our step function grows, let's say that we want to use complex states like map. Declaring all in fluent api syntax would make harder to mantain. We might want to use this order syntax.

_notifyAllUsers.ts_

```ts
import { Task, Map } from "aws-orchestrate";

const emailNotification = Task("emailNotificationFn");
const persistNotificationResults = Task("persistNotificationResultsFn");

export const notifyAllUsers = Map("$.users").use([emailNotification, persistNotificationResults]);
```

_myAwesomeWorkflow.ts_

```ts
import { StateMachine, StepFunction } from "aws-orchestrate";
import { notifyAllUsers } from ".";

const getLeadsInfo = Task("getLeadsInfoFn");
const getExternalInfo = Task("getExternalInfoFn");
const stepFunction = StepFunction(getLeadsInfo, getExternalInfo, notifyAllUsers);

export const emailCampaign = StateMachine("myAwesomeWorkflow", {
  stepFunction,
});
```

### Finalized State

It refeers to the __named__ state. It means that this state has a static name and cannot be changed. In the case of `Task` States, these are always finalized by default because if you don't provide a name, it would take the resource fn name as the state name.

### Terminal State

When we set a `Choice`, `Succeed` or `Fail` State, it should not allow us to add more states after that at step function level. It means that the current step function definition has to end in one of those states. However take in mind that a step function can contain a state which has more states like `Map` or `Parallel`.

## Building Blocks

In this section we'll review the most important _kinds_ of **state** you can include in a step function. While there are a few others you can use, they are edge cases and are easily found using the Typescript-powered intelisense (more on this in the [Examples](#examples) section).

In Step Functions there are some important _patterns_ / _capabilities_ that are worth understanding up front. These include:

### [**1. Task** ](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-task-state.html)

The "task" is the most important part of most state machines as this is where your Lambda functions are called and the state machine is manipulated (via the Lambda's compute). Without any tasks, a step function would get pretty dull very quickly.

Configuring a task within **aws-orchestrate** involves using the `task()` function or defining by an object values. The only _required_ parameter is the AWS **ARN** that uniquely identifies the function, however there is an optional second parameter for additional configuration.

- State Definition:

```ts
const tState = Task("arn:xxxxxxxx", { timeOutSeconds: 2000 });
```

```typescript
const tState = State((s) => s.task("arn:xxxxxxxx", { timeOutSeconds: 2000 }));
```

- Extending an existing step function with fluent api syntax:

```typescript
const myStepFunction = StepFunction().task("arn:zzzzzz",  timeOutSeconds: 2000 });
```

The difference between these two is the flexiblity and reusability that give you to define taks by state definition and then reuse in other part of your step function

> **Note:** there _are_ more advanced patterns of calling into different AWS service integrations (such as SNS, SQS, etc.) [see docs](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-task-state.html) which utilize a different set of parameters than the standard set and you can not use them when building with the `task()` function. Over time we will add these individual items as their own part of the API (instead of overloading the `task()` function)

### [**2. Choice** ](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-choice-state.html)

This allows the step function to be challenged with any number of logical _choice items_ where the first condition which matches will be picked and it's _sub_ Step Function's state will be handed over the state management.

```mermaid
graph LR
    START(( )) --> S1((State))
    S1 --> C1[Choice]
    C1 -->|condition| CI1(Choice Item 1)
    CI1 --> SF1[Step Function 1]
    SF1 --> C11((State))
    C11 --> C12((State))
    C12 --> E1(( ))
    C1 -->|condition| CI2(Choice Item 2)
    CI2 --> SF2[Step Function 2]
    SF2 --> C21((State))
    C21 --> E2(( ))
    C1 -.->|default| CI3(Choice Item3)
    CI3 --> SF3[Step Function 3]
    SF3 --> C31((State))
    C31 --> C32((State))
    C32 --> E3(( ))

    style START fill:#EFED91,stroke:#7E7E7E,stroke-width:1px,color:#aaa
    style E1 fill:#62B491,stroke:#62B491,stroke-width:0px,color:#aaa
    style E2 fill:#62B491,stroke:#62B491,stroke-width:0px,color:#aaa
    style E3 fill:#62B4B3,stroke:#62B4B3,stroke-width:0px,color:#aaa
```

In addition to expressing a ordinal number of _choice items_ which you are looking for a match on you may also include a "default" choice items which contains Step Function to run through (this is recommended as a best practice).

Configuring a choice would look something like the following:

```typescript
// condition A (This is valid because first state [task] is finalized)
const searchDuckDuckGo = ChoiceItem((c) =>
  c.stringEquals("duck", (s) => s.task("searchDuckDuckGo", { name: "searchDuckDuckGo" }))
);

// default condition (Not valid because first state is not finalized. This is mandatory)
const searchGoogle = ChoiceItem((c) => c.default((s) => s.task("searchGoogle")));

// conditions can be pass in any order and the last param is the option hash
const searchText = Choice(searchDuckDuckGo, searchGoogle, opts);
```

Note: Take in mind that `choice` state is a terminal state, which means that no more states can be added after this one (invalid configuration) or extended if we are using the fluent API:

```typescript
    const fooTask = Task("fooTask");
    const myStepFunction = StepFunction([searchText, fooTask]);
    // this should throw ServerlessError `not-valid` configuration error

    StepFunction()
        .choice([choiceItem1, choiceItem2, defaultChoiceItem])
        .task(...) // <-- this API would not be able to call it after used the `choice` method
```

### 3. Map and Parallel

The `Map` and `Parallel` state types both start parallel execution pipelines but in slightly different ways:

- [**Map** ](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-map-state.html)

  A Map state is intended to execute over _the same_ Step Function in parallel where each instance is given a different set of inputs to use (and therefore work is not duplicative). This is done by choosing an _iterable_ property in the request/input to the Map state

  ```mermaid
  graph LR
      START(( )) --> M1[[Map]]
      M1 -->|idx 0| M11((S))
      M1 -->|idx 1| M21((S))
      M1 -->|idx 2| M31((S))

      subgraph Singular Sub-StepFunction in Parallel
      M11 --> M12((S))
      M12 --> E1(( ))
      M21 --> M22((S))
      M22 --> E2(( ))
      M31 --> M32((S))
      M32 --> E3(( ))
      E1 ---|fan-in| EE(( ))
      E2 ---|fan-in| EE(( ))
      E3 ---|fan-in| EE(( ))
      end

      EE -->|cont| S2((S))
      S2 -->STOP(( ))

      style START fill:#EFED91,stroke:#7E7E7E,stroke-width:1px,color:#aaa
      style E1 fill:#62B491,stroke:#62B491,stroke-width:0px,color:#aaa
      style E2 fill:#62B491,stroke:#62B491,stroke-width:0px,color:#aaa
      style E3 fill:#62B491,stroke:#62B491,stroke-width:0px,color:#aaa
      style EE fill:#D7D7D7,stroke:#949494,stroke-width:1px,color:#aaa
      style STOP fill:#62B491,stroke:#62B491,stroke-width:0px,color:#aaa
  ```

  - Fluent API:

  ```typescript
  const notifyAllUsers = State((s) =>
    s
      .map("$.users", { name: "notifyAllUsers", maxConcurrency: 2 })
      .use((s) => s.task("emailNotification").task("persistNotificationResults"))
  );
  ```

  - State Definition:

  ```typescript
  const emailNotification = State((s) => s.task("arn:zzz"));
  const persistNotificationResults = State((s) => s.task("arn:zzz"));

  const notifyAllUsers = Map("$.users", { name: "notifyAllUsers", maxConcurrency: 2 })
      .use([emailNotification, persistNotificationResults])
  );
  ```

- [**Parallel** ](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-parallel-state.html)

  A _parallel_ state is intended to execute over an ordinal number of step functions (presumably different ones) in parallel.

  ```mermaid
  graph TB
      START(( )) --> P1[[Parallel]]
      P1 -->|branch1| PS11((S))
      P1 -->|branch2| PS21((S))
      P1 -->|branch3| PS31((S))

      subgraph parallel [ ]

      subgraph StepFn3 [StepFn 3]
      PS31 --> PS32((S))
      PS32 --> PS33((S))
      PS33 --> E3(( ))
      end


      subgraph StepFn2 [StepFn 2]
      PS21 --> PS22((S))
      PS22 --> PS23((S))
      PS23 --> PS24((S))
      PS24 --> E2(( ))
      end

      subgraph StepFn1 [StepFn 1]
      PS11 --> PS12((S))
      PS12 --> E1(( ))
      end

      E1 ---|fan-in| EE(( ))
      E2 ---|fan-in| EE(( ))
      E3 ---|fan-in| EE(( ))

      end

      EE --> S2((S))
      S2 --> STOP(( ))

      style START fill:#EFED91,stroke:#7E7E7E,stroke-width:1px,color:#aaa
      style E1 fill:#62B491,stroke:#62B491,stroke-width:0px,color:#aaa
      style E2 fill:#62B491,stroke:#62B491,stroke-width:0px,color:#aaa
      style E3 fill:#62B491,stroke:#62B491,stroke-width:0px,color:#aaa
      style EE fill:#D7D7D7,stroke:#949494,stroke-width:1px,color:#aaa
      style STOP fill:#62B491,stroke:#62B491,stroke-width:0px,color:#aaa
      style parallel align: left
  ```

  - Fluent API:

  ```typescript
  // We can define branches on the fly with fluent api syntax.
  const pFluent = Parallel((p) => p.addBranch(sf1).addBranch(sf2));
  ```

  - State Definition:

  ```typescript
  // We can define step functions that are going to be used as branches separately
  const branch1 = StepFunction().task("foo1");
  const branch2 = StepFunction().task("foo2");

  StateMachine().parallel(branch1, branch2);
  ```

### [4. Pass](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-pass-state.html)

After a first look, this state could not see useful because its only purpose is to receive an input and return and ouput. It also has the [common types](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-common-fields.html) fields and other ones that let us to modify the output or can be use to debug the current "state".

```typescript
State((s) => s.pass({ outputPath: "$.foo" }));
Pass({ outputPath: "$.foo"})
```

### [5. Succeed and Fail ](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-transitions.html)

These are terminal states, which means that our step function should end there. Non-terminal states can also be marked as terminal state explicitly, but, having `Succeed` or `Fail` states can help to be more expressive about the state of our state machine.

```typescript
// Succeed
const succeed1 = State((s) => s.succeed());
const succeed2 = Succeed();
// Fail
const fail1 = State((s) => s.fail("error cause"));
const fail2 = Fail("error cause");
```

### [6. Wait ](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-wait-state.html)

Last but _possibly_ not least is `Wait` ... thanks for waiting for it. All kidding aside, the Wait state is actually a very cool feature that Step Functions bring. In fact, sometimes it may be the sole reason you decided to step away from plain old Lambda execution. Why?

In the world of Lambda you "pay to wait" but in Step Functions you can wait for free. For an Express Step Function that means up to 5 minutes but for a Standard Step Function you can wait up to a year!

```typescript
// First parameter is timeout as milliseconds
const wState1 = State((s) => s.wait(200));
const wState2 = Wait(200);
```

## Wrapper Integration

If you're using **aws-orchestrate** we assume you're also using the included `wrapper()` function to gain strong typing on your Lambda handler functions. As you'll likely know too, this wrapper provides some useful features which would be a shame to miss out on simply because your Lambda function was called by AWS's Step Functions.

### Calling into a Step Function

If you are using **aws-orchestrate** lambda fn wrapper, it might be easy to start an state Machine execution just calling `invokeStepFn`. This would pass the context (correlationId, secrets, etc) we have in the current execution lambda fn to the new step Function executed. This would also improve the step function execution performance because if would not require to fetch those secrets again. And having correlationId is a key that would help us in traceability.

### Error handling in Lambda's

We should really be cautious about aws-orchestrate wrapper error handling in step function execution, because if we handle errors by ourselves we might override or hide the native Step Function Error Handling with states like (Catch and Retry). Other option is use error handling along step function error handler.

#### Catch

This option state is available in most of our states. It enable us to determine what path to follow or if we want to terminate execution when an specific or all kind of error had thrown in one of our step function's state execution. If we have a state that contains other states like `map`, our scope would affect all children.

- State Machine level:

```ts
const myStateMachine = StateMachine("myStateMachine", {
  stepFunction: myStepFn,
  catch: (e) => e.all((s) => s.task(NotifyError.handlerFn)),
});
```

- Step function level:

```ts
const fooStepFn = StepFunction({
  catch: (e) => e.knownError((s) => s.task(NotifyError.handlerFn)),
}).task("task1");
```

- State level:

```ts
const notifyError = State((s) => s.task(NotifyError.handlerFn));
const myStepFn = StepFunction(notifyError);

const fooTask = Task("task1", {
  catch: (e) => e.all(myStepFn),
});
```

#### Retry

This is also useful if we want to retry execution of error caught state. It is also important to keep in mind that execution the state again won't break our data flow.

- example:

```ts
const fooTask = State(s => s.task('fooTask', { retry: e => e.knownError(retryOptions)) }))
```

### Secret Management

One of the benefits of using aws-orchestrate wrapper is that it detects secrets from input payload and include in our `request`, and if we fetched another ssm secret in the lambda fn handler, it would include along with the current one in the output/response, which is the input of the next state in our step function. All detection and includement in input/output is done under the hood.

## Utility Functions

In addition to the `StateMachine()`, `State()` and `StepFunction()` utilities you'll see in the [examples](#examples) section, there are also some smaller grain utilities that will help you to achieve stronger typing:

### `ChoiceItem()` fn

It helps you to compose a condition to be used in "choice" state. Instead of having to type the operator property such as stringEquals, numberEquals by yourself, this method would let you to use fluent API to define the correct operator to be used.

```typescript
const sendGreatNews = Task("sendEmailNotification");
// You would be able to specify the state's property to be evaluated as the third parameter
const myCondition = ChoiceItem((c) => c.numericEquals(20, "$.score", [sendGreatNews]);
```

### `Catch()` fn

States such as `task`, `parallel` and `map` have a way to catch errors and based on that continue to a certain state. It can be also possible to be used to pass along with a fallback state. errorHandler can also be defined at state machine or step function level.

```typescript
// we have a util fn available from fluent API to build a sequence to the next state "goTo()"
const openBrowser = State((s) => s.task("openBrowser", { name: "openBrowser" }));
const searchYahooTask = State((s) => s.task("searchYahoo", { name: "searchYahoo" }));

// Note that the last state shoulb be terminal or first state should be finalized to be a valid error handler
// if not, it will throw an error when state machine are being built
const myErrorHandler = Catch((e) => e.all((s) => s.task(NotifyError.handlerFn)));

// state machine level
StateMachine("fooStateMachine", { catch: myErrorHandler });

// step function level
StepFunction(openBrowser, searchYahooTask, { catch: myErrorHandler }).task("foo");

// state level
State((s) => s.task("foo", { name: "fooTask", catch: myErrorHandler }));
```

### `Retry()` fn

It uses a syntax like `errorHandler()` that was described above. The difference is that, instead of specifying the next state, you could just also determine some options about "retry" functionality. The re-execution of a state.

```typescript
const retryHandler = Retry((e) => e.timeout({ maxAttempts: 5 }));

const myFooTask = State((s) => s.task("myFooTask", { retry: retryHandler }));
```

## Examples

### Defining A State Machine

```typescript
import { StepFunction, StateMachine } from 'aws-orchestrate';

const myStepFn = StepFunction(...)

// We pass the state machine name as the first parameter and its options in the second one
const myStateMachine = StateMachine("myAwesomeStateMachine", { stepFn: myStepFn })

const json = myStateMachine.toJSON()
const yaml = myStateMachine.toYaml()
```

### Defining A Step Function

```typescript
// fluent API
const myStepFunction = StepFunction().task("foo1").task("foo2");

// state definition
const myStepFunction2 = StepFunction(myState1, myState2).task("foo3"); // a step fn created with states can be extended by fluentAPI
```

### Defining A State

```typescript
// In case of task state, the name property is generated as the lambda fn name associated with it
const sendNotification = State((s) => s.task("sendNotification"));

// Other states the name is autogenerated as a hash of the state object definition
const fooChoice = State((s) => s.choice(choice1, choice2));

// fooChoice.name should be choice-[hash]
```

### Deploying A State Machine

- Describe how the build process will convert to YAML.
- Point out automation from using `typescript-microservice` scaffold versus not

### Inspecting a State Machine

- Describe how you can generate an SVG (or some visualization)
