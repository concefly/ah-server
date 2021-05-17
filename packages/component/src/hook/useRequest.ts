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
  refresh: (q: Q) => Promise<void>;
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

  const refresh = async (q: any) => {
    lastQueryRef.current = q;

    st.setState({ type: 'loading' });

    try {
      const data = await service(q);
      st.setState({ type: 'success', data });
    } catch (err) {
      console.error(err);
      st.setState({ type: 'fail', err });
    }
  };

  if (!service) return;

  return {
    state: st.state,
    refresh,
    lastQuery: () => lastQueryRef.current,
  };
}
