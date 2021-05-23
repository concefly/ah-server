import React, { useEffect, useLayoutEffect } from 'react';
import { Select } from 'antd';
import { CMSContext, useCMSContext, useCMSEntityContext } from '../context';
import { useListServiceInfo, useReadServiceInfo } from '../hook';
import _ from 'lodash';

type IFieldSelect = {
  entity: string;
  queryMapper: string;
  resultDisplayMapper?: string;
  fieldValueMapper?: string;
  value?: any;
  onChange?: (v: any) => any;
  style?: React.CSSProperties;
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
  style,
}: IFieldSelect) => {
  const lsInfo = useListServiceInfo();
  const rdInfo = useReadServiceInfo(value);

  if (!lsInfo || !rdInfo) return null;

  const handleSearch = _.debounce((q: string) => lsInfo.req.refresh({ [queryMapper]: q }), 300);

  return (
    <Select
      allowClear
      showSearch
      loading={lsInfo.req.state.type === 'loading'}
      value={value}
      onChange={onChange}
      onSearch={handleSearch}
      filterOption={false}
      options={(lsInfo.pageData?.list || [rdInfo.detailData])?.map(d => {
        return {
          label: resultDisplayMapper
            ? _.get(d, resultDisplayMapper)
            : _.get(d, 'title') || _.get(d, 'name'),
          value: _.get(d, fieldValueMapper),
        };
      })}
      style={style}
    />
  );
};
