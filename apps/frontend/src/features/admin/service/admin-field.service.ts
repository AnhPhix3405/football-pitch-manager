import { apiClient, type ApiResponse } from '../../../config/axios.config';
import type {
  AdminFieldDetail,
  AdminFieldItem,
  AdminFieldKpi,
  AdminFieldListResponse,
  AdminFieldQueryParams,
  UpdateAdminFieldStatusPayload,
} from '../interface/admin-field.interface';

export const adminFieldService = {
  async getFields(params?: AdminFieldQueryParams): Promise<AdminFieldListResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.search && params.search.trim()) queryParams.search = params.search.trim();
    if (params?.status) queryParams.status = params.status;
    if (params?.district && params.district.trim()) queryParams.district = params.district.trim();
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

    const res = await apiClient.get<ApiResponse<AdminFieldListResponse> | AdminFieldListResponse>(
      '/admin/fields',
      { params: queryParams },
    );

    if (res.data && 'data' in res.data && res.data.data) {
      return res.data.data;
    }
    return res.data as AdminFieldListResponse;
  },

  async getKpi(): Promise<AdminFieldKpi> {
    const res = await apiClient.get<ApiResponse<AdminFieldKpi> | AdminFieldKpi>(
      '/admin/fields/kpi',
    );

    if (res.data && 'data' in res.data && res.data.data) {
      return res.data.data;
    }
    return res.data as AdminFieldKpi;
  },

  async getFieldDetail(id: string): Promise<AdminFieldDetail> {
    const res = await apiClient.get<ApiResponse<AdminFieldDetail> | AdminFieldDetail>(
      `/admin/fields/${id}`,
    );

    if (res.data && 'data' in res.data && res.data.data) {
      return res.data.data;
    }
    return res.data as AdminFieldDetail;
  },

  async updateFieldStatus(
    id: string,
    payload: UpdateAdminFieldStatusPayload,
  ): Promise<AdminFieldItem> {
    const res = await apiClient.patch<ApiResponse<AdminFieldItem> | AdminFieldItem>(
      `/admin/fields/${id}/status`,
      payload,
    );

    if (res.data && 'data' in res.data && res.data.data) {
      return res.data.data;
    }
    return res.data as AdminFieldItem;
  },
};
