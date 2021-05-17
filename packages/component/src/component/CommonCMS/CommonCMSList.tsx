import React from 'react';
import { ICMSProps } from './type';
import { CMSListContext } from './context';
import { CommonCMS } from './CommonCMS';
import _ from 'lodash';

export const CommonCMSList = (p: { list: ICMSProps[] }) => {
  return (
    <CMSListContext.Provider value={p.list}>
      {p.list.map(_p => (
        <CommonCMS key={_p.routerPrefix + _p.entity} {..._p} />
      ))}
    </CMSListContext.Provider>
  );
};

export function createCMSProps(services: any) {
  const crudGroups: {
    [entityName: string]: {
      [actionName: string]: {
        rIns: any;
        actionArgs?: { idMapper?: string };
      };
    };
  } = {};

  for (const [sName, sIns] of Object.entries(services)) {
    for (const [rName, rIns] of Object.entries<any>(sIns as any)) {
      if (rIns.$meta && rIns.$meta.tags) {
        const crudTag = (rIns.$meta.tags as string[]).find(t => t.startsWith('cms:'));

        if (crudTag) {
          const [_type, entityName, action] = crudTag.split(':');
          const [actionName, actionArgQuery] = action.split('?');
          const actionArgs = actionArgQuery
            ? (() => {
                const sp = new URLSearchParams(actionArgQuery);
                return {
                  idMapper: sp.get('idMapper'),
                };
              })()
            : undefined;

          _.set(crudGroups, [entityName, actionName], { rIns, actionArgs });
        }
      }
    }
  }

  const list: ICMSProps[] = [];

  Object.entries(crudGroups).forEach(([entityName, eInfo]) => {
    const props: Partial<ICMSProps> = {
      entity: entityName,
      routerPrefix: '',
    };

    Object.entries(eInfo).forEach(([actionName, { rIns, actionArgs }]) => {
      props.idMapper = actionArgs?.idMapper;

      if (actionName === 'list') props.listService = rIns;
      if (actionName === 'create') props.createService = rIns;
      if (actionName === 'read') props.readService = rIns;
      if (actionName === 'update') props.updateService = rIns;
      if (actionName === 'delete') props.deleteService = rIns;
    });

    list.push(props as any);
  });

  return list;
}
