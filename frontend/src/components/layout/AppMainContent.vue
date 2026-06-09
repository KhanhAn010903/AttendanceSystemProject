<template>
  <v-main class="admin-main">
    <v-container class="admin-content" fluid>
      <RouterView />
    </v-container>
  </v-main>
</template>

<style scoped>
.admin-main {
  background: #f6f7f9;
  min-height: 100vh;
}

.admin-content {
  margin: 0 auto;
  max-width: 1440px;
  padding: 24px;
}

@media (max-width: 600px) {
  .admin-content {
    padding: 16px;
  }
}
</style>
