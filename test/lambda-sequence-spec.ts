import chai from "chai";
import { LambdaSequence } from "../src/LambdaSequence";
import { IDictionary } from "common-types";
import { dynamic, isCompressedSection, decompress } from "../src/sequences";
import { ISerializedSequence } from "../src";

const expect = chai.expect;

describe("Lambda Sequence => ", () => {
  it("can instantiate", async () => {
    const s = new LambdaSequence();
    expect(s.from).to.be.a("function");
    expect(s.add).to.be.a("function");
    expect(s.next).to.be.a("function");
  });

  it("from() returns proper properties when no sequence or proxy request", async () => {
    const event: { foo: number; bar: number } = { foo: 1, bar: 2 };
    const { request, sequence, apiGateway } = LambdaSequence.from(event);
    expect(JSON.stringify(request)).to.equal(JSON.stringify(event));
    expect(apiGateway).to.equal(undefined);
    expect(sequence).to.be.instanceOf(LambdaSequence);
    expect(sequence.isSequence).to.equal(false);
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
          status: "active"
        },
        {
          arn: "fn2",
          params: {},
          type: "task",
          status: "assigned"
        }
      ]
    };
    const { request, sequence, apiGateway } = LambdaSequence.from(event);
    expect(apiGateway).to.equal(undefined);
    expect(sequence).to.not.equal(undefined);
    expect(sequence).to.be.an.instanceOf(LambdaSequence);
    // after calling "from" the sequence is reduced from 2 to 1
    expect(sequence.remaining.length).to.equal(1);
    sequence.steps.map(step => {
      expect(step)
        .to.haveOwnProperty("arn")
        .and.be.a("string");
    });
  });

  it("add() adds steps as expected", async () => {
    const sequence = LambdaSequence.add("fn1")
      .add("fn2")
      .add("fn3");
    expect(sequence).to.have.lengthOf(3);
    sequence.steps.map(step => {
      expect(step.type).to.equal("task");
    });
  });

  it("calling next() returns invoke() params", async () => {
    const s = LambdaSequence.add("fn1", { foo: 1, bar: 2 }).add("fn2", {
      width: 50
    });
    const nxt = s.next();
    expect(nxt).to.be.an("array");
  });

  it("Running sequence's next() and from() method works with modern IOrchestrateMessageBody", () => {
    // Sequence defined
    const sequenceDefn = LambdaSequence.add("fn1", { a: 1, b: 2, c: "see" })
      .add("fn2", { c: 3, temperature: dynamic("fn1", "data") })
      .add("fn3", {
        d: 4,
        func1: dynamic("fn1", "data"),
        func2: dynamic("fn2", "data")
      });

    expect(sequenceDefn.steps.length).to.equal(sequenceDefn.remaining.length);

    // initiate call to first function in sequence
    let [fn, conductorEvent] = sequenceDefn.next<IDictionary>({
      data: { foo: "bar" }
    });

    let { sequence: s, body: b, headers: h } = conductorEvent;
    // way too small to be compressed
    expect(isCompressedSection(b)).to.equal(false);
    const { sequence, body, headers } = {
      sequence: decompress<ISerializedSequence>(s),
      headers: decompress<IDictionary>(h),
      body: decompress<IDictionary>(b)
    };

    //#region Conductor next()
    expect(fn).to.equal("fn1");
    // body tests
    expect(Object.keys(body)).to.include("a");
    expect(Object.keys(body)).to.include("b");
    expect(Object.keys(body)).to.include("c");
    expect(body.b).to.equal(2);
    expect(body.c).to.equal("see");
    // expect(Object.keys(body)).to.include("data");

    // sequence tests
    expect(sequence.isSequence).to.equal(true);
    if (sequence.isSequence) {
      // Function is not made active until ingested with `from()`
      expect(sequence.activeFn).to.equal(undefined);
      expect(sequence.totalSteps).to.equal(3);
      expect(sequence.completedSteps).to.equal(0);
    }

    // header tests
    expect(headers["X-Correlation-Id"]).to.be.a("string");
    //#endregion

    //#region Fn1 from()
    const fn1 = LambdaSequence.from<IDictionary>(conductorEvent);

    expect(fn1.request.a).to.equal(1);
    expect(fn1.request.b).to.equal(2);
    expect(fn1.request.c).to.equal("see");
    expect(fn1.headers["X-Correlation-Id"]).to.equal(
      headers["X-Correlation-Id"]
    );
    //#endregion

    //#region fn1.next() - aka, moving toward fn2
    const [fn1NextFn, fn1Event] = fn1.sequence.next({ data: "70 degrees" });
    expect(fn1NextFn).to.equal("fn2");

    // body
    const fn1NextBody = decompress<IDictionary>(fn1Event.body, true);
    expect(fn1NextBody.c).to.equal(3);
    expect(fn1NextBody.a).to.be.a("undefined");
    expect(fn1NextBody.temperature).to.equal("70 degrees");

    // sequence
    const fn1NextSequence = decompress(fn1Event.sequence, true);
    expect(fn1NextSequence.isSequence).to.equal(true);
    if (fn1NextSequence.isSequence) {
      expect(fn1NextSequence.completedSteps).to.equal(1);
      // the first function is completed but fn2 has not YET been set to active
      expect(fn1NextSequence.activeFn).equal(undefined);
      expect(fn1NextSequence.completed).to.include("fn1");
      // while we have not yet made 'fn2' active yet, 'fn1' should be marked completed
      expect(fn1NextSequence.completed).to.include("fn1");
    }
    //#endregion

    //#region fn2 from()
    const fn2 = LambdaSequence.from<IDictionary>(fn1Event);
    expect(fn2.headers).to.haveOwnProperty("X-Correlation-Id");
    expect(fn2.sequence.activeFn.arn).to.equal("fn2");
    expect(fn2.request.c).to.equal(3);
    expect(fn2.request.temperature).to.equal("70 degrees");
    //#endregion

    //#region fn2.next()
    const [fn2next, fn2Event] = fn2.sequence.next({ data: "hello world" });
    expect(fn2next).to.equal("fn3");
    const fn2Body = decompress<IDictionary>(fn2Event.body);
    expect(fn2Body.d).equals(4);
    //##endregion

    //#region fn3.from()
    const fn3 = LambdaSequence.from<IDictionary>(fn2Event);
    expect(fn3.request.d).equals(4);
    expect(fn3.request.func1).equals("70 degrees");
    expect(fn3.request.func2).equals("hello world");
    //#endregion
  });
});
