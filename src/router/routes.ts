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

  {
    path: '/register',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'register',
        component: () => import('pages/RegisterPage.vue'),
        meta: { title: 'Register', public: true },
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
        name: 'my-characters',
        component: () => import('pages/MyCharactersPage.vue'),
        meta: { title: 'My Characters' },
      },
      {
        path: 'campaigns',
        name: 'campaigns',
        component: () => import('pages/CampaignsPage.vue'),
        meta: { title: 'My Campaigns' },
      },
      {
        path: 'campaigns/new',
        name: 'campaign-create',
        component: () => import('pages/CampaignFormPage.vue'),
        meta: { title: 'Create Campaign' },
      },
      {
        path: 'campaigns/:campaignId(\\d+)',
        name: 'campaign-detail',
        component: () => import('pages/CampaignDetailPage.vue'),
        props: true,
        meta: { title: 'Campaign' },
      },
      {
        path: 'campaigns/:campaignId(\\d+)/edit',
        name: 'campaign-edit',
        component: () => import('pages/CampaignFormPage.vue'),
        props: true,
        meta: { title: 'Edit Campaign' },
      },
      {
        path: 'campaigns/:campaignId(\\d+)/combats/:combatId(\\d+)',
        name: 'combat-detail',
        component: () => import('pages/CombatDetailPage.vue'),
        props: true,
        meta: { title: 'Combat' },
      },
      {
        path: 'campaigns/:campaignId(\\d+)/npcs/:npcId(\\d+)',
        name: 'npc-detail',
        component: () => import('pages/NpcDetailPage.vue'),
        props: true,
        meta: { title: 'NPC' },
      },
      {
        path: 'join/:code',
        name: 'join-campaign',
        component: () => import('pages/JoinCampaignPage.vue'),
        props: true,
        meta: { title: 'Join Campaign' },
      },
      {
        path: 'characters/new',
        name: 'character-create',
        component: () => import('pages/CharacterCreationPage.vue'),
        meta: { title: 'Create Character' },
      },
      {
        path: 'characters/:characterId(\\d+)',
        name: 'character-sheet',
        component: () => import('pages/CharacterSheetPage.vue'),
        props: true,
        meta: { title: 'Character Sheet' },
      },
      {
        path: 'characters/:characterId(\\d+)/edit',
        name: 'character-edit',
        component: () => import('pages/CharacterCreationPage.vue'),
        props: true,
        meta: { title: 'Edit Character' },
      },
      {
        path: 'account',
        name: 'account',
        component: () => import('pages/AccountPage.vue'),
        meta: { title: 'Account Settings' },
      },
    ],
  },

  {
    path: '/forgot-password',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'forgot-password',
        component: () => import('pages/ForgotPasswordPage.vue'),
        meta: { title: 'Forgot Password', public: true },
      },
    ],
  },

  {
    path: '/reset-password',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'reset-password',
        component: () => import('pages/ResetPasswordPage.vue'),
        meta: { title: 'Reset Password', public: true },
      },
    ],
  },

  // Google OAuth callback
  {
    path: '/oauth/google/callback',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'google-callback',
        component: () => import('pages/GoogleCallbackPage.vue'),
        meta: { title: 'Google Sign In', public: true },
      },
    ],
  },

  // Verify email (public - uses AuthLayout regardless of login state)
  {
    path: '/verify-email',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'verify-email',
        component: () => import('pages/VerifyEmailPage.vue'),
        meta: { title: 'Verify Email', public: true },
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
