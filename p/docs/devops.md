---
sidebarDepth: 3
---
# Serverless Devops

**NOTE:** this functionality is still in pre-release. We sometimes lead with documentation first but please be aware that this has not yet been released into `aws-orchestrate`. Consider it "coming soon".

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

### Sensible Defaults

Next you might be thinking -- considering how big `serverless.yml` files can get -- that we're just being lazy and there's not a chance in hell this configuration could be it for a real project. But you'd be wrong.

The `aws-orchestrate` framework aims to provide sensible defaults to keep your initial configuration needs very short. Examples of this include:

- There is zero need to state "aws" for the `provider` field which the Serverless Framework asks for because this framework only supports AWS. 
- You _might_ decide that you want to start developing for the 'prod' `stage` but almost everyone wants the default stage to be 'dev' so we've just set that as the default. Want to roll the dice, go ahead and change it to whatever you like. Giddyup cowboy.
- We _do_ require an AWS "profile" so that the build process can leverage the credentials stored in it when we deploy but because AWS profiles can optionally state a region, we will default the `region` property to whatever your profile says it should be but if you didn't say in the config or credential file then it will default to `us-east-1` and you'll be treated like the sheep you always wished your sweater was made with.

If you don't trust magic (or for that matter _defaults_) you can always run `yarn sls_build` and we'll build the `serverless.yml` for you to gaze in wonderment in how much easier your life has gotten. You truely have arrived.

### To Infinity and Beyond

Ok, so sensible defaults definitely makes life easier but the cynical amoungst you will have noted that there are no function definitions and while we appear to be using the Step Functions plugins we're actually not defining those step functions in our config.

This is one of the bigger differences that come from using this build system. Both functions and step functions (aka, state machines or orchestration) are configured inline and not in the central configuration file. The next two sections will introduce this in more detail.

## Inline Handler Configuration

### Why Inline?
When you develop services using the Serverless framework the "entry point" for your services are _handler_ functions and typically you would write them in the language of your choice and once written you'd then head over to your `serverless.yml` file and register them in the configuration. There's nothing wrong with this process except that because the code and the configuration live apart from one another it adds a bit of friction to the process and discourages developers from properly annotating their handlers as well as being able to switch between code and configuration in the same location. On the surface this may seem like a small change but it's surprising sometimes how a small reduction of friction can aggregate into a bigger impact and in our experience this is a very nice developer DX improvement.

### Example of Usage

If the idea isn't yet fully crystalized yet, the best medicine is typically a real example. So without further ado, here's an example handler function:

```ts
export config: IHandlerConfig = {
    description: "my amazing handler where I do what others thought impossible",
    layers: ["arn:aws:lambda:us-east-1:999888377040:layer:that-thing:1"],
    events: [ { httpApi: { method: 'POST', path: '/give-it-to-me', cors: true } } ],
    memorySize: 2048
}

const fn: IHandlerFunction<Request, Response> = (req, res) { ... }

export const handler = wrapper(fn);
```

In this example, we are exporting two symbols: `config` and `handler`. So long as we do this the build system will automatically detect all of your handler functions under the `/src` directory and add them into the `serverless.yml` file at build time.

> **Note:** in fact, you don't actually need to export a `config` symbol but you'll get a generic configuration if you don't.

It's also worth noting that in our example we used the `wrapper` function included in this repo but you don't _need_ to. We just think you owe to yourself to bath in the lovely typing powers it gives you.

### Friends with Benefits

Now that you hopefully are excited about the nicities of having your functions auto-detected and brought into the `serverless.yml` automatically it's time for us to let you know there are a few more fringe benefits:

1. **Function Enumeration** - because we can detect your handler functions we can also provide you a typescript enumeration of 

### A Safety Hatch

These features are great but really only service Typescript Lambda functions and for that reason among others which we may remain unforseen for these humble library authors we need to be sure that there is a way to allow for you to work outside the system when you need to. 

In order to accomodate your rouge ideas we look for a `/functions.ts` file at _build time_ and if it exists and has a default export that is an array, we will use it _in addition_ to the auto-detected handler functions. An example might look like:

```ts
const rougeFunctions: IServerlessFunction[] = [
    { 
        handler: 'src/is-it-a-cat/cat-detector.handler',
        description: 'find cats in images using python ai lib',
        runtime: 'python3.6'
    }
];

export default rougeFunctions;
```

## Step Function Integration

When you add the Serverless Framework's plugin for step functions you are telling the build system that you're wanting to use the AWS's step functions and the build system, in a manner similar to with Lambda functions, will look in your `/src` folder for any step function definitions using the builder library that comes with this repo.

So, for instance, if you have a simple step function that represents a sequence of Lambda executions you might add a file `src/step-fns/mySequence.ts` to your repo:

```ts
import { StepFunction, StateMachine } from 'aws-orchestrate';
const stepFn = StepFunction().task('one').task('two').task('three');

export default StateMachine("mySequence", stepFn);
```


**TODO:** finish after completing API

By exporting a _default export_ of , it will be detected by the build system. If you've already included the step-function plugin to your configuration then it will automatically added to the definition of your step function into 

## Deployment

Up to now we've talked about the build system as something which takes strongly typed configuration in `serverless.ts` and converts to a fully compliant `serverless.yml` file. This is what we refer to as the "build step" and it is a critical first step in getting your service up to the cloud, but _deploying_ code is another part of this build system. This means that instead of typing `sls deploy` as you may be used to with the Serverless Framework we will ask you to instead switch to `yarn sls-deploy` to get this system's wrapper.

In the end, we are still using the Serverless Framework's deployment CLI but we want the chance to prep the environment first as well as add some DX nicities. Below is the pipeline that will be kicked off when you run `yarn sls-deploy`:

- Build's a fresh version of `serverless.yml` from your config
- Transpiles your TS to JS using Rollup (more on this below)
- Calls Serverless Framework's deploy

### Full Deploys and Per Function

The Serverless framework provides a "deploy" command that really has two distinct use-cases. 

- Deploy everything
- Deploy 1 or more functions
  
As we all find out soon enough that a full deploy is _necessary_ sometimes but function deploys are preferred in most cases as the cycle time is far shorter. There's nothing particular wrong with the API that the Serverless framework exposes but it feels a bit verbose. With the wrapper provided here you simply do one of the following:

1. `yarn deploy` - will bring up an interactive menu which lets you choose a set of functions to deploy 
2. `yarn deploy all` - deploys everything
3. `yarn deploy fn1 [fn2 fn3]` - deploys just the functions which 

Quietly -- in a rarely visited corner of the Internet -- a library author is congratulating themself for improving on what was already an entirely reasonable API. Hopefully you can join them in their happiness soon.

In all other regards we reflect the default API so if you want to state explicitly the _stage_ you use the same `--stage [stage]` syntax. Same goes for _region_, etc.

### Rollup Bundling

To keep your functions small and tree-shaken, the build system will ensure that all autodetected typescript handler functions are bundled using `Rollup` to remove dead code. We find Rollup gets a smaller bundle sizes relative to the popular Webpack plugin approach. If, however, you've used the `serverless-webpack` plugin before and are afraid of trying new things (yes that was a subtle dig) you can simply add the plugin to your configuration and we will not try and use Rollup for you. Just don't expect a Christmas card next year.

Assuming you're still on board with Rollup bundling, usage is fairly automatic but there are some subtlties for folks who like that sort of stuff.

- Closure Compiler.

    By default we will run your code through the Closure Compiler. This makes the transpiled JS smaller and sometimes a bit more efficient when run with the V8 engine. If you don't want that you can either set the `CC` environment variable to "off" or add `-cc off` on the command line.

    We typically recommend using the closure compiler for all _stages_ and this is what is done by default but you can also set the `CC` variable to a stage name and so doing we will only use the closure compiler when the stage name is what you've set `CC` to.

    Finally, there are times -- not very often but not _never_ -- where an individual handler is not compatible with the closure compiler. In these cases, you can opt-out at the function level by stating `closure: false` in the functions `IFunctionConfig` configuration.

- Conditional Transpilation.

    When you run a _deploy_ we will make sure your handlers are transpiled but rather than blindly transpiling each function we will attempt to transpile only those which have changed since the last time you deployed. During the deployment you will be informed of which functions _are_ and _are not_ being transpiled. If based on this feedback or general suspicion of algorithms you want to ensure that all files are transpiled you can force this with the `--force` switch on the command line.

- 




