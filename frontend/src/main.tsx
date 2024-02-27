import '@gear-js/vara-ui/dist/style.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { App } from './App';
import { ROUTE } from './consts';
import { App as Home } from './pages';
import './index.scss';
import { PeerConnectionProvider } from './context/PeerConnection';
import Chat from './pages/chat/chat';

const PRIVATE_ROUTES = [

];

const ROUTES = [
  { path: ROUTE.HOME, element: <Chat /> },
];

const router = createBrowserRouter([{ element: <App />, children: ROUTES }]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
