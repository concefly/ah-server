import React, { useContext } from 'react';
import { ICMSProps } from './type';

export const CMSContext = React.createContext<ICMSProps>({
  routerPrefix: '',
  entity: '',
  listService: Object.assign(async () => {}, {
    $meta: {
      pathName: '',
      method: '',
      description: '',
      query: { schema: { type: 'object' as 'object' } },
      response: { schema: { type: 'object' as 'object' } },
    },
  }),
});

export const useCMSContext = () => useContext<ICMSProps>(CMSContext);

export const CMSListContext = React.createContext<ICMSProps[]>([]);
export const useCMSListContext = () => useContext(CMSListContext);
export const useCMSEntityContext = (entity: string) => {
  return useContext(CMSListContext).find(p => p.entity === entity);
};
