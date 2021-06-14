import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AnalyzeContext, InspectContext } from './context';
import { useLogger } from './hook';
import { IAnalyzeProps, IInspectMap } from './type';
import { Switch, Route, useHistory } from 'react-router-dom';
import { Tabs } from 'antd';
import { Panel } from './Panel';

export const Analyze = (props: IAnalyzeProps) => {
  const logger = useLogger('Entry');
  logger.info(`get inspectors: ${JSON.stringify(props, null, 2)}`);

  const his = useHistory();
  const { routerPrefix, entityMap } = props;

  const handleTabChange = (entity: string, inspect: string) => {
    his.push([routerPrefix, entity, inspect].join('/'));
  };

  return (
    <AnalyzeContext.Provider value={props}>
      <ErrorBoundary fallbackRender={fp => <div>加载失败: {fp.error.message}</div>}>
        <Route
          path={[`${routerPrefix}/:entity/:inspect`, `${routerPrefix}/:entity`, routerPrefix]}
          render={rp => {
            const {
              entity = Object.keys(entityMap)[0],
              inspect = Object.keys(entityMap[entity])[0],
            } = rp.match.params;

            return (
              <Tabs
                activeKey={entity}
                type='card'
                destroyInactiveTabPane
                onTabClick={t => handleTabChange(t, Object.keys(entityMap[t])[0])}
              >
                {Object.entries(entityMap).map(([entityName, inspectMap]) => {
                  return (
                    <Tabs.TabPane key={entityName} tab={entityName} tabKey={entityName}>
                      <Tabs
                        // 第二层 tabs
                        destroyInactiveTabPane
                        activeKey={inspect}
                        tabPosition='left'
                        size='small'
                        onTabClick={t => handleTabChange(entity, t)}
                      >
                        {Object.entries(inspectMap).map(([inspectName, iItem]) => {
                          return (
                            <Tabs.TabPane key={inspectName} tab={inspectName} tabKey={inspectName}>
                              <InspectContext.Provider value={iItem}>
                                <Panel />
                              </InspectContext.Provider>
                            </Tabs.TabPane>
                          );
                        })}
                      </Tabs>
                    </Tabs.TabPane>
                  );
                })}
              </Tabs>
            );
          }}
        />
      </ErrorBoundary>
    </AnalyzeContext.Provider>
  );
};
