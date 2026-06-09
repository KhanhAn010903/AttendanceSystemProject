import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './vuetify'
import { useAuthStore } from './stores/auth'

const pinia = createPinia()

window.addEventListener('auth:unauthorized', () => {
  const authStore = useAuthStore(pinia)
  const currentRoute = router.currentRoute.value

  authStore.clearSession()

  if (currentRoute.name !== 'login') {
    router.replace({
      name: 'login',
      query: {
        redirect: currentRoute.fullPath,
      },
    })
  }
})

createApp(App).use(pinia).use(router).use(vuetify).mount('#app')
