import api from './api';

export interface TestCase {
  id: number;
  module_id: number;
  summary: string;
  description: string;
  attachment: string | null;
}

export const getTestCases = async (moduleId: number | null = null): Promise<TestCase[]> => {
  const response = await api.get('/test-cases', { params: { module_id: moduleId } });
  return response.data;
};

export const createTestCase = async (data: FormData): Promise<TestCase> => {
  const response = await api.post('/test-cases', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateTestCase = async (id: number, data: FormData): Promise<TestCase> => {
  const response = await api.put(`/test-cases/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteTestCase = async (id: number): Promise<void> => {
  await api.delete(`/test-cases/${id}`);
};

export const getAttachment = async (filename: string): Promise<void> => {
  const response:any = await api.get(`/test-cases/attachments/${filename}`);
  return response;
};