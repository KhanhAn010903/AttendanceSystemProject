import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './vuetify'

window.addEventListener('auth:unauthorized', () => {
  const currentRoute = router.currentRoute.value

  if (currentRoute.name !== 'login') {
    router.replace({
      name: 'login',
      query: {
        redirect: currentRoute.fullPath,
      },
    })
  }
})

createApp(App).use(router).use(vuetify).mount('#app')
