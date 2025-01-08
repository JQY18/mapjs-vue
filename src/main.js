import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { Icon } from '@iconify/vue';

const app = createApp(App)
app.use(router)
app.mount('#app')
app.component('Icon', Icon);
