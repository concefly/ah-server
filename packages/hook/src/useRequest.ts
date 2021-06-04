import { useRef } from 'react';
import { useFSM } from './useFSM';

export type IUseRequestRet<Q, T> = {
  state:
    | {
        type: 'init';
      }
    | {
        type: 'loading';
      }
    | {
        type: 'success';
        data: T;
      }
    | {
        type: 'fail';
        err: Error;
      };
  refresh: (q: Q) => {
    ret: Promise<T>;
    cancel: (reason?: string) => void;
  };
  lastQuery: () => Q | undefined;
};

export function useRequest<Q, T>(service: (q: Q) => Promise<T>): IUseRequestRet<Q, T>;
export function useRequest<Q, T>(
  service: ((q: Q) => Promise<T>) | undefined
): IUseRequestRet<Q, T> | undefined;

export function useRequest(service: any) {
  const lastQueryRef = useRef();

  const st = useFSM<
    | { type: 'init' }
    | { type: 'loading' }
    | { type: 'success'; data: any }
    | { type: 'fail'; err: Error }
  >(() => ({ type: 'init' }));

  const refresh = (q: any) => {
    lastQueryRef.current = q;

    const token: {
      ret: any;
      cancel: (reason?: string) => void;
    } = { ret: undefined, cancel: () => {} };

    st.setState({ type: 'loading' });

    token.ret = Promise.race([
      //
      service(q),
      // 竞速取消
      new Promise((_, reject) => {
        token.cancel = (reason = 'refresh cancel') => {
          reject(Object.assign(new Error(reason), { __cancel: true }));
        };
      }),
    ])
      .then(data => st.setState({ type: 'success', data }))
      .catch(err => {
        if (err.__cancel) {
          console.info(err.message);
          return;
        }

        console.error(err);
        st.setState({ type: 'fail', err });
      });

    return token;
  };

  if (!service) return;

  return {
    state: st.state,
    refresh,
    lastQuery: () => lastQueryRef.current,
  };
}
