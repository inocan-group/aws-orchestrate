import { ServerlessError } from "../errors";
import {
  choiceConfiguration,
  failConfiguration,
  Finalized,
  goToConfiguration,
  IFinalizedStepFn,
  isFinalizedStepFn,
  isFluentApi,
  isStateDefn,
  isStepFunction,
  IState,
  IStateConfiguring,
  IStepFnOptions,
  IStepFnSelector,
  mapConfiguration,
  parallelConfiguration,
  passConfiguration,
  StepFunction,
  succeedConfiguration,
  taskConfiguration,
  waitConfiguration,
} from "../private";

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

export function isFinalizedStepFnSelector(selector: IStepFnSelector): boolean {
  if (isStepFunction(selector)) {
    return isFinalizedStepFn(selector);
  } else if (isFluentApi(selector)) {
    const configurationApi = StepFunction();
    const sf = selector(configurationApi);
    return isFinalizedStepFn(sf);
  } else {
    return selector.every((s: IState) => s.isTerminalState);
  }
}

export function parseStepFnSelector(selector: IStepFnSelector): IFinalizedStepFn {
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
    const configurationApi = StepFunction();
    const sf = selector(configurationApi);
    if (!isFinalizedStepFn(sf)) {
      if (!sf.state[0].isFinalized) throw new ServerlessError(400, "The first state must be finalized", "not-valid");
      return sf.finalize();
    } else {
      return sf;
    }
  } else {
    let stepFnOptions: IStepFnOptions = {};

    const states = selector.reduce((acc: IState[], param: IState | IStepFnOptions) => {
      if (isStateDefn(param)) {
        acc.push(param);
      } else {
        stepFnOptions = param;
      }
      return acc;
    }, [] as IState[]);

    if (!states[0].isFinalized) throw new ServerlessError(400, "The first state must be finalized", "not-valid");

    return StepFunction(...states, {
      ...stepFnOptions,
    }).finalize();
  }
}

export function parseAndFinalizeStepFn(selector: IStepFnSelector): IFinalizedStepFn {
  if (isStepFunction(selector)) {
    if (isFinalizedStepFn(selector)) {
      return selector;
    } else {
      const c = selector.finalize();
      return c;
    }
  } else if (isFluentApi(selector)) {
    const configurationApi = StepFunction();
    const sf = selector(configurationApi);
    return isFinalizedStepFn(sf) ? sf : sf.finalize();
  } else {
    let stepFnOptions: IStepFnOptions = {};

    const states = selector.reduce((acc: IState[], param: IState | IStepFnOptions) => {
      if (isStateDefn(param)) {
        acc.push(param);
      } else {
        stepFnOptions = param;
      }
      return acc;
    }, [] as IState[]);

    return StepFunction(...states, {
      ...stepFnOptions,
    }).finalize();
  }
}
