import { parse, stringify } from 'query-string';
import { useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

const parseConfig = {
  skipNull: true,
  skipEmptyString: true,
  parseNumbers: false,
  parseBooleans: false,
};

export const useUrlState = <T>(initialState: T) => {
  const location = useLocation();
  const history = useHistory();

  const [_n, forceUpdate] = useState('');

  const initialStateRef = useRef(initialState);

  const queryFromUrl: T = useMemo(
    () => parse(location.search, parseConfig) as any,
    [location.search]
  );

  const urlState = useMemo(
    () => ({
      ...initialStateRef.current,
      ...queryFromUrl,
    }),
    [queryFromUrl]
  );

  const setUrlState = (newQuery: T) => {
    forceUpdate(Math.random() + '');

    history.push({
      hash: location.hash,
      search: stringify({ ...queryFromUrl, ...newQuery }, parseConfig) || '?',
    });
  };

  return { urlState, setUrlState };
};
