import { decompress, dynamic, isCompressedSection } from "../src/sequences";

import { IDictionary } from "common-types";
import { ISerializedSequence } from "../src";
import { LambdaSequence } from "../src/LambdaSequence";

describe("Lambda Sequence => ", () => {
  it("can instantiate", async () => {
    const s = new LambdaSequence();
    expect(s.from).toBeInstanceOf("function");
    expect(s.add).toBeInstanceOf("function");
    expect(s.next).toBeInstanceOf("function");
  });

  it("from() returns proper properties when no sequence or proxy request", async () => {
    const event: { foo: number; bar: number } = { foo: 1, bar: 2 };
    const { request, sequence, apiGateway } = LambdaSequence.from(event);
    expect(JSON.stringify(request)).toBe(JSON.stringify(event));
    expect(apiGateway).toBeUndefined();
    expect(sequence).toBeInstanceOf(LambdaSequence);
    expect(sequence.isSequence).toBe(false);
  });

  it("from() handles deprecated sequence being passed into event", async () => {
    const event: IDictionary = {
      foo: 1,
      bar: 2,
      _sequence: [
        {
          arn: "fn1",
          params: {},
          type: "task",
          status: "active",
        },
        {
          arn: "fn2",
          params: {},
          type: "task",
          status: "assigned",
        },
      ],
    };
    const { request, sequence, apiGateway } = LambdaSequence.from(event);
    expect(apiGateway).toBeUndefined();
    expect(sequence).toBeDefined();
    expect(sequence).toBeInstanceOf(LambdaSequence);
    // after calling "from" the sequence is reduced from 2 to 1
    expect(sequence.remaining.length).toBe(1);
    sequence.steps.map((step) => {
      expect(step)
        .to.haveOwnProperty("arn")
        .toBeInstanceOf("string");
    });
  });

  it("add() adds steps as expected", async () => {
    const sequence = LambdaSequence.add("fn1")
      .add("fn2")
      .add("fn3");
    expect(sequence).toHaveLength(3);
    sequence.steps.map((step) => {
      expect(step.type).toBe("task");
    });
  });

  it("calling next() returns invoke() params", async () => {
    const s = LambdaSequence.add("fn1", { foo: 1, bar: 2 }).add("fn2", {
      width: 50,
    });
    const nxt = s.next();
    expect(nxt).toBeInstanceOf("array");
  });

  it("Running sequence's next() and from() method works with modern IOrchestrateMessageBody", () => {
    // Sequence defined
    const sequenceDefn = LambdaSequence.add("fn1", { a: 1, b: 2, c: "see" })
      .add("fn2", { c: 3, temperature: dynamic("fn1", "data") })
      .add("fn3", {
        d: 4,
        func1: dynamic("fn1", "data"),
        func2: dynamic("fn2", "data"),
      });

    expect(sequenceDefn.activeFn.arn).toBe("fn1");
    expect(sequenceDefn.steps.length).toBe(sequenceDefn.remaining.length + 1);

    // NEXT
    const f1Response = {
      data: { foo: "bar" },
    };
    let [fn2, fn1Event] = sequenceDefn.next<IDictionary>(f1Response);

    //#region fn2
    expect(fn2).toBe("fn2");

    let { sequence: s, body: b, headers: h } = fn1Event;
    // way too small to be compressed
    expect(isCompressedSection(b)).toBe(false);
    const { sequence, body, headers } = {
      sequence: decompress<ISerializedSequence>(s),
      headers: decompress<IDictionary>(h),
      body: decompress<IDictionary>(b),
    };

    // fn2 body
    const fn2Body = decompress<IDictionary>(fn1Event.body, true);
    expect(fn2Body.c).toBe(3);
    expect(fn2Body.a).toBeInstanceOf("undefined");
    expect(fn2Body.temperature).toBe(f1Response.data);

    // fn2 sequence
    const fn2Sequence = LambdaSequence.deserialize(decompress(fn1Event.sequence, true));
    expect(fn2Sequence.isSequence).toBe(true);
    if (fn2Sequence.isSequence) {
      expect(fn2Sequence.completed.length).toBe(1);
      // the first function is completed but fn2 has not YET been set to active
      expect(fn2Sequence.activeFn.arn).toBe("fn2");
      const f2Completed = fn2Sequence.completed.map((i) => i.arn);
      expect(f2Completed).toEqual(expect.arrayContaining(["fn1"]));
      // while we have not yet made 'fn2' active yet, 'fn1' should be marked completed
      expect(f2Completed).toEqual(expect.not.arrayContaining(["fn2"]));
    }
    //#endregion

    // NEXT
    const f2Response = {
      data: "70 degrees",
    };
    let [fn3next, fn2Event] = fn2Sequence.next<IDictionary>(f2Response);
    expect(fn3next).toBe("fn3");
    expect(fn2Sequence.activeFn.arn).toBe("fn3");

    //#region fn3
    const fn3 = LambdaSequence.from<IDictionary>(fn2Event);
    console.log(fn3.request);

    expect(fn3.headers).to.haveOwnProperty("X-Correlation-Id");
    expect(fn3.sequence.activeFn.arn).toBe("fn3");
    expect(fn3.request.c).toBeUndefined();
    expect(fn3.request.d).toBe(4);
    expect(fn3.request.func2).toBe("70 degrees");
    //#endregion
  });
});
