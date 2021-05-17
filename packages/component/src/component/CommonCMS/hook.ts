import { useEffect, useMemo, useState } from 'react';
import { useRequest } from '../../hook';
import { useCMSContext } from './context';
import { defaultLabelRender } from './locale';
import { RichSchema } from './RichSchema';
import { ICMSProps, IPagination } from './type';

export function useListServiceInfo() {
  const { listService } = useCMSContext();

  const req = useRequest(listService);
  const [pageData, setPageData] = useState<IPagination<any>>();

  // 防止翻页闪屏
  useEffect(() => {
    if (req.state.type === 'success' && generatePage) setPageData(generatePage(req.state.data));
  }, [req.state.type]);

  const querySchema = useMemo(
    () => RichSchema.create(listService.$meta.query.schema),
    [listService]
  );

  const respSchema = useMemo(
    () => RichSchema.create(listService.$meta.response.schema),
    [listService]
  );

  const generatePage = useMemo(() => respSchema.getPaginationGenerator(), [respSchema]);
  if (!generatePage) return undefined;

  return { req, pageData, querySchema, itemSchema: generatePage.itemSchema };
}

export function useReadServiceInfo(id: any) {
  const { readService, idMapper = 'id' } = useCMSContext();

  const readReq = useRequest(readService);

  const readRspSchema = useMemo(
    () =>
      readService?.$meta.response.schema
        ? RichSchema.create(readService.$meta.response.schema)
        : undefined,
    [readService]
  );

  const generateDetail = useMemo(() => readRspSchema?.getDetailGenerator(), [readRspSchema]);

  // 初始化刷新
  useEffect(() => {
    readReq?.refresh({ [idMapper]: id });
  }, []);

  // 空守卫
  if (!readReq || !generateDetail) return;

  const detailData =
    readReq.state.type === 'success' ? generateDetail(readReq.state.data) : undefined;

  const detailDataTitle = generateDetail.itemSchema.getTitleGenerator()?.(detailData);

  return { readReq, itemSchema: generateDetail.itemSchema, detailData, detailDataTitle };
}

export function useUpdateServiceInfo() {
  const { updateService } = useCMSContext();
  const updateReq = useRequest(updateService);

  const updateReqSchema = useMemo(
    () =>
      updateService?.$meta.query.schema
        ? RichSchema.create(updateService.$meta.query.schema)
        : undefined,
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
    () =>
      createService?.$meta.query.schema
        ? RichSchema.create(createService.$meta.query.schema)
        : undefined,
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
      return customRender?.label?.(ctx) || defaultLabelRender(ctx) || ctx.follow;
    };

    return labelRender;
  }, [customRender?.label]);
}
