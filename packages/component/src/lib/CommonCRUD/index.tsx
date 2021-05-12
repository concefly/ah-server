export * from './List';
export * from './type';

import React from 'react';
import { List } from './List';
import { Route, Switch } from 'react-router-dom';
import { Detail } from './Detail';
import { ICRUDProps } from './type';
import { Editor } from './Editor';
import { Creator } from './Creator';

const convertId = (id: any) => parseInt(id) || id;

export const CommonCRUD = <IndexQ, D extends { id: any }>(q: ICRUDProps<IndexQ, D>) => {
  const { routerPrefix } = q;

  return (
    <Switch>
      <Route path={routerPrefix} exact>
        <List {...q} />
      </Route>
      <Route path={routerPrefix + '/new'} exact render={() => <Creator {...q} />} />
      <Route
        path={routerPrefix + '/:id'}
        exact
        render={rp => <Detail id={convertId(rp.match.params.id)} {...q} />}
      />
      <Route
        path={routerPrefix + '/:id/edit'}
        exact
        render={rp => <Editor id={convertId(rp.match.params.id)} {...q} />}
      />
    </Switch>
  );
};
