---

next: 
---
# Getting Started

## Installing

Just like any other **npm** dependency you'll want to install like so:

```sh
# npm
npm install --save aws-orchestrate
# yarn
yarn add aws-orchestrate
```

## Functional Overview

We'll start with a brief overview of the various areas covered in this repo. And then each area will be covered in much greater detail in the following sections.

### Wrapper Function

The wrapper function provides strong typing, logging, error handling, and much much more. It get's its name from the fact that it _wraps_ around your handler function like so:

```ts
const fn: IHandlerFunction = async (req, ctx) => { // your code ... }
export handler = wrapper(fn);
```

### Step Function Builder

Step Functions are the main _orchestration_ feature in the AWS landscape. They are powerful and with the introduction of _express_ step functions they are economic now too. Another nice thing about Step Functions is that, even though the implementation is proprietary the _states_ language has been open sourced. This has led to vendors/startups like Supabase choosing this state language to produce their own orchestration layer.

With all this "goodness" available, what's not to love? Well in part the JSON and/or YAML configuration can be quite hard to follow at times. Visualizations are nice when you can get them but Step Functions require a full deployment to get them up into the cloud and it's far too easy to make a silly mistake and have to rerun the deployment.

Within this repo we provide a set of builder patterns that allow you to produce highly composable and strongly typed step functions which can be transpiled back to the same old JSON/YAML you've come to love (or hate). These make reuse much more possible and virtually ensure that you're step function will be valid structurally before you ever try to deploy it.

### Serverless Devops

This framework builds on top of the Serverless Framework which continues to grow but at it's heart it is a _deployment_ framework (and henceforth a devops framework). The "serverless devops" aspects of this repo attempt to provide a reduced level of cruft in getting your service/app up and running while also providing a strongly typed environment to do it with.