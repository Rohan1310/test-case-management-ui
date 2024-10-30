import React from 'react';
import { Table, Button, Popconfirm, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface TestCaseListProps {
  testCases: any[];
  selectedModule: any | null;
  onEdit: (testCase: any) => void;
  onDelete: (id: number) => void;
}

const TestCaseList: React.FC<TestCaseListProps> = ({ testCases, selectedModule, onEdit, onDelete }) => {
  const columns = [
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
      render: (text: string, record: any) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="Are you sure you want to delete this test case?" onConfirm={() => onDelete(record.id)}>
            <Button icon={<DeleteOutlined />} style={{ marginRight: 8 }} />
          </Popconfirm>
          {record.attachment && (
            <a href={`/api/test_cases/attachment/${record.attachment}`} target="_blank" rel="noopener noreferrer">
              <Button icon={<FileOutlined />} />
            </a>
          )}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>
        {selectedModule ? `${selectedModule.name} Test Cases` : 'All Test Cases'}
      </Title>
      <Table columns={columns} dataSource={testCases} rowKey="id" />
    </div>
  );
};

export default TestCaseList;