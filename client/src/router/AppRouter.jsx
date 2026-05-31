import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Pages — uncomment as you build them in Phase 5+
// import Login from '../pages/Login';
// import Register from '../pages/Register';
// import Dashboard from '../pages/Dashboard';
// import JobList from '../pages/Jobs/JobList';
// import JobDetail from '../pages/Jobs/JobDetail';
// import JobForm from '../pages/Jobs/JobForm';
// import Executions from '../pages/Executions';
// import Team from '../pages/Settings/Team';
// import ApiKeys from '../pages/Settings/ApiKeys';
// import NotFound from '../pages/NotFound';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/register" element={<Register />} /> */}

        {/* Protected routes */}
        {/* <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> */}
        {/* <Route path="/jobs" element={<ProtectedRoute><JobList /></ProtectedRoute>} /> */}
        {/* <Route path="/jobs/new" element={<ProtectedRoute><JobForm /></ProtectedRoute>} /> */}
        {/* <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} /> */}
        {/* <Route path="/jobs/:id/edit" element={<ProtectedRoute><JobForm /></ProtectedRoute>} /> */}
        {/* <Route path="/executions" element={<ProtectedRoute><Executions /></ProtectedRoute>} /> */}
        {/* <Route path="/settings/team" element={<ProtectedRoute><Team /></ProtectedRoute>} /> */}
        {/* <Route path="/settings/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} /> */}

        {/* Catch-all */}
        {/* <Route path="*" element={<NotFound />} /> */}

        {/* Temporary: show placeholder until pages are built */}
        <Route path="*" element={<div style={{ padding: '2rem', textAlign: 'center' }}><h1>🚀 RunLog</h1><p>Project scaffolded — start building Phase 1!</p></div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
