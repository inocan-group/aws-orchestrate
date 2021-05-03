---
sidebarDepth: 3
---
# Handler Wrapper

This library exports a function `wrapper` which is intended to wrap all
serverless handler functions. What it provides are the following:

- strong **type safety** for your handler functions
- a **consistency** abstraction to ensure your request parameters are always typed and where you expect them to be regardless of the caller
- opinionated **logging** framework that ensures context while helping to block secrets slipping in
- opinionated **error handling** which ensures that all errors are caught and appropriate handling can be put in place.
- low friction ways to reach out to **secrets**, lambda and step function **invocation**, and XRay **tracing**

## Usage

The basic usage pattern is to include the following in your serverless handler
file:

```typescript
import { wrapper, IHandlerFunction } from 'aws-orchestrate';

const fn: IHandlerFunction<IRequest, IResponse> = async (request, context) => {
  // your function goes here
};

export const handler = wrapper(fn);
```

This now provides a very similar signature for your function to work off but
three things are immediately improved:

- All errors _will_ be handled and if you like you can take greater control of
  that
- The _request_ and _response_ data structures will automatically be passed to
  you regardless of whether the function was called from another Lambda or from
  AWS Gateway.
- The `context` object has lots of new features that hang off of it (all the
  standard ones are there too)

## The Request

When you use AWS Lambda "out of the box" you will get an event/request object that will vary based on how it was called. In cases where your function is reponding to an API Gateway event you will typically get the **Lambda Proxy Integration** response. This gives you a whole host of name value pairs including the `body` which is a string representation of the body of your request message. In contrast, when your function is called from another function the event object is the object notation which was sent out by the calling function.

This variance can be dealt with but it is noisy and introduces complexity in terms of getting a strongly typed input in the event object. This nuisance is made even more complicated by functions which can be called by _both_ the API Gateway and other functions.

> Where possible, it is considered good practice for your handler functions to be neutral to the _caller_ of your function; this gives more utility/reuse.

Fortunately, using the `wrapper` function makes all of this VERY easy. The `request` object passed into your handler function will ALLWAYS be a strongly typed message defined by the first _generic_ passed to the `IHandlerFunction` type. Let's take a look at how this might look before using the wrapper:

**regular handler:**

```typescript
export handler: (event: any, context: IAwsContext ) {
  let request: IRequest;
  if(event.body && event.headers) {
    request = JSON.parse(event.body) as IRequest;
  } else if (event.body && event.headers) {
    // this situation arrises when LambdaSequence functions are
    // calling one another
    request = JSON.parse(event.body) as IRequest;
  } else {
    request = event as IRequest
  }
  // now we have a TYPED request object that we can rely on
}
```

**wrapper handler:**

```typescript
const fn: IHandlerFunction<IRequest, IResponse> = (request,context ) {
  // immediately have a strongly typed request object
}

export handler = wrapper(fn);
```

This expression of an _input_ and _output_ contract is a great way to start writing your function. Explain what it does and then describe precisely the data in and out. In most examples you'll only need this typing but if you want to go further you can also type the _query parameters_ and _path parameters_. The generics provided from `IHandlerFunction` are:

```ts
interface IHandlerFunction<I, O, Q, P> { ... }
```

where `Q` represents the query parameters, and `P` the path parameters. 

## Enhanced Context

If you're used to AWS Lambda functions you'll be used to having both the "event" and some additional
"context" being provided via the API. By using the `wrapper` function you still get the same two parameters but the _context_ will have a **super set** of what you get by default.

The wrapper object is fully typed (and therefore self-documenting) but here are some highlights:

### APIs

- `getSecrets()` - integrates with AWS's `SSM` to provide a secure and cost effective way of managing secrets
- `errorMgmt` - a simple API surface to manage error handling
- `log` - provides a logging API for you to use in place of dropping `console.log()` statements throughout.
- `invoke` - asynchronously call another Lambda function from your handler
- `invokeStepFn` - asynchronously kick off a Step Function

> All of the above API's will be covered in later sections in greater detail

- `setSuccessCode` - by default we'll return a status code of 200/204 based on whether there is content but you can override to whatever you like.
- `setHeaders` - when responding to API Gateway we will take care of most headers for you but you can add to those we've set for CORS, Content-Type, etc.
- `setContentType` - we default to _application/json_ as the response format but you can change this as you see fit.


### Additional Props
- `headers` - the headers made in the request (if there were headers)
- `isApiGateway` - a boolean flag to identify if the caller was API Gateway
- `apiGateway` the API Gateway dictionary (with the body removed to dedup); this and several other props is only available when the caller is API Gateway
- `token` - if a value was passed in in the `Authorization` header has a value it will be placed here
- `verb` - the RESTful verb used in an API Gateway call
- `queryParameter` - strongly typed dictionary of query parameters
- `pathParameters` - strongly typed dictionary of path parameters


## Typed Returns

Unlike traditional Lambda functions, with the wrapper function your return types will be strongly typed. That means that if you state your return type to be:

```typescript
export interface IResponse {
  foo: string;
  bar: number;
}
```

This will be enforced by Typescript when you return from your function. What about when you're returning to a API Gateway caller? No problem, there is zero difference, you just return the body and the `wrapper` function will ensure that the message will be prepared in an appropriate manner for API Gateway.

So imagine that you have an API Gateway caller then you would return like this:

```typescript
const fn: IHandlerFunction<void, IResponse> = (request, context) => {
  return {
    foo: 'hello world',
    bar: 1
  }
}
```

and this would in turn respond to API Gateway with:

```typescript
{
  statusCode: 200,
  headers: {
    "X-Correlation-Id": "1234dkjgdfg",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Content-Type": "application/json"
  },
  body: '{ "foo": "hello world", "bar": 1 }'
}
```

As you can see, without doing anything it returns a valid API Gateway response which also includes CORS headers and the `correlationId` for the function/sequence, and an appropriate **Content-Type** value.

> There is no need to tell the `wrapper` function whether the handler has been called by API Gateway or not; it will detect this for you.

## Logging

The context object passed into handler function has a `log` property on it which give you access to a logging API provided by [`aws-log`](https://github.com/inocan-group/aws-log):

```typescript
const { log } = context;
log.info('this is my message', { foo, bar })
```

This logger should be used over `console.log` in 100% of cases. Not only does it ensure your logs are properly structured in JSON format (important for log monitoring solutions) but it also:

- Ensures that any "secrets" are masked before they accidentally bleed into the logs. You _can_ manually mask values but all "secrets" brough in via the getSecrets() API surface are automatically masked for you.
- Contextual information from the Lambda environment is automatically added to your log messages to give a richer information ecosystem to your logs
- You can specify, on a _per stage_ basis, which log levels are written to **stdout**. This flexibility includes "sampling" certain log levels so you can maintain rich information in production without overwhelming storage limits.

In order to configure the logging levels you want per stage, you will do this on the wrapper's "option hash". So for instance:

```ts
const handler = wrapper(fn, { logging: { 
  debug: "none", info: "all", warn: "all", error: "all" 
}});
```

Here we've stated which _levels_ of severity we want to publish and in this case we're being consistent for all development stages. Being this uniform is rarely what you want and as we'll see the options are not just _all_ or _none_.

### Logging by Stage

This is the most common thing to see in configuration. Typically you'll want all of your logs in development stages but in production, where volumes are much heavier, tracking everything will have a real world cost to them.

### Sampling and Sampling Rates

Beyond specifying _per stage_ what your configuration is, we can state that we'd like a random percentage of logs logged. This is very handy in production where we might be tempted to turn off something like the _debug_ level but in doing so we miss out on some of the richness in what is in fact our most important environment.

### A More Advanced Example

In the following example we'll see both _stage_ based configuration as well as sampling:

```ts
const dev = { debug: "all", info: "all", warn: "all", error: "all"} ;
const prod = { 
  debug: "sample-by-session", 
  info: "all", 
  warn: "all",
  error: "all", 
  sampleRate: .25
} ;

const handler = wrapper(fn, logging: { dev, prod });
```

Here you'll see that we've got different configurations for the `dev` and `prod` stages but in production we're only taking 25% of the logs at the **debug** severity level. That's it for now but the API is fully typed and self-documented and you can also refer to the `aws-log` README for details as well.

### Global Configuration

When it comes to configuring logging, we've shown how this can be done using the wrapper function's
_options hash_ and this approach works and gives fine-grained control at the handler function level. Sometimes this is exactly what is wanted but often we want to choose a logging configuration
across _all_ functions and while you can certainly do that with this approach it could get cumbersome. To address this, the logging feature will look for and ENV variable called `LOG_CONFIG` and if found it will use this if no function-specific config is found.

Environment variables must always be _strings_ but to provide consistency in capability and structure from the programatic configuration we simple ask you put in a JSON stringified object. If you have a `env.yml` config you might put something like:

```yaml
global: &all_stages
  LOG_CONFIG: '{ "debug": "all", "info": "all", warn: "all", error: "all" }'
prod:
  <<: *all_stages
  LOG_CONFIG: '{ "debug": "sample-by-session", "info": "all", warn: "all", error: "all" }'
```

and if you choose to use the devops system that's part of this repo you can do the same in a `env.ts` file but with strong typing and autocomplete:

```ts
import { Env } from "aws-orchestrate";
export default Env()
  .global()
    .LOG_CONFIG({debug: "all", info: "all", warn: "all", error: "all"})
  .prod()
    .LOG_CONFIG({debug: "sample-by-session", info: "all", warn: "all", error: "all"})
);
```


## Secret Management

It is all too common that "secrets" are stored in ENV variables and/or other sub-optimal solutions. This often leads to unintentional leaks, whether it be a larger audience viewing the variables than would be ideal or as we've seen too many times the accidental commit of ENV variables to a repo.

This sub-optimal secret management is in large part due to the friction (and/or cost) of a more robust solution but fortunately AWS has a cost effect solution in [SSM Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-about-examples.html). With the `wrapper` function our aim is to reduce the friction of use as much as possible.

First off you can access secrets in your handler functions with the use of the `getSecrets()` API surface. It allows you to state which "modules" of secrets you need. For instance, imagine that you want secrets relating to **Firebase** and **Sendgrid**:

```typescript
const fn: IHandlerFunction<IRequest, IResponse> = async (request,context ) {
  const secrets = await context.getSecrets('supabase', 'sendGrid');
}
```

With this one line of code you are able to get all secrets associated with `supabase` and `sendGrid`. Further, these secrets are isolated to the "stage" that you are at. This ensures that your _development_ functions will go against your _development_ Firebase database rather than staging, production, etc.

> Note: we use the [`aws-ssm`](https://github.com/inocan-group/aws-ssm) repo as a minor abstraction to both adhere to a opinioned convention around naming but also because we prefer the API surface than AWS's.

## Error Handling

All errors encountered in your handler function will be trapped by the `wrapper` function and will report the error in a reasonable way without any configuration. If, however, you want to take a more active role than you can by leveraging one of two distinct mechanisms:

1. the Error Management API at `context.errorMgmt`
2. use or extend the `ServerlessError` class exposed by this library

In general, there are three error types you will get when using the wrapper function:

- `ServerlessError` - an explicitly thrown error which includes an HTTP status to handle the needs of all callers. This is the primary tool you'll use to throw errors you want to trap and the wrapper function uses this too for it's errors.
- `KnownError` - you can use the error management API to define certain error conditions you may encounter and what to do with them. In these cases the errors will be wrapped up as `KnownError`s.
- `UnknownError` - errors sometime occur unexpectedly and if aren't expressly throwing a **ServerlessError** or using the error API to setup for **KnownErrors** the remaining errors will be cast as **UnknownErrors**.

### ServerlessErrors

As has been discussed, the ServerlessError is available to you as the author of handler functions. It's signature is as follows:

```typescript
throw ServerlessError(403, "your message", 'type/subtype');
```

The first parameter represents the HTTP error status code. The message is the message. And finally you're asked to provide a type/subtype classification of the error.

> Note: if you want to wrap an _underlying_ error you can do so by assigning it to the `underlyingError` property of the ServerlessError.

For most people, use of the `ServerlessError` provides a straightforward means of throwing errors which will be seen by the wrapper as intentional error which do not need error handling applied. As hopefully is already clear, you need not _catch_ your ServerlessErrors as the wrapper will do this and ensure that it is logged and then handled appropriately for the specific caller.

### Error Management API

The `errorMgmt` property on the **context** object provides you an openning to do more advanced things in error management. The first of which is defining _known errors_ and expressing how they should be handled.

As an example, have a look at the following expression:

```typescript{2}
const fn: IHandlerFunction<IRequest, IResponse> = async (req, ctx) {
  ctx.errorMgmt.addHandler(403, { messageContains: "not allowed" });
}
```

This states that any error thrown which contains "not allowed" in the message should be set to the HTTP status code of 403. Because it is now _known_ when this pattern presents it will be wrapped as a `KnownError`.

Beyond simply changing the HTTP code, you can also take two other actions:

1. Add a callback "handler"
2. Forward the error to another Lambda

In the case of a callback, you are given an asynchronous callback to do what you need _in process_ either to create a useful side effect like sending an email, etc. or you can actually attempt to _fix_ the problem. The callback's return type is `false` for "did not fix" and otherwise expects you to meet the response typing contract that you're operating under.

### Unknown Errors

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

