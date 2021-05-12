import { useRef } from 'react';
import { useFSM } from './useFSM';

export const useRequest = <Q, T>(service: (q: Q) => Promise<T>) => {
  const lastQueryRef = useRef<Q>();

  const st = useFSM<
    | { type: 'init' }
    | { type: 'loading' }
    | { type: 'success'; data: T }
    | { type: 'fail'; err: Error }
  >(() => ({ type: 'init' }));

  const refresh = async (q: Q) => {
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

  return {
    state: st.state,
    refresh,
    lastQuery: () => lastQueryRef.current,
  };
};
