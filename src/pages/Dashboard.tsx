import { useState, useEffect, useCallback } from 'react';
import { Layout, Row, Col, Button, Modal, Form, Input, Select, Table, Space, Tooltip, message } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PlusCircleOutlined, FileOutlined } from '@ant-design/icons';
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
  summary: string;
  description: string;
  attachments: string[];
  module_id: number;
}

export default function Dashboard() {
  const [modules, setModules] = useState<Module[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTestCaseModalVisible, setIsTestCaseModalVisible] = useState(false);
  const [isAttachmentsModalVisible, setIsAttachmentsModalVisible] = useState(false);
  const [attachmentsToShow, setAttachmentsToShow] = useState<string[]>([]);
  const [form] = Form.useForm();

  const fetchModules = useCallback(async () => {
    try {
      const data = await getAllModules();
      setModules(data);
    } catch (error) {
      message.error('Failed to fetch modules');
    }
  }, []);

  const fetchTestCases = useCallback(async (moduleId: number | null = null) => {
    try {
      const data:any = await getTestCases(moduleId);
      setTestCases(data);
    } catch (error) {
      message.error('Failed to fetch test cases');
    }
  }, []);

  useEffect(() => {
    fetchModules();
    fetchTestCases();
  }, [fetchModules, fetchTestCases]);

  const handleModuleSelect = useCallback((moduleId: number | null) => {
    const selected = modules.find(m => m.id === moduleId) || null;
    setSelectedModule(selected);
    fetchTestCases(moduleId);
  }, [modules, fetchTestCases]);

  const handleTestCaseSuccess = useCallback(() => {
    fetchTestCases(selectedModule?.id || null);
    setEditingTestCase(null);
    setIsTestCaseModalVisible(false);
  }, [fetchTestCases, selectedModule]);

  const handleEditTestCase = useCallback((testCase: TestCase) => {
    setEditingTestCase(testCase);
    setIsTestCaseModalVisible(true);
  }, []);

  const handleDeleteTestCase = useCallback((id: number) => {
    confirm({
      title: 'Are you sure you want to delete this test case?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      onOk: async () => {
        try {
          await deleteTestCase(id);
          message.success('Test case deleted successfully');
          fetchTestCases(selectedModule?.id || null);
        } catch (error) {
          message.error('Failed to delete test case');
        }
      },
    });
  }, [fetchTestCases, selectedModule]);

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
    setEditingTestCase(null);
    form.resetFields();
  }, [form]);

  const handleCreateModule = useCallback(async (values: { parent_id: string | number; name: string }) => {
    try {
      const parentId = values.parent_id === 'root' ? null : Number(values.parent_id);
      await createModule({ ...values, parent_id: parentId });
      message.success('Module created successfully');
      fetchModules();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to create module');
    }
  }, [fetchModules, form]);

  const handleShowAttachments = useCallback((testCase: TestCase) => {
    setAttachmentsToShow(testCase.attachments);
    setIsAttachmentsModalVisible(true);
  }, []);

  const handleAttachmentsModalCancel = useCallback(() => {
    setIsAttachmentsModalVisible(false);
  }, []);

  const columns = [
    {
      title: 'S.no',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
      width: 80,
    },
    {
      title: 'Summary',
      dataIndex: 'summary',
      key: 'summary',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TestCase) => (
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
          <Tooltip title="Attachments">
            <Button
              type="link"
              icon={<FileOutlined />}
              onClick={() => handleShowAttachments(record)}
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
            selectedModule={selectedModule?.id || null}
          />
        </Col>
        <Col span={18}>
          <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
            <Col>{selectedModule ? `${selectedModule.name} Test Cases` : 'All Test Cases'}</Col>
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
        <Form form={form} onFinish={handleCreateModule} initialValues={{ parent_id: 'root' }}>
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
            < Button onClick={handleCancel} style={{ marginLeft: 8 }}>Cancel</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingTestCase ? "Edit Test Case" : "Add Test Case"}
        visible={isTestCaseModalVisible}
        onCancel={handleTestCaseModalCancel}
        footer={null}
        maskClosable={false}
      >
        <TestCaseForm
          modules={modules}
          testCase={editingTestCase}
          onSuccess={handleTestCaseSuccess}
          form={form}
          selectedModule = {selectedModule}
          modalState = {setIsTestCaseModalVisible}
        />
      </Modal>

      <Modal
        title="Attachments"
        visible={isAttachmentsModalVisible}
        onCancel={handleAttachmentsModalCancel}
        footer={null}
        maskClosable={false}
      >
        {!attachmentsToShow ? (
          <p>No Attachments</p>
        ) : (
          <ul>
            {attachmentsToShow?.map((attachment, index) => (
              <li key={index}>
                {index + 1 }. <a target="_blank" rel="noopener noreferrer" onClick={()=>window.open("/image/"+attachment)}>
                  {attachment}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </Content>
  );
}