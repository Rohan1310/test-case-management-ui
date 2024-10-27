import React from 'react';
import { List, Button, Popconfirm } from 'antd';
import { deleteTestCase } from '../services/testCases';

interface TestCase {
  id: number;
  module_id: number;
  summary: string;
  description: string;
  attachment: string;
}

interface TestCaseListProps {
  testCases: TestCase[];
  onEdit: (testCase: TestCase) => void;
  onDelete: (id: number) => void;
}

const TestCaseList: React.FC<TestCaseListProps> = ({ testCases, onEdit, onDelete }) => {
  const handleDelete = async (id: number) => {
    await deleteTestCase(id);
    onDelete(id);
  };

  return (
    <List
      itemLayout="horizontal"
      dataSource={testCases}
      renderItem={item => (
        <List.Item
          actions={[
            <Button onClick={() => onEdit(item)}>Edit</Button>,
            <Popconfirm
              title="Are you sure you want to delete this test case?"
              onConfirm={() => handleDelete(item.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger>Delete</Button>
            </Popconfirm>
          ]}
        >
          <List.Item.Meta
            title={item.summary}
            description={item.description}
          />
        </List.Item>
      )}
    />
  );
};

export default TestCaseList;