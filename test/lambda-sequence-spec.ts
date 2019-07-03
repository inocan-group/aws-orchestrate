import chai from "chai";
import { LambdaSequence } from "../src/LambdaSequence";
import { Sequence } from "../src";
import { IDictionary } from "common-types";

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
    expect(request).to.equal(event);
    expect(apiGateway).to.equal(undefined);
    expect(sequence).to.be.instanceOf(LambdaSequence);
    expect(sequence.isSequence).to.equal(false);
  });

  it("from() returns proper properties when sequence but no proxy request", async () => {
    const event: Sequence<{ foo: number; bar: number }> = {
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
    // the returned request should NOT have a "sequence" property
    const eventTransform = { ...event, ...{} };
    delete eventTransform._sequence;
    expect(JSON.stringify(request)).to.equal(JSON.stringify(eventTransform));
    expect(apiGateway).to.equal(undefined);
    expect(sequence).to.not.equal(undefined);
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

  it("when params are included in steps, those properties are included when using from()", async () => {
    interface IFakeInput {
      foo: number;
      bar: number;
      baz: string;
    }

    interface IAnotherFake {
      width: number;
      height: number;
    }
    const s = LambdaSequence.add<IFakeInput>("fn1", { foo: 1, bar: 2 }).add<
      IAnotherFake
    >("fn2", { width: 50 });

    const [fn, event] = s.next({ baz: "hello world" });

    const { request, sequence } = LambdaSequence.from(event);

    expect(request).to.haveOwnProperty("baz");
    expect(request)
      .to.haveOwnProperty("foo")
      .and.equal(1);
    expect(request)
      .to.haveOwnProperty("bar")
      .and.equal(2);
    expect(sequence.remaining).to.have.lengthOf(1);

    const [fn2, event2] = sequence.next({ height: 25 });

    const secondTime = LambdaSequence.from(event2);
    expect(secondTime.request)
      .to.haveOwnProperty("height")
      .and.equal(25);
    expect(secondTime.request)
      .to.haveOwnProperty("width")
      .and.equal(50);
    expect(secondTime.sequence.isDone).to.equal(true);
  });

  it("calling next() returns invoke() params", async () => {
    const s = LambdaSequence.add("fn1", { foo: 1, bar: 2 }).add("fn2", {
      width: 50
    });
    const nxt = s.next();
    expect(nxt).to.be.an("array");
  });

  it('Sequence with dynamic property gets resolved when calling "next()"', async () => {
    const s = LambdaSequence.add("fn1", { foo: 1, bar: 2 }).add("fn2", {
      input: ":data"
    });
    const [fn, params] = s.next({ baz: 3 });
    expect(fn)
      .to.be.a("string")
      .and.equal("fn1");
    expect(params).to.be.an("object");

    // fn1 is executing
    const { request, sequence } = LambdaSequence.from(params);
    expect(request).haveOwnProperty("foo");
    expect(request).haveOwnProperty("bar");
    expect(request).haveOwnProperty("baz");
    expect(sequence).to.have.lengthOf(2);
    expect(sequence.remaining.length).to.equal(1);
    expect(sequence.isDone).to.equal(false);

    const [fn2, p2] = sequence.next({ data: "foobar" });
    expect(fn2).to.equal("fn2");
    expect(p2).to.haveOwnProperty("input");

    // fn2 is executing
    const { request: req2, sequence: seq2 } = LambdaSequence.from(p2);

    expect(req2)
      .haveOwnProperty("input")
      .and.equal("foobar");
    expect(req2).not.haveOwnProperty("data");
  });

  it("Full sequence test produces correct results throughout", () => {
    // Sequence defined
    const sequenceDefn = LambdaSequence.add("fn1", { a: 1, b: 2, c: "see" })
      .add("fn2", { c: 3, temperature: ":data" })
      .add("fn3", { d: 4, func1: ":fn1.data", func2: ":fn2.data" });

    expect(sequenceDefn.steps.length).to.equal(sequenceDefn.remaining.length);

    // initiate call to first function in sequence
    let [fn, params] = sequenceDefn.next<IDictionary>({
      data: { foo: "bar" }
    });

    expect(fn).to.equal("fn1");
    expect(sequenceDefn.dynamicProperties.length).to.equal(0);
    expect(Object.keys(params)).to.include("a");
    expect(Object.keys(params)).to.include("b");
    expect(Object.keys(params)).to.include("c");
    expect(Object.keys(params)).to.include("data");
    expect(Object.keys(params.data)).to.include("foo");

    // retrieve sequence in first function after conductor; data passed by conductor should be part of params
    const { request, sequence: sequence1 } = LambdaSequence.from(params);
    expect(sequence1.isSequence).to.equal(true);
    expect(sequence1.completed.length).to.equal(0);
    expect(Object.keys(sequence1.activeFn.params)).to.include("a");
    expect(Object.keys(sequence1.activeFn.params)).to.include("b");
    expect(Object.keys(sequence1.activeFn.params)).to.include("c");
    expect(Object.keys(sequence1.activeFn.params)).to.include("data");
    expect(Object.keys(request)).to.include("a");
    expect(Object.keys(request)).to.include("data");

    // initiate call to second function; which had a dynamic property referencing prior fn
    [fn, params] = sequence1.next({ data: 45 });
    expect(fn).to.equal("fn2");
    expect(params).to.haveOwnProperty("_sequence");

    // retrieve sequence in second function after conductor
    const { request: request2, sequence: sequence2 } = LambdaSequence.from(
      params
    );

    expect(sequence2.isSequence).to.equal(true);
    expect(sequence2.completed.length).to.equal(1);
    expect(request2).to.haveOwnProperty("c");
    expect(request2).to.haveOwnProperty("temperature"); // this was mapped to
    expect(request2).to.not.haveOwnProperty("data"); // this was mapped away from
    expect(Object.keys(request2)).to.have.lengthOf(2);
    Object.keys(request2).forEach(key =>
      expect(sequence2.activeFn.params).to.haveOwnProperty(key)
    );

    // initiate call to second function; which had a dynamic property
    // which is NOT the prior function
    [fn, params] = sequence2.next({ data: "i am a result of fn2" });
    expect(fn).to.equal("fn3");
    expect(params).to.haveOwnProperty("_sequence");

    // retrieve sequence in second function after conductor
    const { request: request3, sequence: sequence3 } = LambdaSequence.from(
      params
    );

    expect(request3)
      .to.haveOwnProperty("func1")
      .and.equal(45);
    expect(request3)
      .to.haveOwnProperty("func2")
      .and.equal("i am a result of fn2");
  });
});
