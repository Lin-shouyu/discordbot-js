import Loadable from 'app/components/Loadable';
import { lazy } from 'react';
import { authRoles } from '../../auth/authRoles';
// import { BrowserRouter } from "react-router-dom";


const Search_detail2 = Loadable(lazy(() => import('./DOCUMENT_SEARCH')));



const SearchRoutes = [
  { path: '/Search/default', element: <Search_detail2 />, auth: authRoles.admin },
];


export default SearchRoutes;
