import React from 'react';
import { Layout, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../services/auth';
import { RootState } from '../store';
import { clearCredentials } from '../store/authSlice';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = async () => {
    await logout();
    dispatch(clearCredentials());
    navigate('/login');
  };

  return (
    <AntHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ color: 'white' }}>Test Case Management</div>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: 'white', marginRight: '16px' }}>{user.name}</span>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      )}
    </AntHeader>
  );
};

export default Header;