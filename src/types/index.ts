export type CreatorFn = (set: SetFn, get: GetFn, store: Store) => CustomStore;

type CustomStore = { [key: string]: any };

export type GetFn = () => any;

export type SetFn = (state: SetPartial, replace?: boolean) => void;

type SetPartial =
  | CustomStore
  | ((state: CustomStore) => void)
  | Array<any>
  | string
  | undefined
  | number
  | boolean
  | null;

export type Listener = (state: CustomStore, previousState: CustomStore) => void;

export type Subscriber = (listener: Listener) => () => void;

export type Destroy = () => void;

export type Store = {
  setState: SetFn;
  getState: GetFn;
  subscribe: Subscriber;
  destroy: Destroy;
};

export type Selector = (state: CustomStore) => any;
