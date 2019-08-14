# AWS Orchestrate

> an open source library intended to make Serverless micro-architectures easier: [github](https://github.com/inocan-group/aws-orchestrate)

## Components

This library is intended to provide a robust means for Serverless developers to _orchestrate_ functions in a micro-services architecture. The features include:

1. [`wrapper`](./wrapper) - A higher order function which you wrap around your handler functions. In doing so you receive more information via the **context** object as well as stronger typing.
2. [`sequence`](./lambda-sequence) - Allows wiring up a sequence of lambbda functions into a functional grouping.
3. [`transaction`](./transaction) - A helper for frontends which call your HTTP endpoints; this helper allows the the frontend to asynchronously wait for a sequence to execute and then receive the functional response of the API endpoint. Using this feature/wrapper assumes the use of [**Firemodel**](https://firemodel.info)

## Install

```sh
npm i aws-orchestrate
```

## Dependencies

This library makes use of the [`aws-log`](https://github.com/inocan-group/aws-log) library for logging services as well as async cross-function calling (which ensures a correlation ID across a full fan-out of functions).
