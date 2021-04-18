# Transaction Helper

## Introduction

When a frontend calls an HTTP endpoint the normal expectation is that the HTTP status code would relate to the _functional_ outcome which was requested. This expectation, however, can be lost when you are running a micro-services backend because the HTTP event triggers a function which runs a sequence of functions to achieve it's aims.

You "could" keep the initial function active during the duration of functional fan-out but this would be resource inefficient so instead this helper function provides a means to allow the serverless functions to work entirely asynchronously but still provide the frontend with a "functional response" that is consistent with normal REST-based API's.

## Usage

The frontend should wrap their network calls with `transaction` like so:

```typescript
import { transaction } from 'aws-orchestrate';

const apiResult = await transaction(axios.get(endpoint));
```

> Note: in the above example we are using the popular `axios` library for calling the endpoint but you can use whichever library you prefer.

Let's imagine that this endpoint then calls a _sequence_ of four functions where the fourth function provides the functional payload that the client expects.

<process-flow>graph LR;subgraph client; START("Client HTTP call"); end; subgraph backend; START-->A["Conductor"];A-->B["Verify Something"];B-->C["Do Something"];C-->D("DONE"); end</process-flow>

Let's assume that the response structure for **fn4** is:

```typescript
export interface IResponse {
  message: string;
  people: [
    name: string;
    age: number;
  ]
}
```

When the transaction helper receives a 200/2xx success status from **fn4** it then returns the data described in `IResponse` interface. If, however, an error is incurred then the full Error object -- including _message_, _code_, _name_, and _stack_ will be provided. If, you really _want_ to receive the status code for a success message you can achieve this by passing `{ returnStatus: true }` into the options hash for `transaction`:

```typescript
import { transaction } from 'aws-orchestrate';
try {
  const apiResult = await transaction(axios.get(endpoint), { returnStatus: true });
  /* `code` and `data` properties available; `data` is of type `IResponse` **/
} catch (e) {
  // handle error
}
```

## Backend Configuration

### SequenceTracker

To enable the frontend in getting more traditional _functional_ status the `SequenceTracker` function **must** be deployed within your Serverless project. Doing this is straight forward and involves importing the function from `aws-orchestrate` and then just exporting it as one of your own handler functions.

If you are using the `typescript-microservice` yeoman template then you can not only get the function definition but the inline configuration for this function by adding the following file to your project:

**`src/handlers/SequenceTracker.ts`**

```typescript
import { SequenceTracker, SequenceTrackerConfig } from 'aws-orchestrate';

export handler = SequenceTracker;
export config = SequenceTrackerConfig;
```

### ArchiveTracker

The `ArchiveTracker` -- like the `SequenceTracker` -- is a Serverless function provided as an export in this library. Unlike the SequenceTracker, ArchiveTracker is not _strictly_ required but it is generally a good idea to include in your project as well. It's function is to clear out old/stale status messages from the Firebase database.

As these messages are really only intended to have short term value (aka, as the `LambdaSequence` is executing) they can be comfortably removed after a day in the database. If you take the configuration provided in the `ArchiveTrackerConfig` export, it will run the `ArchiveTracker` every day at 1am. You, of course, can decide to change the frequency or timing to meet the needs of your project.

Again assuming you are using the `typescript-microservices` yeoman template as a foundation for your Serverless project the file in your project would look something like:

**`src/handlers/ArchiveTracker.ts`**

```typescript
import { ArchiveTracker, ArchiveTrackerConfig } from 'aws-orchestrate';

export handler = ArchiveTracker;
export config = ArchiveTrackerConfig;
```
