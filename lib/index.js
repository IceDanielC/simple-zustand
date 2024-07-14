import { useSyncExternalStore } from "react";

/**
 *
 * @param {*} createState 等于是用户传入的creator函数：create((set, get, store) => ({...}))
 * @returns store
 */
const createStore = (createState) => {
  let state;
  const listeners = new Set();

  /** 对应creator中的set api */
  const setState = (partial, replace) => {
    /** 首先修改state的值 */
    const nextState = typeof partial === "function" ? partial(state) : partial;

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
      listeners.forEach((listener) => listener(state, previousState));
    }
  };

  /** 同理对应 get api */
  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const destroy = () => {
    listeners.clear();
  };

  /** 对应第三个参数 store */
  const api = { setState, getState, subscribe, destroy };

  /** 用creator函数返回的对象初始化state */
  state = createState(setState, getState, api);

  return api;
};

/**
 * 通过用户传入selector返回对应的store中的值，并订阅，保证试图的响应式更新
 * @param {*} api storeApi
 * @param {*} selector 用户传入的获取store中某个属性的函数，接收一个参数就是state对象
 * @returns
 */
function useStore(api, selector) {
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
  useSyncExternalStore(api.subscribe, () => selector(api.getState()));
}

/**
 *
 * @param {*} createState 用户传入，有三个参数：set，get，store
 * @returns
 */
export const create = (createState) => {
  /** 通过用户传入的creator方法的返回值创建state，并导出state的getter和setter */
  const api = createStore(createState);

  const useBoundStore = (selector) => useStore(api, selector);

  Object.assign(useBoundStore, api);

  return useBoundStore;
};
