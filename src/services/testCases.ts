import api from './api';

export const getTestCases = async (moduleId: number | null = null) => {
  const response = await api.get('/test-cases', { params: { module_id: moduleId } });
  return response.data;
};

export const createTestCase = async (data: FormData) => {
  const response = await api.post('/test-cases', data, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const updateTestCase = async (id: number, data: FormData) => {
  const response = await api.put(`/test-cases/${id}`, data, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const deleteTestCase = async (id: number) => {
  const response = await api.delete(`/test-cases/${id}`);
  return response.data;
};