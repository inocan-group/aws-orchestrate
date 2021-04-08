---
sidebar-depth: 3
---
# Serverless Build

## Overview

If you're thinking about this library you're probably already convinced that Typescript might be better than sliced bread. It's close right? Anyway, this final part of the `aws-orchestration` ecosystem provides a means to configure your serverless configuration using Typescript as the language for configuration.

At the end of the day, we're not replacing the `serverless.yml` file that defines your serverless service but offering to build it for you. By adopting this build system you will get the following benefits:

1. Define all of your config in Typescript (with strong typing and good commenting)
2. Define your handler functions inline with the handler code

Beyond getting strong typing, inline documentation, and more convenient co-existance of your handler function and it's config, this build process will automatically wrap in 

## A Strongly Typed Configuration

### Getting Started
As was mentioned in the intro, we will produce a `serverless.yml` file for you and instead we ask you to focus on a `serverless.ts` file (also hosted in the root of your repo). What the heck is a `serverless.ts` file? Well in the fine tradition of "starting at the end", here is an example of what your file might look like:

```ts
const config: IServerlessConfig = {
    service: { name: 'my-cool-service' },
    plugins: [ 'serverless-step-functions' ],
    provider: { profile: "cool" }
}

export default config;
```
> Example `serverless.ts` config file

The first thing to note is that the top level sections are the same as you'd have in the `serverless.yml` file. Turns out we are fan's of the "wheel" _just as it is_. The hopefully obvious difference is that in a Typescript file, you get typing. You get autocomplete, inline comments on properties, and you can only configure things that are actually allowed.

## Sensible Defaults

Next you might be thinking -- considering how big `serverless.yml` files can get -- that we're just being lazy and there's not a chance in hell this configuration could be it for a real project. But you'd be wrong.

The `aws-orchestrate` framework aims to provide sensible defaults to keep your initial configuration needs very short. Examples of this include:

- There is zero need to state "aws" for the `provider` field which the Serverless Framework asks for because this framework only supports AWS. 
- You _might_ decide that you want to start developing for the 'prod' `stage` but almost everyone wants the default stage to be 'dev' so we've just set that as the default. Want to roll the dice, go ahead and change it to whatever you like. Giddyup cowboy.
- We _do_ require an AWS "profile" so that the build process can leverage the credentials stored in it when we deploy but because AWS profiles can optionally state a region, we will default the `region` property to whatever your profile says it should be but if you didn't say in the config or credential file then it will default to `us-east-1` and you'll be treated like the sheep you always wished your sweater was made with.

If you don't trust magic (or for that matter _defaults_) you can always run `yarn sls_build` and we'll build the `serverless.yml` for you to gaze in wonderment in how much easier your life has gotten. You truely have arrived.

Ok, so sensible defaults definitely makes life easier but 

## Inline Handler Configuration


## Step Function Integration


## 