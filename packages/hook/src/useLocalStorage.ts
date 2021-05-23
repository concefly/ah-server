import { useEffect, useState } from 'react';

type IStringIndex = { [key: string]: string };

const restore = <T extends IStringIndex>(defaultValue: T): T => {
  const re: any = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      re[key] = localStorage.getItem(key) || defaultValue[key];
    }
  }

  return re;
};

const store = <T extends IStringIndex>(data: T) => {
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
};

export const useLocalStorage = <T extends IStringIndex>(defaultValue: T) => {
  const [data, setData] = useState<T>(() => restore(defaultValue));

  useEffect(() => store(data), [data]);

  return { data, setData };
};
