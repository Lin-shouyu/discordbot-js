import Loadable from 'app/components/Loadable';
import { lazy } from 'react';
import { authRoles } from '../../auth/authRoles';
// import { BrowserRouter } from "react-router-dom";


const DOCUMENT_UPLOAD = Loadable(lazy(() => import('./DOCUMENT_UPLOAD')));



const DOCUMENT_UPLOAD_Routes = [
  { path: '/upload/default', element: <DOCUMENT_UPLOAD />, auth: authRoles.admin },
];


export default DOCUMENT_UPLOAD_Routes;
