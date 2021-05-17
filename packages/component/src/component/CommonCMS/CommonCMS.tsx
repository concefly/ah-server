import React from 'react';
import { List } from './List';
import { Route, Switch } from 'react-router-dom';
import { Detail } from './Detail';
import { ICMSProps } from './type';
import { Editor } from './Editor';
import { Creator } from './Creator';
import { CMSContext } from './context';
import { ErrorBoundary } from 'react-error-boundary';

const convertId = (id?: string) => {
  if (!id) return '';
  if (id.match(/^\d+$/)) return parseInt(id);
  return id;
};

export const CommonCMS = (p: ICMSProps) => {
  const { routerPrefix, entity } = p;

  const content = (
    <ErrorBoundary fallback={<div>加载失败</div>}>
      <Switch>
        <Route path={[routerPrefix, entity].join('/')} exact>
          <List />
        </Route>
        <Route path={[routerPrefix, entity, 'new'].join('/')} exact render={() => <Creator />} />
        <Route
          path={[routerPrefix, entity, ':id'].join('/')}
          exact
          render={rp => <Detail id={convertId(rp.match.params.id)} />}
        />
        <Route
          path={[routerPrefix, entity, ':id', 'edit'].join('/')}
          exact
          render={rp => <Editor id={convertId(rp.match.params.id)} />}
        />
      </Switch>
    </ErrorBoundary>
  );

  return (
    <CMSContext.Provider value={p}>
      <Route path={[routerPrefix, entity].join('/')}>
        {p.render ? p.render(content) : content}
      </Route>
    </CMSContext.Provider>
  );
};
