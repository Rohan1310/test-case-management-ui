import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Row, Col, Button, Modal, Form, Input, Select, Table, Space, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import ModuleTree from '../components/ModuleTree';
import TestCaseForm from '../components/TestCaseForm';
import { getAllModules, createModule } from '../services/modules';
import { getTestCases, deleteTestCase } from '../services/testCases';

const { Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;

interface Module {
  id: number;
  name: string;
  parent_id: number | null;
}

interface TestCase {
  id: number;
  name: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTestCaseModalVisible, setIsTestCaseModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchModules = useCallback(async () => {
    const data = await getAllModules();
    setModules(data);
  }, []);

  const fetchTestCases = useCallback(async (moduleId: number | null = null) => {
    const data = await getTestCases(moduleId);
    setTestCases(data);
  }, []);

  useEffect(() => {
    fetchModules();
    fetchTestCases();
  }, [fetchModules, fetchTestCases]);

  const handleModuleSelect = useCallback((moduleId: number | null) => {
    setSelectedModule(moduleId);
    fetchTestCases(moduleId);
  }, [fetchTestCases]);

  const handleTestCaseSuccess = useCallback(() => {
    fetchTestCases(selectedModule);
    setEditingTestCase(null);
    setIsTestCaseModalVisible(false);
  }, [fetchTestCases, selectedModule]);

  const handleEditTestCase = useCallback((testCase: TestCase) => {
    setEditingTestCase(testCase);
    setIsTestCaseModalVisible(true);
    form.setFieldsValue(testCase);
  }, [form]);

  const handleDeleteTestCase = useCallback((id: number) => {
    confirm({
      title: 'Are you sure you want to delete this test case?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      onOk: async () => {
        await deleteTestCase(id);
        setTestCases(prevTestCases => prevTestCases.filter(tc => tc.id !== id));
      },
    });
  }, []);

  const showModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const showTestCaseModal = useCallback(() => {
    setEditingTestCase(null);
    setIsTestCaseModalVisible(true);
    form.resetFields();
  }, [form]);

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
    form.resetFields();
  }, [form]);

  const handleTestCaseModalCancel = useCallback(() => {
    setIsTestCaseModalVisible(false);
    form.resetFields();
  }, [form]);

  const handleCreateModule = useCallback(async (values: { parent_id: string | number, name: string }) => {
    const parentId = values.parent_id === 'root' ? null : Number(values.parent_id);
    await createModule({ ...values, parent_id: parentId });
    fetchModules();
    setIsModalVisible(false);
    form.resetFields();
  }, [fetchModules, form]);

  useEffect(() => {
    if (editingTestCase) {
      form.setFieldsValue(editingTestCase);
    }
  }, [editingTestCase, form]);

  const columns = [
    {
      title: 'S.no',
      dataIndex: 'id',
      key: 'id',
      render : (_,record : any,index : any)=>{return index + 1}
    },
    {
      title: 'Summary',
      dataIndex: 'summary',
      key: 'summary',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: TestCase) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditTestCase(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteTestCase(record.id)}
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Content style={{ padding: '24px' }}>
      <Row gutter={24}>
        <Col span={6}>
          <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
            <Col>Modules</Col>
            <Col>
              <Button type="link" onClick={showModal} icon={<PlusCircleOutlined />} style={{ fontSize: '16px' }}>
                Add Module
              </Button>
            </Col>
          </Row>
          <ModuleTree
            modules={modules}
            onSelect={handleModuleSelect}
            selectedModule={selectedModule}
          />
        </Col>
        <Col span={18}>
          <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
            <Col>Test Cases</Col>
            <Col>
              <Button type="link" onClick={showTestCaseModal} icon={<PlusCircleOutlined />} style={{ fontSize: '16px' }}>
                Add Test Case
              </Button>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={testCases}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Col>
      </Row>

      <Modal
        title="Add Module"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateModule}>
          <Form.Item
            name="parent_id"
            label="Parent Module"
            rules={[{ required: true, message: 'Please select a parent module' }]}
          >
            <Select>
              <Option value="root">Root</Option>
              {modules.map(module => (
                <Option key={module.id} value={module.id}>{module.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="Module Name"
            rules={[{ required: true, message: 'Please enter the module name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Save</Button>
            <Button onClick={handleCancel} style={{ marginLeft: 8 }}>Cancel</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingTestCase ? "Edit Test Case" : "Add Test Case"}
        visible={isTestCaseModalVisible}
        onCancel={handleTestCaseModalCancel}
        footer={null}
      >
        <TestCaseForm
          modules={modules}
          testCase={editingTestCase}
          onSuccess={handleTestCaseSuccess}
          form={form}
        />
      </Modal>
    </Content>
  );
};

export default Dashboard;
