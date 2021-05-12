import { useEffect, useState } from 'react';

export const useFSM_le = <T extends { type: string }>(opt: {
  init: () => T;
  transition?: (s: T) => T | undefined;
}) => {
  return useFSM(opt.init, opt.transition);
};

export const useFSM = <T extends { type: string }>(
  init: () => T,
  transition?: (s: T) => T | undefined
) => {
  const [state, setState] = useState<T>(init);

  useEffect(() => {
    if (transition) {
      const ns = transition(state);
      if (ns) setState(ns);
    }
  }, [state.type, !!transition]);

  return { state, setState };
};
