import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Public routes with minimal layout
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        meta: { title: 'Login', public: true },
      },
    ],
  },

  // Protected routes
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'campaigns',
        component: () => import('pages/CampaignsPage.vue'),
        meta: { title: 'My Campaigns' },
      },
      {
        path: 'campaigns/:campaignId(\\d+)',
        name: 'campaign-detail',
        component: () => import('pages/CampaignDetailPage.vue'),
        props: true,
        meta: { title: 'Campaign' },
      },
      {
        path: 'campaigns/:campaignId(\\d+)/characters/new',
        name: 'character-create',
        component: () => import('pages/CharacterCreationPage.vue'),
        props: true,
        meta: { title: 'Create Character' },
      },
      {
        path: 'campaigns/:campaignId(\\d+)/characters/:characterId(\\d+)/edit',
        name: 'character-edit',
        component: () => import('pages/CharacterCreationPage.vue'),
        props: true,
        meta: { title: 'Edit Character' },
      },
      {
        path: 'campaigns/:campaignId(\\d+)/characters/:characterId(\\d+)',
        name: 'character-sheet',
        component: () => import('pages/CharacterSheetPage.vue'),
        props: true,
        meta: { title: 'Character Sheet' },
      },
      {
        path: 'characters/new',
        name: 'character-create-standalone',
        component: () => import('pages/CharacterCreationPage.vue'),
        meta: { title: 'Create Character' },
      },
    ],
  },

  // Error pages
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('pages/ErrorForbidden.vue'),
    meta: { title: 'Access Forbidden', public: true },
  },
  {
    path: '/error',
    name: 'server-error',
    component: () => import('pages/ErrorServer.vue'),
    meta: { title: 'Server Error', public: true },
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { title: 'Not Found', public: true },
  },
];

export default routes;
