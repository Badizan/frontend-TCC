import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VehicleList from './pages/VehicleList';
import VehicleForm from './pages/VehicleForm';
import ExpenseList from './pages/ExpenseList';
import ExpenseForm from './pages/ExpenseForm';
import ReminderList from './pages/ReminderList';
import ReminderForm from './pages/ReminderForm';
import Layout from './components/Layout';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <PrivateRoute>
                <Layout>
                  <VehicleList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/vehicles/new"
            element={
              <PrivateRoute>
                <Layout>
                  <VehicleForm />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/vehicles/:id/edit"
            element={
              <PrivateRoute>
                <Layout>
                  <VehicleForm />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <PrivateRoute>
                <Layout>
                  <ExpenseList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/expenses/new"
            element={
              <PrivateRoute>
                <Layout>
                  <ExpenseForm />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/expenses/:id/edit"
            element={
              <PrivateRoute>
                <Layout>
                  <ExpenseForm />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reminders"
            element={
              <PrivateRoute>
                <Layout>
                  <ReminderList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reminders/new"
            element={
              <PrivateRoute>
                <Layout>
                  <ReminderForm />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reminders/:id/edit"
            element={
              <PrivateRoute>
                <Layout>
                  <ReminderForm />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;