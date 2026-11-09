export type AdminFieldStatus = 'active' | 'inactive' | 'pending' | 'rejected';
export type AdminFieldStatusFilter = 'ALL' | AdminFieldStatus;

export interface AdminFieldOwnerSummary {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
}

export interface AdminFieldCourtsSummary {
  total: number;
  type5: number;
  type7: number;
  type11: number;
  activeCount: number;
}

export interface AdminFieldRatingSummary {
  averageRating: number;
  totalReviews: number;
  bayesianRating: number;
}

export interface AdminFieldItem {
  id: string;
  name: string;
  address: string;
  district: string | null;
  lat: number | null;
  lng: number | null;
  status: AdminFieldStatus;
  requireDeposit: boolean;
  depositFormatted: string;
  owner: AdminFieldOwnerSummary;
  courtsSummary: AdminFieldCourtsSummary;
  ratingSummary: AdminFieldRatingSummary;
  createdAt: string;
  updatedAt: string;
}

export interface AdminFieldListResponse {
  items: AdminFieldItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminFieldKpi {
  totalFields: number;
  activeFields: number;
  inactiveFields: number;
  pendingFields: number;
  rejectedFields: number;
  totalCourts: number;
  depositRequiredCount: number;
}

export interface AdminFieldCourtItem {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt?: string;
}

export interface AdminFieldImageItem {
  id: string;
  url: string;
  displayOrder: number;
  isThumbnail: boolean;
}

export interface AdminFieldServiceItem {
  id: string;
  name: string;
  price: number;
  unit: string | null;
  isActive: boolean;
}

export interface AdminFieldDetail {
  id: string;
  name: string;
  address: string;
  district: string | null;
  lat: number | null;
  lng: number | null;
  description: string | null;
  status: AdminFieldStatus;
  requireDeposit: boolean;
  depositType: string | null;
  depositValue: number | null;
  depositFormatted: string;
  owner: AdminFieldOwnerSummary;
  courtsSummary: AdminFieldCourtsSummary;
  courts: AdminFieldCourtItem[];
  images: AdminFieldImageItem[];
  services: AdminFieldServiceItem[];
  ratingSummary: AdminFieldRatingSummary;
  createdAt: string;
  updatedAt: string;
}

export interface AdminFieldQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminFieldStatusFilter;
  district?: string;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'ASC' | 'DESC';
}

export interface UpdateAdminFieldStatusPayload {
  status: 'active' | 'inactive';
  reason?: string;
}
