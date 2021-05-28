import { useEffect, useMemo, useState } from 'react';
import { useRequest } from 'ah-hook';
import { useCMSContext } from './context';
import { __ } from './locale';
import { ICMSProps, IPagination } from './type';
import { Logger } from 'ah-logger';
import { SchemaHelper } from './SchemHelper';

export function useListServiceInfo() {
  const { listService } = useCMSContext();

  const req = useRequest(listService);
  const [pageData, setPageData] = useState<IPagination<any>>();

  // 防止翻页闪屏
  useEffect(() => {
    if (req.state.type === 'success' && generatePage) setPageData(generatePage(req.state.data));
  }, [req.state.type]);

  const querySchema = useMemo(() => listService.$meta.query.schema, [listService]);
  const respSchema = useMemo(() => listService.$meta.response.schema, [listService]);

  const generatePage = useMemo(() => SchemaHelper.getPaginationGenerator(respSchema), [respSchema]);
  if (!generatePage) return undefined;

  return { req, pageData, querySchema, itemSchema: generatePage.itemSchema };
}

export function useReadServiceInfo(id: any) {
  const { readService, idMapper = 'id' } = useCMSContext();

  const readReq = useRequest(readService);

  const readRspSchema = useMemo(
    () => (readService?.$meta.response.schema ? readService.$meta.response.schema : undefined),
    [readService]
  );

  const generateDetail = useMemo(
    () => (readRspSchema ? SchemaHelper.getDetailGenerator(readRspSchema) : undefined),
    [readRspSchema]
  );

  // 初始化刷新
  useEffect(() => {
    if (id && readReq) {
      const query = { [idMapper]: id };
      readReq.refresh(query);
    }
  }, []);

  // 空守卫
  if (!readReq || !generateDetail) return;

  const detailData =
    readReq.state.type === 'success' ? generateDetail(readReq.state.data) : undefined;

  const detailDataTitle = SchemaHelper.getTitleGenerator(generateDetail.itemSchema)?.(detailData);

  return { readReq, itemSchema: generateDetail.itemSchema, detailData, detailDataTitle };
}

export function useUpdateServiceInfo() {
  const { updateService } = useCMSContext();
  const updateReq = useRequest(updateService);

  const updateReqSchema = useMemo(
    () => (updateService?.$meta.query.schema ? updateService.$meta.query.schema : undefined),
    [updateService]
  );

  // 空守卫
  if (!updateReq || !updateReqSchema) return;

  return { updateReq, querySchema: updateReqSchema };
}

export function useCreateServiceInfo() {
  const { createService } = useCMSContext();
  const createReq = useRequest(createService);

  const querySchema = useMemo(
    () => (createService?.$meta.query.schema ? createService.$meta.query.schema : undefined),
    [createService]
  );

  // 空守卫
  if (!createReq || !querySchema) return;

  return { createReq, querySchema };
}

export function useLabelRender() {
  const { customRender } = useCMSContext();

  return useMemo(() => {
    const labelRender = (
      ctx: Parameters<Required<Required<ICMSProps>['customRender']>['label']>[0]
    ) => {
      return customRender?.label?.(ctx) || ctx.schema?.title || __(ctx.key);
    };

    return labelRender;
  }, [customRender?.label]);
}

const defaultLogger = new Logger('CMS');
export function useLogger(name: string) {
  return useMemo(() => defaultLogger.extend(name), [name]);
}
