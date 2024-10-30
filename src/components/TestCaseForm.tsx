import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { createTestCase, updateTestCase } from '../services/testCases';

const { Option } = Select;
const { TextArea } = Input;

interface TestCaseFormProps {
  modules: any[];
  testCase: any | null;
  onSuccess: () => void;
  selectedModule: any; 
  modalState : any;
}

const TestCaseForm: React.FC<TestCaseFormProps> = ({ modules, testCase, onSuccess, selectedModule , modalState }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  const editInitialState= ()=>{
    form.setFieldsValue({
      module_id: testCase.module_id,
      summary: testCase.summary,
      description: testCase.description === 'N/A' ? '' : testCase.description,
    });

    if (Array.isArray(testCase.attachments)) {
      const existingFiles = testCase.attachments.map((attachment: string) => ({
        uid: attachment,
        name: attachment,
        status: 'done',
        url: `/image/${attachment}`,
      }));
      setFileList(existingFiles);
    }
  }

  useEffect(() => {
    if (testCase) {
      editInitialState()
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [testCase, form]);

  useEffect(() => {
    if (selectedModule?.id) {
      form.setFieldsValue({ module_id: selectedModule.id });
    }
  }, [selectedModule, form]);

  const onFinish = async (values: any) => {
    const formData = new FormData();
    formData.append('module_id', values.module_id);
    formData.append('summary', values.summary);
    formData.append('description', values.description || 'N/A');

    const existingAttachments = fileList
      .filter(file => file.status === 'done' && !file.originFileObj)
      .map(file => file.name);

    existingAttachments.forEach(filename => {
      formData.append('existing_attachments', filename);
    });

    fileList.forEach(file => {
      if (file.originFileObj) {
        formData.append('attachments', file.originFileObj);
      }
    });

    try {
      if (testCase) {
        await updateTestCase(testCase.id, formData);
      } else {
        await createTestCase(formData);
      }
      message.success('Test case saved successfully');
      form.resetFields();
      setFileList([]);
      onSuccess();
    } catch (error) {
      message.error('Failed to save test case');
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const handleCancel = (check : string) => {
    if(check){ 
      editInitialState()
    }else{
      form.resetFields();
      setFileList([]);
    }
    modalState(false);
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        name="module_id"
        label="Module"
        rules={[{ required: true, message: 'Please select a module' }]}
      >
        <Select>
          {modules.map(module => (
            <Option key={module.id} value={module.id}>{module.name}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="summary"
        label="Test Case Summary"
        rules={[{ required: true, message: 'Please enter a summary' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item
        name="attachments"
        label="Attachments"
        getValueFromEvent={normFile}
      >
        <Upload
          beforeUpload={() => false}
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          multiple
          accept='image/jpeg, image/png, image/gif, image/webp, image/svg+xml'
        >
          <Button icon={<UploadOutlined />}>Click to upload</Button>
        </Upload>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {testCase ? 'Update' : 'Create'} Test Case
        </Button>
        <Button type="default" className='ml-3' onClick={()=>handleCancel(testCase)}>
          Cancel
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TestCaseForm;