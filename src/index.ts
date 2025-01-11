import { useSyncExternalStore } from "react";
import {
  CreatorFn,
  Destroy,
  GetFn,
  Listener,
  SetFn,
  Store,
  Subscriber,
} from "./types";

/**
 *
 * @param {*} createState 等于是用户传入的creator函数：create((set, get, store) => ({...}))
 * @returns store
 */
const createStore = <T>(createState: CreatorFn<T>): Store<T> => {
  let state: T;
  const listeners = new Set<Listener<T>>();

  /** 对应creator中的set api */
  const setState: SetFn<T> = (partial, replace) => {
    /** 首先修改state的值 */
    const nextState =
      typeof partial === "function" ? (partial as Function)(state) : partial;

    if (!Object.is(nextState, state)) {
      const previousState = state;

      /** zustand默认是state合并，如果需要覆盖set的第二个参数要传true */
      if (!replace) {
        state =
          typeof nextState !== "object" || nextState === null
            ? nextState
            : Object.assign({}, state, nextState);
      } else {
        state = nextState;
      }
      // 这里其实就是执行更新逻辑
      // listeners.forEach((listener) => listener()); // 这样写也行
      listeners.forEach((listener) => listener(state, previousState));
    }

    // 如果新旧两个state相同就不更新了
    return;
  };

  /** 同理对应 get api */
  const getState: GetFn = () => state;

  const subscribe: Subscriber<T> = (listener: Listener<T>) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const destroy: Destroy = () => {
    listeners.clear();
  };

  /** 对应第三个参数 store */
  const api = { setState, getState, subscribe, destroy };

  /** 用creator函数返回的对象初始化state */
  state = createState(setState, getState, api);

  return api;
};

const identity = <T>(arg: T): T => arg;
/**
 * 通过用户传入selector返回对应的store中的值，并订阅，保证试图的响应式更新
 * @param {*} api storeApi
 * @param {*} selector 用户传入的获取store中某个属性的函数，接收一个参数就是state对象
 * @returns
 */
function useStore<T extends Record<string, any>, StateSlice>(
  api: Store<T>,
  selector: (state: T) => StateSlice = identity as any
) {
  // const [, triggerRender] = useState(0);
  // useEffect(() => {
  //   api.subscribe((state, prevState) => {
  //     const newObj = selector(state);
  //     const oldobj = selector(prevState);

  //     if (newObj !== oldobj) {
  //       /** 强制视图重新渲染，然后获取新的state值 */
  //       triggerRender(Math.random());
  //     }
  //   });
  // }, []);
  // return selector(api.getState());
  return useSyncExternalStore(api.subscribe, () => selector(api.getState()));
}

/**
 *
 * @param {*} createState 用户传入，有三个参数：set，get，store
 * @returns
 */
export const create = <T extends Record<string, any>>(
  createState: CreatorFn<T>
) => {
  /** 通过用户传入的creator方法的返回值创建state，并导出state的getter和setter */
  const api = createStore<T>(createState);

  // 添加泛型参数U来保留selector的返回值类型
  const useBoundStore = <U>(selector: (state: T) => U) =>
    useStore(api, selector);

  Object.assign(useBoundStore, api);

  return useBoundStore;
};
