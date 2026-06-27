
export enum UserRole {
  CITIZEN = 'citizen',
  WORKER = 'worker',
  ADMIN = 'admin'
}

export enum ComplaintStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  organizationName?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  latitude: number;
  longitude: number;
  address?: string;
  imageUrl?: string;
  proofUrl?: string;
  citizenId: string;
  workerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Scheme {
  id: string;
  title: string;
  description: string;
  benefits: string;
  eligibility: string;
}

export interface CertificateType {
  id: string;
  name: string;
  display_name: string;
  description: string;
  is_active: boolean;
  required_fields: string;
  template_path?: string;
  created_at: string;
  updated_at: string;
}

export interface CertificateApplication {
  id: string;
  application_number: string;
  citizen_id: string;
  organization_id: string;
  certificate_type_id: string;
  form_data: string;
  supporting_documents?: string;
  status: string;
  admin_remarks?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  approved_at?: string;
  certificate_number?: string;
  issued_at?: string;
  certificate_path?: string;
  created_at: string;
  updated_at: string;
  citizen_name?: string;
  certificate_type_name: string;
}

export interface CertificateApplicationListItem {
  id: string;
  application_number: string;
  citizen_id: string;
  citizen_name?: string;
  certificate_type_id: string;
  certificate_type_name: string;
  status: string;
  created_at: string;
}

export interface CertificateApplicationCreate {
  certificate_type_id: string;
  form_data: string;
  supporting_documents?: string;
}

export enum CertificateStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
