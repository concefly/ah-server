import React, { useEffect, useLayoutEffect } from 'react';
import { Select } from 'antd';
import { CMSContext, useCMSContext, useCMSEntityContext } from '../context';
import { useListServiceInfo } from '../hook';
import _ from 'lodash';

type IFieldSelect = {
  entity: string;
  queryMapper: string;
  resultDisplayMapper?: string;
  fieldValueMapper?: string;

  value?: any;
  onChange?: (v: any) => any;
};

export const FieldSelect = (p: IFieldSelect) => {
  const ctx = useCMSEntityContext(p.entity);
  if (!ctx) return null;

  return (
    <CMSContext.Provider value={ctx}>
      <EntityFieldSelect {...p} />
    </CMSContext.Provider>
  );
};

export const EntityFieldSelect = ({
  value,
  resultDisplayMapper,
  queryMapper,
  fieldValueMapper = 'id',
  onChange,
}: IFieldSelect) => {
  const lsInfo = useListServiceInfo();
  const { idMapper = 'id' } = useCMSContext();

  // 初始化刷新
  useEffect(() => {
    lsInfo?.req.refresh({ [idMapper]: value });
  }, [value]);

  if (!lsInfo) return null;

  const handleSearch = _.debounce((q: string) => lsInfo.req.refresh({ [queryMapper]: q }), 300);

  return (
    <Select
      showSearch
      value={value}
      onChange={onChange}
      onSearch={handleSearch}
      options={lsInfo.pageData?.list.map(d => {
        return {
          label: resultDisplayMapper
            ? _.get(d, resultDisplayMapper)
            : _.get(d, 'title') || _.get(d, 'name'),
          value: _.get(d, fieldValueMapper),
        };
      })}
    />
  );
};
