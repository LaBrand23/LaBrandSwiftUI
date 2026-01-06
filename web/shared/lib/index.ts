export { apiClient, buildQueryString } from './api';
export type { ApiSuccessResponse, ApiErrorResponse, ApiResponse } from './api';

export {
  auth,
  app,
  signIn,
  signOut,
  resetPassword,
  changePassword,
  onAuthChange,
  getCurrentUser,
  getIdToken,
} from './firebase';
export type { User } from './firebase';

export {
  cn,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  truncate,
  getInitials,
  capitalize,
  slugify,
  generateId,
  debounce,
  isEmpty,
  getStatusColor,
  getStockStatus,
  parseQueryParams,
  buildUrl,
  downloadFile,
  copyToClipboard,
  getFileExtension,
  isImageFile,
  formatFileSize,
} from './utils';
