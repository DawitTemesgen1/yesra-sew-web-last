import { STATUS_COLORS } from '../constants/menuItems';

export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || 'default';
};

export const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return 'AccessTime';
    case 'approved':
    case 'completed':
      return 'CheckCircle';
    case 'rejected':
    case 'failed':
      return 'Cancel';
    case 'active':
      return 'CheckCircle';
    case 'inactive':
      return 'Block';
    default:
      return 'Help';
  }
};

export const formatCurrency = (amount, currency = 'ETB') => {
  return `${currency} ${amount.toLocaleString()}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const formatNumber = (number) => {
  return number.toLocaleString();
};

