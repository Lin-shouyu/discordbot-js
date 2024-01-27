import AuthGuard from 'app/auth/AuthGuard';
import chartsRoute from 'app/views/charts/ChartsRoute';
import dashboardRoutes from 'app/views/dashboard/DashboardRoutes';
// import UserlistRoutes from 'app/views/dashboard/UserlistRoutes';
import DOCUMENT_UPLOAD_Routes from 'app/views/dashboard/DOCUMENT_UPLOAD_Routes';
import materialRoutes from 'app/views/material-kit/MaterialRoutes';
import NotFound from 'app/views/sessions/NotFound';
import sessionRoutes from 'app/views/sessions/SessionRoutes';
import { Navigate } from 'react-router-dom';
import MatxLayout from './components/MatxLayout/MatxLayout';
import EditCourse from 'app/views/dashboard/DOCUMENT_detail'; 
import SearchRoutes from 'app/views/dashboard/SearchRoutes'; 


const routes = [
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      ...dashboardRoutes,
      ...chartsRoute,
      ...materialRoutes,      
      ...DOCUMENT_UPLOAD_Routes,
      ...SearchRoutes,
      { path: 'edit/:id', element: <EditCourse /> },
    ],
  },
  ...sessionRoutes,
  { path: '/', element: <Navigate to="dashboard/default" /> },
  { path: '/', element: <Navigate to="upload/default" /> },  
  { path: '/', element: <Navigate to="MemberReg/default" /> }, 
  { path: '/', element: <Navigate to="page-layouts/user-profile/default" /> }, 
  { path: '/', element: <Navigate to="page-layouts/Search/default" /> }, 

 { path: 'edit/:dep_name/:doc_name', element: <EditCourse /> },
  { path: '*', element: <NotFound /> },
];

export default routes;
