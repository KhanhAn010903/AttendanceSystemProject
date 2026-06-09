<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import AppMainContent from './components/layout/AppMainContent.vue'
import AppNavigationDrawer from './components/layout/AppNavigationDrawer.vue'
import FooterAdvertisement from './components/layout/FooterAdvertisement.vue'

const route = useRoute()
const drawer = ref(true)

const isAuthLayout = computed(() => route.meta.layout === 'auth')
</script>

<template>
  <v-app>
    <RouterView v-if="isAuthLayout" />

    <template v-else>
      <AppNavigationDrawer v-model="drawer" />
      <AppHeader @toggle-drawer="drawer = !drawer" />
      <AppMainContent />
      <FooterAdvertisement />
    </template>
  </v-app>
</template>
