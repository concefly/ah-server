import _ from 'lodash';
import { IAnalyzeProps } from './type';

export function createAnalyzerProps(services: any) {
  const props: IAnalyzeProps = {
    routerPrefix: '/analyze',
    entityMap: {},
  };

  for (const [sName, sIns] of Object.entries(services)) {
    for (const [rName, service] of Object.entries<any>(sIns as any)) {
      if (service.$meta && service.$meta.tags) {
        const aTag = (service.$meta.tags as string[]).find(t => t.startsWith('analyze:'));

        if (aTag) {
          const [_type, entityName, inspect] = aTag.split(':');
          const [inspectName, actionArgQuery] = inspect.split('?');
          // const actionArgs = actionArgQuery
          //   ? (() => {
          //       // const sp = new URLSearchParams(actionArgQuery);
          //       return {};
          //     })()
          //   : undefined;

          _.set(props.entityMap, [entityName, inspectName], { service });
        }
      }
    }
  }

  return props;
}
