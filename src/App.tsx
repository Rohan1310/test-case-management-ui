import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { getUser } from './services/auth';
import { setCredentials } from './store/authSlice';
import ImageDisplayPage from './pages/imageDisplayPage';

const { Content } = Layout;

const App: React.FC = () => {
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const user = await getUser();
        const token = localStorage.getItem('token');
        if (user && token) {
          store.dispatch(setCredentials({ user, token }));
        }
      } catch (error) {
        console.error('Failed to get user session:', error);
      }
    };

    checkUserSession();
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Header />
          <Content>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/image/:filename" element={<ImageDisplayPage/>} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </Provider>
  );
};

export default App;
