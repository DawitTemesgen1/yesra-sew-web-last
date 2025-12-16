import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../api';

// Generic API hook
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(...args);
      setData(response.data);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    execute();
  }, dependencies);

  return { data, loading, error, execute };
};

// Listings hook
export const useListings = (params = {}) => {
  return useApi(() => apiService.listings.getAll(params), [JSON.stringify(params)]);
};

// Single listing hook
export const useListing = (id) => {
  return useApi(() => apiService.listings.getById(id), [id]);
};

// Categories hook
export const useCategories = (params = {}) => {
  return useApi(() => apiService.categories.getAll(params), [JSON.stringify(params)]);
};

// Category tree hook
export const useCategoryTree = () => {
  return useApi(() => apiService.categories.getTree(), []);
};

// User favorites hook
export const useUserFavorites = (params = {}) => {
  return useApi(() => apiService.users.getFavorites(params), [JSON.stringify(params)]);
};

// User reviews hook
export const useUserReviews = (params = {}) => {
  return useApi(() => apiService.users.getReviews(params), [JSON.stringify(params)]);
};

// Notifications hook
export const useNotifications = (params = {}) => {
  return useApi(() => apiService.users.getNotifications(params), [JSON.stringify(params)]);
};

// Chat rooms hook
export const useChatRooms = (params = {}) => {
  return useApi(() => apiService.chat.getRooms(params), [JSON.stringify(params)]);
};

// Chat messages hook
export const useChatMessages = (roomId, params = {}) => {
  return useApi(() => apiService.chat.getRoom(roomId, params), [roomId, JSON.stringify(params)]);
};

// Payment history hook
export const usePaymentHistory = (params = {}) => {
  return useApi(() => apiService.payments.getHistory(params), [JSON.stringify(params)]);
};

// Admin dashboard hook
export const useAdminDashboard = () => {
  return useApi(() => apiService.admin.getDashboard(), []);
};

// Admin users hook
export const useAdminUsers = (params = {}) => {
  return useApi(() => apiService.admin.getUsers(params), [JSON.stringify(params)]);
};

// Admin listings hook
export const useAdminListings = (params = {}) => {
  return useApi(() => apiService.admin.getListings(params), [JSON.stringify(params)]);
};

// Admin transactions hook
export const useAdminTransactions = (params = {}) => {
  return useApi(() => apiService.admin.getTransactions(params), [JSON.stringify(params)]);
};

// Admin reports hook
export const useAdminReports = (params = {}) => {
  return useApi(() => apiService.admin.getReports(params), [JSON.stringify(params)]);
};

// Analytics dashboard hook
export const useAnalyticsDashboard = (params = {}) => {
  return useApi(() => apiService.analytics.getDashboard(params), [JSON.stringify(params)]);
};

// Mutations hook
export const useMutation = (apiCall) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(...args);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return { mutate, loading, error };
};

// Specific mutation hooks
export const useCreateListing = () => {
  return useMutation((formData) => apiService.listings.create(formData));
};

export const useUpdateListing = () => {
  return useMutation((id, formData) => apiService.listings.update(id, formData));
};

export const useDeleteListing = () => {
  return useMutation((id) => apiService.listings.delete(id));
};

export const useToggleFavorite = () => {
  return useMutation((id) => apiService.listings.toggleFavorite(id));
};

export const useCreatePaymentIntent = () => {
  return useMutation((paymentData) => apiService.payments.createIntent(paymentData));
};

export const useSendMessage = () => {
  return useMutation((roomId, messageData) => apiService.chat.sendMessage(roomId, messageData));
};

export const useCreateChatRoom = () => {
  return useMutation((roomData) => apiService.chat.createRoom(roomData));
};

export const useUpdateUserStatus = () => {
  return useMutation((id, statusData) => apiService.admin.updateUserStatus(id, statusData));
};

export const useUpdateListingStatus = () => {
  return useMutation((id, statusData) => apiService.admin.updateListingStatus(id, statusData));
};
