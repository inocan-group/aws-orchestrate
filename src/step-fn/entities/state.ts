import { ServerlessError } from "~/errors";
import {
  Finalized,
  ICatchConfigurableStepFn,
  IErrorHandlerPointer,
  IFinalizedStepFn,
  IState,
  IStateConfiguring,
  IStepFnOptions,
  IStepFnSelector,
} from "~/types";
import {
  choiceConfiguration,
  failConfiguration,
  goToConfiguration,
  isFinalizedStepFn,
  isFluentApi,
  isStateDefn,
  isStepFunction,
  mapConfiguration,
  parallelConfiguration,
  passConfiguration,
  StepFunction,
  succeedConfiguration,
  taskConfiguration,
  waitConfiguration,
} from "..";

/**
 * It returns the desired state based on `cb`
 *
 * @param cb fluent api callback
 */
export function State<T extends Finalized<IState> | IState>(cb: (api: IStateConfiguring) => T): T {
  const configuring = {
    succeed: succeedConfiguration,
    task: taskConfiguration,
    map: mapConfiguration,
    fail: failConfiguration,
    choice: choiceConfiguration,
    parallel: parallelConfiguration,
    wait: waitConfiguration,
    pass: passConfiguration,
    goTo: goToConfiguration,
  } as IStateConfiguring;

  return cb(configuring);
}

function isState(
  obj: IState | Finalized<IState> | IStepFnOptions
): obj is IState | Finalized<IState> {
  return "type" in obj;
}

export function isFinalizedStepFnSelector(selector: IStepFnSelector | IErrorHandlerPointer): boolean {
  if (isStepFunction(selector)) {
    return isFinalizedStepFn(selector);
  } else if (isFluentApi(selector)) {
    const configurationApi = StepFunction() as ICatchConfigurableStepFn;;
    const sf = selector(configurationApi);
    return isFinalizedStepFn(sf);
  } else {
    return selector.filter((s) => isState(s)).every((s) => isState(s) && s.isTerminalState);
  }
}

export function parseStepFnSelector(selector: IStepFnSelector | IErrorHandlerPointer): IFinalizedStepFn {
  if (isStepFunction(selector)) {
    if (isFinalizedStepFn(selector)) {
      return selector;
    } else {
      if (!selector.state[0].isFinalized) {
        throw new ServerlessError(400, "The first state must be finalized", "not-valid");
      }
      const c = selector.finalize();
      return c;
    }
  } else if (isFluentApi(selector)) {
    const configurationApi = StepFunction() as ICatchConfigurableStepFn;
    const sf = selector(configurationApi);
    console.log("foo", selector);
    return !isFinalizedStepFn(sf) ? sf.finalize() : sf;
  } else {
    let stepFnOptions: IStepFnOptions = {};
    const states =[];

    for (const s of selector) {
      if (isStateDefn(s)) {
        states.push(s);
      } else {
        stepFnOptions = s;
      }
    }

    if (!states[0].isFinalized) {
      throw new ServerlessError(400, "The first state must be finalized", "not-valid");
    }

    return StepFunction(...states, {
      ...stepFnOptions,
    }).finalize();
  }
}

export function parseAndFinalizeStepFn(selector: IStepFnSelector | IErrorHandlerPointer): IFinalizedStepFn {
  if (isStepFunction(selector)) {
    if (isFinalizedStepFn(selector)) {
      return selector;
    } else {
      const c = selector.finalize();
      return c;
    }
  } else if (isFluentApi(selector)) {
    const configurationApi = StepFunction() as ICatchConfigurableStepFn;
    console.log(selector);
    const sf = selector(configurationApi);
    return isFinalizedStepFn(sf) ? sf : sf.finalize();
  } else {
    let stepFnOptions: IStepFnOptions = {};
    const states =[];

    for (const s of selector) {
      if (isStateDefn(s)) {
        states.push(s);
      } else {
        stepFnOptions = s;
      }
    }

    return StepFunction(...states, {
      ...stepFnOptions,
    }).finalize();
  }
}
