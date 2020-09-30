---
sidebar: auto
---

# Step Functions

## Introduction

AWS offers their [**Step Functions**](https://aws.amazon.com/step-functions/) as a means to create powerful orchestration of lambda functions through a proprietary UDL . 

We can write a definition of our desired _step function_ that would be composed of multiple steps that would receive an state that can be manipulated (handled) by steps (as `Task Step`) _aka State Machine_.

As we metioned earlier _step functions_ definition is composed of __Steps__, and already mentioned one above (__Task Step__), which is the most common used step because it let us call an aws service as _AWS Lambda function_. There are others Step Types as conditional, map/parallel, and terminal steps like `Fail` or `Success`. 

The intent of this `module` is to give users and strongly typed and friendly API that let define step functions with more `confidence` and integrate smoothly with other `aws-orchestrate` functionalities as passing, correlation id, ssm secrets, etc.

## Terminology

### Overview 

We will attempt to define key terms which will be reinforced in the API (and type system) to describe key constructs when writing step functions:

<mermaid>
graph TD
    SM(State Machine) -->| defined by | SF(Step Function)
    SM -->|also has| MD(Meta Data)
    SF -->|has many| S(Steps)

    style MD fill:#FFF,stroke:#bbf,stroke-width:2px,color:#aaa,stroke-dasharray: 5 5

</mermaid>

### State Machine

Even though the service is called "Step Functions", ultimately it a **State Machine** that you "deploy" to AWS and get a uniquely identifying ARN back to make reference to. There are two key parts of the "meta-data" which help define a State Machine:

1. `name` - the name of your state machine, it should be unique for the given repo you're working on but there's no need to assure uniqueness across repos as this is what the ARN is for
2. `type` - historically there was only one type but more recently an EXPRESS type has been introduced and it's important to [know which _type_ your state machine should use](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-standard-vs-express.html). In most cases, if you can use Express than you _should_ use express.

The bulk of the _state_ in the State Machine, however, is not in the meta data but in the `definition` property which we will refer to as a **Step Function** (see next section).

### Step Function

A **Step Function** is a definition of all possible states/steps which can be *moved into* in the state machine, along with instruction on how to move to the _next_ state. A complex step function can indeed be quite complex and because the AWS State Definitions are in YAML, you get no typing support at design time. Furthermore, step functions require a "full deploy" to get new versions to AWS. 

This can lead to a sometimes tiresome loop of: "making silly mistake, deploying, identifying new mistake, deploying, etc." The **aws-orchestrate** library dramatically helps reduce this loop by providing a `StepFunction` utility function which provides strong typing that ensures what you've *built* will *deploy*.

There will be much more detail in the [Examples](#examples) section but you might expect a Step Function to be defined something like this:

```typescript
import { StepFunction } from 'aws-orchestrate';

const myStepFn = StepFunction()
 .task(HandlerFn.first)
 .task(HandlerFn.next)
 .task(HandlerFn.last, { timeout: 3000 })
```


### State(s)

A state machine must have "states" but of course from a terminology standpoint we say that a _state_ belongs to the **Step Function** and that this function is then formalized by being wrapped by a **State Machine**. Anyway ... semantics. Who has the time? 

In the next section we'll review all of the "kinds" of states that you can use to compose a Step Function.

## Building Blocks

In this section we'll review the most important _kinds_ of **state** you can include in a step function. While there are a few others you can use, they are edge cases and are easily found using the Typescript-powered intelisense (more on this in the [Examples](#examples) section).

In Step Functions there are some important _patterns_ / _capabilities_ that are worth understanding up front. These include:

### [**1. Task** ](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-task-state.html)

The "task" is the most important part of most state machines as this is where your Lambda functions are called and the state machine is manipulated (via the Lambda's compute). Without any tasks, a step function would get pretty dull very quickly.

Configuring a task within **aws-orchestrate** involves using the `task()` function. The only *required* parameter is the AWS **ARN** that uniquely identifies the function, however there is an optional second parameter for additional configuration.

```typescript
task("arn:xxxxxxxx", { timeOutSeconds: 2000 })
```

> **Note:** there _are_ more advanced patterns of calling into different AWS service integrations (such as SNS, SQS, etc.) [see docs](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-task-state.html) which utilize a different set of parameters than the standard set and you can not use them when building with the `task()` function. Over time we will add these individual items as their own part of the API (instead of overloading the `task()` function)

### [**2. Choice** ](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-choice-state.html)

This allows the step function to be challanged with any number of logical _conditions_ where the first condition which matches will be picked and it's _sub_ Step Function will be handed over the state management.

``` mermaid
graph LR
    START(( )) --> S1((State))
    S1 --> C1((Choice))
    C1 -->|condition| C11((State))
    C11 --> C12((State))
    C12 --> E1(( ))
    C1 -->|condition| C21((State))
    C21 --> E2(( ))
    C1 -.->|default| C31((State))
    C31 --> C32((State))
    C32 --> E3(( ))

    style START fill:#EFED91,stroke:#7E7E7E,stroke-width:1px,color:#aaa
    style E1 fill:#62B491,stroke:#62B491,stroke-width:0px,color:#aaa
    style E2 fill:#62B491,stroke:#62B491,stroke-width:0px,color:#aaa
    style E3 fill:#62B4B3,stroke:#62B4B3,stroke-width:0px,color:#aaa
```

In addition to expressing a ordinal number of _conditions_ which you are looking for a match on you may also include a "default" Step Function to run through (this is recommended as a best practice).

Configuring a choice will look something like:

```typescript
StepFunction().choice([
    // conditions
    [ '$.temp', o => o.NumberGreaterThan(100), s => s.task(HandlerFn.itsHot) ]
    [ '$.humidity', o => o.NumberGreaterThan(0.9), s => s.task(HandlerFn.itsWet) ]
    // default faultback
    [  s => s.task(HandlerFn.foo) ]
  ],
  config
)
```

State Machine => Step Fn Definition, type, name, etc.

### 3. Map and Parallel

The `Map` and `Parallel` state types both start parallel execution pipelines but in slightly different ways:

- [**Map** ](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-map-state.html)

    A Map state is intended to execute over *the same* Step Function in parallel where each instance is given a different set of inputs to use (and therefore work is not duplicative). This is done by choosing an *iterable* property in the request/input to the Map state

    ``` mermaid
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

- [**Parallel** ](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-parallel-state.html)

    A _parallel_ state is intended to execute over an ordinal number of step functions (presumably different ones) in parallel.

    ``` mermaid
    graph TB
        START(( )) --> P1[[Parallel]]
        P1 -->|params| PS11((S))
        P1 -->|params| PS21((S))
        P1 -->|params| PS31((S))

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

    Defining a set of parallel step-functions leverages the `StepFunction()` utility:

    ```typescript

    StateMachine().parallel([

    ])
    ```

### 4. Wait

Well last but possibly not least is `Wait` ... thanks for waiting for it. All kidding aside, the Wait state is actually a very cool feature that Step Functions bring. In fact, sometimes it may be the sole reason you decided to step away from plain old Lambda execution. Why?

### Step Function Definition:

```typescript
import { StepFunction, ITaskConfig } from 'aws-orchestrate'

/**
 *  If we want to point to a lambda function existing in our same project we can use
 *  Enum generated by `aws-orchestrated` and it will be translated to the right ARN 
 *  or just use the ARN string
 */
const myStepFunction = StepFunction<InitialState>("myStepFunctionName")
    .task(HandlerFn.SiteIsUp, { timeOutSeconds: 2000 })
    // to point to an lambda resource outside of our project we also can use ARN string
    .task("ARN string")
    // to be able to configure options as Retry, Timeout
    .task(config)
    // to define error handlers, it must be just after the task definition
    .catch("ARN string") // or config object `ITaskConfig` {}
    // we can continue the workflow after an error handled
    .task(HandlerFn.MyLambdaFunction2)
    .success()

const task = <T = string>(fn: T, config: Omit<ITaskConfig, 'name' | 'next'>)

const config: ITaskConfig = {
    name: HandlerFn.MyLambdaFunction, // or "ARN string"
    retry?: 1, // default 0
    timeOutSeconds?: 1000,
    end?: false // we can explicitly make this step as final step in the current scope. It's useful on `Map`Step
}
```
 
   * _Note: Keep in mind that the order of how we defined our step function is very critical because that's the order of how it will be translated to `yaml` definition._

<mermaid>
graph TB
 star("Start") --> task1[MyLambdaFunction] -- catch --> errorHandler[MyLambdaFunction Error Handler]
   task1 --> task2[MyLambdaFunction2]
   errorHandler --> task2
   task2 --> success(Success)
</mermaid>


* __Parallel:__ provides each branch with a copy of its own input data. It generates output that is an array with one element for each branch, containing the output from that branch.

```typescript
import {StepFunction, ParallelBranch} from 'aws-orchestrate'
import {IMyStepFunctionInput} from "src/stepFunctions"

const myStepFunction = StepFunction<IMyStepFunctionInput>("myStepFunctionName")
    .task(ServerlessConfigLambdaEnum.MyLambdaFunction)
    // fan-out
    .parallel({
        input: state => state.PropToUseAsInput, // optional. default will be the entire state
        target: state => state.PropToUseAsTarget, 
        branches: [branch1, branch2]
        })
    // fan-in
    .task(ServerlessConfigLambdaEnum.MyLambdaFunction2)
    .success()

const branch1 = StepFunction().parallel
    .task(ServerlessConfigLambdaEnum.Branch1MyFunction1)
    .task(ServerlessConfigLambdaEnum.Branch1MyFunction2)
    .choice()

const branch2 = ParallelBranch
    .task(ServerlessConfigLambdaEnum.Branch2MyFunction1)
    .catch(ServerlessConfigLambdaEnum.Branch2MyFunction1ErrorHandler)
```

``` mermaid
graph TB
  star("Start") --> task1[MyLambdaFunction] --> parallel[Parallel]
    parallel .-> branch1[Branch 1]
    parallel .-> branch2[Branch 2]
    branch1 .-> b1fn1[Branch1MyFunction1]
    b1fn1 .-> b1fn2[Branch1MyFunction2]
    b1fn2 .-> task2[MyLambdaFunction2]
    branch2 .-> b2fn1[Branch2MyFunction1]
    b2fn1 -- catch .-> errorHandler[Branch2MyFunction1ErrorHandler]
    errorHandler .-> task2
    task2 --> success(Success)
```

* __Map:__ executes the same steps for multiple entries of an array in the state input.

```typescript
import {StepFunction, MapBranch} from 'aws-orchestrate'
import {IMyStepFunctionInput} from "src/stepFunctions"

const myStepFunction = StepFunction<IMyStepFunctionInput>("myStepFunctionName")
    .task(ServerlessConfigLambdaEnum.MyLambdaFunction)
    // fan-out
    .map({
        input: state => state.arrayPropInput,
        branch: myMapBranch,
        timeOutSeconds?: 1000,
        })
    // fan-in
    .task(ServerlessConfigLambdaEnum.MyLambdaFunction2)
    .success()

const myMapBranch = MapBranch
    .task(ServerlessConfigLambdaEnum.Branch1MyFunction1)
    .task(ServerlessConfigLambdaEnum.Branch1MyFunction2)

```

``` mermaid
graph TB
  star("Start") --> task1[MyLambdaFunction] --> map[Map]
    map .-> b1fn1[BranchMyFunction1]
    map .-> b2fn1[BranchMyFunction2]
    b1fn1 .-> b1fn2[BranchMyFunction2]
    b1fn2 .-> task2[MyLambdaFunction2]
    b2fn1 .-> b2fn2[BranchMyFunction2]
    b2fn2 .-> task2
    task2 --> success(Success)
```

* __

* __Wait:__ delays the state machine from continuing for a specified time.

```typescript
import {StepFunction} from 'aws-orchestrate'
import {IMyStepFunctionInput} from "src/stepFunctions"

const myStepFunction = StepFunction<IMyStepFunctionInput>("myStepFunctionName")
    .task(ServerlessConfigLambdaEnum.MyLambdaFunction)
    .wait(200) // Milliseconds 
    .success()

```

* __Success:__ stops an execution successfully.

```typescript
import {StepFunction} from 'aws-orchestrate'
import {IMyStepFunctionInput} from "src/stepFunctions"

const myStepFunction = StepFunction<IMyStepFunctionInput>("myStepFunctionName")
    .task(ServerlessConfigLambdaEnum.MyLambdaFunction)
    .success()

```

* __Fail:__ stops the execution of the state machine and marks it as a failure.

```typescript
import {StepFunction} from 'aws-orchestrate'
import {IMyStepFunctionInput} from "src/stepFunctions"

const myStepFunction = StepFunction<IMyStepFunctionInput>("myStepFunctionName")
    .task(ServerlessConfigLambdaEnum.MyLambdaFunction)
    .fail()
    // or
    .fail({
        /**
         * Provides a custom failure string that can be used for operational or diagnostic purposes.
         */
        cause: "Cause", 
        /**
         *  Provides an error name that can be used for error handling (Retry/Catch), 
         *  operational, or diagnostic purposes.
         */
        errorName: "Error Name"
    })

```

## Wrapper Integration

If you're using **aws-orchestrate** we assume you're also using the included `wrapper()` function to gain strong typing on your Lambda handler functions. As you'll likely know too, this wrapper provides some useful features which would be a shame to miss out on simply because your Lambda function was called by AWS's Step Functions.

## Utility Functions

In addition to the `StateMachine()` and `StepFunction()` utilities you'll see in the [examples](#examples) section, there are also some smaller grain utilities that will help you to achieve stronger typing:

### `req()` fn

AWS provides a number "path parameters" to Step Function's states which represent a means to 

### `ctx()` fn


## Examples

### Defining A State Machine

```typescript
import { StepFunction } from 'aws-orchestrate';

const myStepFn = StepFunction()
 .task(HandlerFn.checkTemp)
 .task(HandlerFn.checkHumidity, { timeout: 2000 })
 .choice([
    [ 
        '$.temp', 
        o => o.NumberGreaterThan(100), 
        s => s.task(HandlerFn.itsHot) 
    ],
    [ 
        '$.humidity', 
        o => o.NumberGreaterThan(0.9),
        s => s.task(HandlerFn.itsWet) 
    ],
    [  
        s => [ s
            .task(HandlerFn.cryMeARiver)
            .task(HandlerFn.stopComplaining) 
        ], // default fallback
    ]
 )
```


### Deploying A State Machine
- Describe how the build process will convert to YAML.
- Point out automation from using `typescript-microservice` scaffold versus not

### Inspecting a State Machine
- Describe how you can generate an SVG (or some visualization)