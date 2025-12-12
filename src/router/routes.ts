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
        path: 'campaigns/:campaignId',
        name: 'campaign-detail',
        component: () => import('pages/CampaignDetailPage.vue'),
        props: true,
        meta: { title: 'Campaign' },
      },
      {
        path: 'campaigns/:campaignId/characters/:characterId',
        name: 'character-sheet',
        component: () => import('pages/CharacterSheetPage.vue'),
        props: true,
        meta: { title: 'Character Sheet' },
      },
      {
        path: 'campaigns/:campaignId/characters/new',
        name: 'character-create',
        component: () => import('pages/CharacterCreationPage.vue'),
        props: true,
        meta: { title: 'Create Character' },
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
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
