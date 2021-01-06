---
sidebarDepth: 3
---
# Wrapper Function

This library exports a function `wrapper` which is intended to wrap all
serverless functions. It provides the following benefits:

- Strong "type safety" for your handler functions
- Consistent and strong error handling
- Built in logging (using `aws-log`)
- Simple access to `LambdaSequence` orchestration 
- ~~convenient access to connecting to a Firebase database (no code baggage though
  if you don't use this)~~
    >  Will be deprecated soon

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

It is important to capture errors in a way that is consistent and which provides good context to understand happened after the fact. For this reason the wrapper function provides a concise error management API that will help you to ensure your error handling is top shelf.

### Known Errors

Often you will know that a certain set of externalities may result in known error states and you can ensure that these errors return useful information as well as the appropriate HTTP error code. There are two means to do this:

1. **Throwing `ServerlessError`**. Within your code you can capture this error state in a try/catch block and then throw a `ServerlessError` :

     ```ts
     import { ServerlessError } from 'aws-orchestrate';
     try {
       // ...
     } catch(e) {
       throw ServerlessError(404, "No sir, didn't find it", "doing-something");
     }
     ```

     This is quite straight forward and doesn't really need any further explanation other than to say that you need to use the `ServerlessError` class when throwing the error.

2. **Error Mgmt API**. Using the wrapper's error API you can simply describe the error and it will be caught for you and transformed into a `ServerlessError` when this error is encountered. Configuration would look something like:

    ```ts
    const fn(req, ctx) {
      ctx.errorMgmt
        .addHandler(404, { messageContains: 'not found', 'doing-something' })
        .addHandler(500, { messageContains: 'what dat?', 'trouble-making' });
    }
    ```

    With this configured in the beginning of your handler, you be assured that any error which has the specified text in the message is tagged and handled as you would like. 
    
    In addition to the `messageContains` approach demonstrated above you can also use the `identifiedBy()` method to look for text in the error's `name` or `code` properties.

### Unexpected Errors

In addition to errors you _expect_ and want to shape with the approaches demonstrated in the _known errors_ section, we have errors you didn't expect. The wrapper function will make sure all of these are captured as well and thrown as `UnhandledError` messages.

### Error Payload

In Javascript an `Error` only has a few basic properties (e.g., message, stack, and name) but when using the wrapper function we ensure that all errors will report a richer set of information. The two error classes which will be thrown when using the wrapper function are `KnownError` and `UnexpectedError` and both implement the `IErrorContext` interface which includes:

- `handlerFunction` - the name of the handler function where the error occurred (this is not immediately important to logging in that functions cloudwatch logs but becomes very useful when forwarding onto another lambda which is intended to report on the error)
- `code` - a string based error code that can be leveraged for error handling and classification
- `httpCode` - a numeric HTTP status code associated to the error which will be passed back to API Gateway when it is the caller of the function
- `awsRequestId` - the unique AWS id assigned to a function's execution
- `correlationId` - the unique id assigned to all functions in an orchestration
- `request` - the request object that was sent in to initialize the state of the handler function
- `workflowStatus` - the part of the handler's overall workflow in which the error occurred
- `triggeredBy` - categorizing what _type_ of consumer called the function
- `caller` - if called via API Gateway then all sorts of client caller info will also be added

> As always, use this list as a guide but refer to the `IErrorContext` symbol for an always up-to-date reference of precisely what is available in all errors coming out of a handler function wrapped by the _wrapper_ function.

This error payload will be thrown as the last step in the wrapper function ensuring that a rich set of data is available to whoever is the reciever of this error.

### Error Forwarding

Whether the error which occurred is a _known_ or _unexpected_ error you may want to "handle" this error in some fashion. The most common example of this is forwarding on all errors to another lambda function which will then notify the appropriate parties. This is achieved with the error API's `setDefaultHandler()` method and would be configured something like this:

```ts
const async fn(req, ctx) {
  ctx.errorMgmt.setDefaultHandler('ReportMyError');
}
```

In the above example, `ReportMyError` is shorthand for another lambda function's ARN which you want to be called when an error occurs. The ARN reference can be a shorthand when you are using a handler function within the same repo but you can also use a full ARN to reference functions in other repos (so long as you have the appropriate permissions to call those functions).

The wrapper function's responsibility in cases where a handler has been defined is to:

1. **Forward Error** - makes an async invocation of the handler (passing the error as payload); this waits for AWS to confirm that this handler has been executed and then moves forward to step 2
2. **Throw Error** - throwing the error returning this error condition to the appropriate caller. If the caller is API Gateway, the error will be restructured to a format which API Gateway expects. In this case, the wrapper function will log the full error payload 

By default this forwarding will take place for _all_ errors and in most cases this is probably what you want. However, in more advanced configurations you may want to do different things with different errors. This too is possible and you should see the `setDefaultHandler()` as a _default_ way of handling the error. 

For errors which you want to _specifically_ configure where to forward errors onto another function, you can do this by setting the optional `forwardTo` property that exists as part of the `IErrorContext` contract that exists in both `KnownError` and `UnexpectedError`. To illustrate this with code you might expect to see something like:

```ts
const async fn(req, ctx) {
  ctx.errorMgmt
    .addHandler(
        404, 
        "No sir, didn't find it", 
        { forwardTo: 'MySpecialHandler' })
    .setDefaultHandler('MyDefaultHandler');
}
```

or if you're throwing a known error, the signature is basically the same:

```ts
try {
  // ...
} catch(e) {
  throw new KnownError(
      404, 
      "No sir, didn't find it", 
      { forwardTo: "MySpecialHandler", underlying: e}
  );
}
```

> **Note:** when using the error management API, any _underlying error_ will automatically be included in the error but as you see in the example above, if you are throwing an error you must include it yourself.

## Working with Orchestration

AWS provides StepFunctions as their primary solution for _orchestration_ but historically this was a pretty expensive service. As an alternative to Step Functions, this library provides the `LambdaSequence` workflow. This will be discussed in the next section and offers a completely valid and likely lower-cost solution for orchestration than Step Functions. 

With AWS's introduction of _express_ Step Functions, Step Functions are easier to "step into" if you will. If you prefer this option, we provide a very handy configurator for Step Functions that ensures that you have a strongly typed and properly configured Step Function before you ever attempt to deploy. This configuration will be covered as well in the section after we discuss `LambdaSequence`.
