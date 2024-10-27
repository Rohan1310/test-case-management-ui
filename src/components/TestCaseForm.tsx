import React from 'react';
import { Form, Input, Select, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { createTestCase, updateTestCase } from '../services/testCases';

const { TextArea } = Input;
const { Option } = Select;

interface TestCaseFormProps {
  modules: { id: number; name: string }[];
  testCase?: {
    id: number;
    module_id: number;
    summary: string;
    description: string;
    attachment: string;
  };
  onSuccess: () => void;
}

const TestCaseForm: React.FC<TestCaseFormProps> = ({ modules, testCase, onSuccess }) => {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const formData = new FormData();
    Object.keys(values).forEach(key => {
      if (key === 'attachment') {
        if (values[key] && values[key][0]) {
          formData.append(key, values[key][0].originFileObj);
        }
      } else {
        formData.append(key, values[key]);
      }
    });

    if (testCase) {
      await updateTestCase(testCase.id, formData);
    } else {
      await createTestCase(formData);
    }
    onSuccess();
    form.resetFields();
  };

  return (
    <Form form={form} onFinish={onFinish} initialValues={testCase}>
      <Form.Item name="module_id" label="Module" rules={[{ required: true }]}>
        <Select>
          {modules.map(module => (
            <Option key={module.id} value={module.id}>{module.name}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="summary" label="Summary" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item name="attachment" label="Attachment">
        <Upload beforeUpload={() => false}>
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {testCase ? 'Update' : 'Create'} Test Case
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TestCaseForm;