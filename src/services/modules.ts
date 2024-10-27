import api from './api';

export const getAllModules = async () => {
  const response = await api.get('/modules');
  return response.data;
};

export const createModule = async (data: any) => {
  const response = await api.post('/modules', data);
  return response.data;
};

export const updateModule = async (id: number, data: any) => {
  const response = await api.put(`/modules/${id}`, data);
  return response.data;
};

export const deleteModule = async (id: number) => {
  const response = await api.delete(`/modules/${id}`);
  return response.data;
};

export const reorderModules = async (data: any) => {
  const response = await api.post('/modules/reorder', data);
  return response.data;
};