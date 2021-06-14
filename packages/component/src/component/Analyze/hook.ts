import { useContext, useMemo } from 'react';
import { AnalyzeContext, InspectContext } from './context';
import { Logger } from 'ah-logger';

const defaultLogger = new Logger('Analyze');
export function useLogger(name: string) {
  return useMemo(() => defaultLogger.extend(name), [name]);
}

export const useAnalyzeContext = () => useContext(AnalyzeContext);
export const useInspectContext = () => useContext(InspectContext);
