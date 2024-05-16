import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/router.js'; // 引入router配置

createApp(App)
    .use(router) // 使用router
    .mount('#app')

