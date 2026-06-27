
export const API_BASE_URL = 'http://127.0.0.1:8000';

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  assigned: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
};

export const STORAGE_KEYS = {
  TOKEN: 'civic_token',
  USER: 'civic_user',
  ORGANIZATION: 'civic_organization',
  ORGANIZATION_NAME: 'civic_organization_name',
};
