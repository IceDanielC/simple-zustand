export type CreatorFn<T> = (set: SetFn<T>, get: GetFn, store: Store<T>) => T;

export type GetFn = () => any;

export type SetFn<T> = (state: SetPartial<T>, replace?: boolean) => void;

type SetPartial<T> =
  | T
  | Partial<T>
  | ((state: T) => T | Partial<T>);

export type Listener<T> = (state: T, previousState: T) => void;

export type Subscriber<T> = (listener: Listener<T>) => () => void;

export type Destroy = () => void;

export type Store<T> = {
  setState: SetFn<T>;
  getState: GetFn;
  subscribe: Subscriber<T>;
  destroy: Destroy;
};

export type Selector<T> = (state: T) => any;
