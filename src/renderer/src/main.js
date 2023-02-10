import { createApp } from 'vue'
import App from '@/App.vue'
import style from '@/style'
import router from '@/router'

createApp(App).use(style()).use(router).mount('#app')
