// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginRegister from '../components/LoginRegister.vue';

const routes = [

    {
        path: '/login-register',
        name: 'LoginRegister',
        component: LoginRegister
    },
    // ...其他路由
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;