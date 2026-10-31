import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { ServicesPage } from '../pages/ServicesPage.js';
import { EndpointsPage } from '../pages/EndpointsPage.js';
import { ScenariosPage } from '../pages/ScenariosPage.js';
import { ActivityPage } from '../pages/ActivityPage.js';
import { ApiTesterPage } from '../pages/ApiTesterPage.js';
import { DocsPage } from '../pages/DocsPage.js';
import { SettingsPage } from '../pages/SettingsPage.js';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'endpoints', element: <EndpointsPage /> },
      { path: 'scenarios', element: <ScenariosPage /> },
      { path: 'activity', element: <ActivityPage /> },
      { path: 'test', element: <ApiTesterPage /> },
      { path: 'docs', element: <DocsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
