# Serverless Wrapper

This library exports a function `wrapper` which is intended to wrap all
serverless functions. What it provides are the following:

- strong **type safety** for your handler functions
- a **consistency** abstraction to ensure your request parameters are always typed and where you expect them to be regardless of the caller
- opinionated **logging** framework that ensures context while helping to block secrets slipping in
- opinionated **error handling** which ensures that all errors are caught and appropriate handling can be put in place.

## Usage

The basic usage pattern is to include the following in your serverless handler
file:

```typescript
import { wrapper, IHandlerFunction } from 'aws-orchestrate';

const fn: IHandlerFunction<IRequest, IResponse> = async (request, context) => {
  //
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

> It is considered good practice for you handler functions to be neutral to the _caller_ of your function; this gives more utility/reuse.

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

This is obviously more compact but this is just the beginning.

## Enhanced Context

If you're used to AWS Lambda functions you'll be used to having both the "event" and some additional
"context" being provided via the API. By using the `wrapper` function you still get this same two parameters but the _context_ will have a **superset** of what you get by default.

The wrapper object is fully typed (and therefore self-documenting) but here are some highlights:

- `database()` - if you are using **Firebase** as your backend you can call this and it will connect you to the database automatically as well as cache the connection so all subsequent calls will used the cached connection. Since this cache reference is outside the handler function itself it then can sometimes remain connected between Lambda executions.
- `getSecrets()` - provides a means to gain access to secrets; it will look through passed in header secrets and then go out to AWS's `SSM` for anything not found locally.
- `sequence` - gives you a `LambdaSequence` object to interogate. You can test if the function is running within a sequence with `const isSequence = context.sequence.isSequence();`.
- `headers` - regardless of how your function was called you will get a hash of header values
- `errorMgmt` - provides a simple API surface to manage error handling in your function
- `log` - provides a logging API for you to use in place of dropping `console.log()` statements througout. The logging API -- coming from `aws-log` library -- ensures your log messages are always a structured JSON object and that useful Lambda context is provided with every log event. In addition, and this is **super** important, it gives your logs a "correlationId" which is passed through every LambdaSequence you are in (ensuring you can trace logs across the full sequence instead of just function by function).

## Typed Returns

Unlike traditional Lambda functions, your return types will be strongly typed. This means that if you state your return type to be:

```typescript
export interface IResponse {
  foo: string;
  bar: number;
}
```

This will be enforced by Typescript when you return from your function. What about when you're returning to a API Gateway caller? No problem, there is zero difference, you just return the body and the `wrapper` function will ensure that the message will be prepared in an appropriate manner for API Gateway.

So imaging that you have an API Gateway caller then you would return like this:

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

The context object passed into handler function has a `log` property on it which give you access to a robust logging API provided by `aws-log`:

```typescript
const { log } = context;
log.info('this is my message', { foo, bar })
```

This logger should be used over `console.log` in 100% of cases. Not only does it ensure your logs are properly structured in JSON format (important for log monitoring solutions) but it also:

- Ensures that any "secrets" are masked before they accidentally bleed into the logs. You _can_ manually mask values but all "secrets" brough in via the getSecrets() API surface are automatically masked for you.
- Contextual information from the Lambda environment is automatically added to your log messages to give a richer information ecosystem to your logs
- You can specify, on a per "stage" basis, which log levels are written to **stdout**. This flexibility includes "sampling" certain log levels so you can maintain rich information in production without overwhelming storage limits.

For more on this logging framework, check their own docs: [`aws-log`](https://github.com/inocan-group/aws-log).

## Secret Management

It is all too common that "secrets" are stored in ENV variables and/or other sub-optimal solutions. This often leads to unintentional leaks, whether it be a larger audience viewing the variables than would be ideal or as we've seen too many times the accidental commit of ENV variables to a repo.

This sub-optimal secret management is in large part due to the friction (and/or cost) of a more robust solution but fortunately AWS has a very cost effectly solution in [SSM Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-about-examples.html). With the `wrapper` function you get this cost-effective solution delivered to you in a very low-friction manner.

First off you can access secrets in your handler functions with the use of the `getSecrets()` API surface. It allows you to state which "modules" of secrets you need. For instance, imagine that you want secrets relating to **Firebase** and **Sendgrid**:

```typescript
const fn: IHandlerFunction<IRequest, IResponse> = async (request,context ) {
  const secrets = await context.getSecrets('firebase', 'sendGrid');
}
```

With this one line of code you are able to get all secrets associated with `firebase` and `sendGrid`. Further, these secrets are isolated to the "stage" that you are at. This ensures that your _development_ functions will go against your _development_ Firebase database rather than staging, production, etc.

## Error Handling

All errors encountered in your handler function will be trapped by the `wrapper` function and will report the error in a reasonable way without any configuration. If, however, you want to take a more active role than you can by leveraging one of two distinct mechanisms:

1. the Error Management API at `context.errorMgmt`
2. use or extend the `HandledError` class exposed by this library

### Handled Errors

The first concept to grok is the idea behind "handled" and "unhandled" errors. A "handled" error is where the consumer specifically/intentionally intends to throw errors given a certain set of circumstances. This is par for the course with two important exceptions:

1. The error which is thrown MUST have a valid HTTP status code (not part of the default Error from JS)
2. The handler wraps all the code that consumers write to capture _unhandled_ error so it must be able to distinguish between an error that the handler author intended versus one that happened without real handling for it.

Both of the above conditions are met by either using or extending the `ServerlessError` symbol from this library:

```typescript{6-7}
const fn: IHandlerFunction<IRequest, IResponse> = async (req, ctx) {
  try {
    // do something which may throw something you want to handle
  } catch(e) {
    if(e.message.includes('not allowed')) {
      // Something you recognized might happen
      throw ServerlessError(403, e.message, 'not-allowed');
    }
    // this is an unhandled error just throw it and let the wrapper manage this
    throw e;
  }
}
```

This is typically the best way to handle your expected error states but you can also use the built in error management API found at `context.errorMgmt`. An example of this could be:

```typescript{2-4}
const fn: IHandlerFunction<IRequest, IResponse> = async (req, ctx) {
  // any error which contains the text "not allowed" in it will be mapped to the
  // **403** error code.
  handlerContext.errorMgmt.addHandler(403, { messageContains: "not allowed" });
}
```

### Un-Handled Errors

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Working with Sequences

There are two modes in which `LambdaSequence`'s play a role in handler functions:

1. **Kick-off:** a "conductor" function may define and then kick-off a `LambdaSequence`
2. **Operating:** a function may be operating within a `LambdaSequence` and therefore need to **invoke** the next function in the sequence.

In both cases the `wrapper` function will help to make this process easier.

We will start with the _operating_ mode first because it is so easy. How easy? Completely transparent. In this mode your function simply goes about its responsibilities and when the function returns, the `wrapper` will detect what function comes next (if any) and send the current function's output along to this function for you (along with any other information structured by the conductor). If, for whatever reason, your handler function wants to introspect the state of the sequence -- or lack thereof -- you are given access to a `LambdaSequence` off the `context` object. For example, you can validate that a given function _is not_ running in a sequence with this conditional branching:

```typescript
if (context.sequence.isSequence) {
  // do something
}
```

Just because you _can_ introspect whether you're running as part of a sequence or not, in most cases it will be best to have your function operate independantly of this knowledge and allow the `wrapper` to manage this for you.

In the case of a **Conductor** function, this function would be expected to start its execution _not_ being part of a sequence but instead it's responsibility is to _create_ a sequence. Once it has defined the sequence, the only step the conductor must make is to _register_ it for execution. The example below illustrates this:

```typescript
import { LambdaSequence, registerSequence } from 'aws-orchestrate';
// ...
const sequence = LambdaSequence.add('fn1')
  .add('fn2', { temperature: '75' })
  .add('fn3');

registerSequence(sequence);
```
