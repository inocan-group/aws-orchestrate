import { IBaseState, IConfigurableStepFn, IFinalizedStepFn, IOptionsWithInput, IState } from '.'

export interface IPassCallable {
  (options?: IPassOptions): IConfigurableStepFn
}

export interface IPassConfiguration {
  (options?: IPassOptions): IPass
}

export interface IPassOptions extends IOptionsWithInput {
  /** Treated as the output of a virtual task to be passed on to the next state, and filtered as prescribed by the ResultPath field (if present). */
  result?: any
}

export type IPass = Omit<IPassOptions, "name"> & IBaseState & {
  readonly type: 'Pass'
  isTerminalState: false
  isFinalized: false
}

/**
 * TODO:
 */
/**
type ITErminalState = { isTerminalState: true }

let state: IState & ITErminalState

let states: [IState, ]

type IFinalizedState = { name: string }

let state2: IState & IFinalizedState

const sf = StepFunction(s1, s2): IConfigurableStepFn | IFinalizedStepFn


stateMAchine

function foobar(_api: 'cd'): CD
function foobar(_api: 'ab'): AB {
  let  api = _api


  function a() {
    console.log('a');
  }
  function b() {
    console.log('b');
    api = 'cd'
  }
  function c() {
    console.log('c');
  }
  function d() {
    console.log('d');
  }

  return { a,b,c,d,  api}
}

interface BASE {
  readonly api: 'ab' | 'cd'
}

interface AB extends BASE{
  readonly api: 'ab';
  a():void;
  b: () => void;
  c: () => void;
  d: () => void;
}

interface CD extends BASE{
  readonly api: 'cd';
  a(): void;
  b: () => void;
  c: () => void;
  d: () => void;
}

const foo = foobar();

foo.api = 'cd'
foo.
**/