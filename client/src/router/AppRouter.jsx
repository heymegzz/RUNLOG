import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import Landing from '../pages/Landing/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import JobList from '../pages/Jobs/JobList';
import JobForm from '../pages/Jobs/JobForm';
import JobDetail from '../pages/Jobs/JobDetail';
import Executions from '../pages/Executions';
import Team from '../pages/Settings/Team';
import ApiKeys from '../pages/Settings/ApiKeys';
import NotFound from '../pages/NotFound';

const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected app routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/new" element={<JobForm />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/jobs/:id/edit" element={<JobForm />} />
          
          <Route path="/executions" element={<Executions />} />
          
          <Route path="/settings/team" element={<Team />} />
          <Route path="/settings/api-keys" element={<ApiKeys />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
