# Serverless Wrapper

This library exports a function `wrapper` which is intended to wrap all
serverless functions. What it provides are the following:

- better "type safety" for your handler functions
- out-of-the-box support for Lambda Sequences in a transparent manner
- automatically configured logging (using `aws-log`)
- better error handling
- convenient access to connecting to a Firebase database (no code baggage though
  if you don't use this)

## Usage

The basic usage pattern is to include the following in your serverless handler
file:

```typescript
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
