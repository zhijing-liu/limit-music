import { createApp } from 'vue'
import App from '@/App.vue'
import style from '@/style'
import router from '@/router'
import { createPinia } from 'pinia'

createApp(App).use(style()).use(router).use(createPinia()).mount('#app')
