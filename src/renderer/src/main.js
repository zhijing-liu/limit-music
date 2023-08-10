import { createApp } from 'vue'
import App from '@/App.vue'
import style from '@/style'
import router from '@/router'
import { createPinia } from 'pinia'
import { directive } from '@/directive'

createApp(App).use(style()).use(router).use(directive).use(createPinia()).mount('#app')
