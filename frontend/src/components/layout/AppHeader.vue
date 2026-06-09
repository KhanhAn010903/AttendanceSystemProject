<script setup>
import { useRouter } from 'vue-router'
import { authApi } from '@/api'

const emit = defineEmits(['toggle-drawer'])
const router = useRouter()

const accountMenuItems = [
  { title: 'Thông tin', icon: 'mdi-account-outline', to: '/account/profile' },
  { title: 'Đổi mật khẩu', icon: 'mdi-lock-reset', to: '/account/change-password' },
  { title: 'Đăng xuất', icon: 'mdi-logout', danger: true, action: 'logout' },
]

const handleAccountAction = async (item) => {
  if (item.action !== 'logout') {
    return
  }

  await authApi.logout()
  router.replace('/login')
}
</script>

<template>
  <v-app-bar border="b" class="admin-header" elevation="0" height="64">
    <v-app-bar-nav-icon
      aria-label="Mở hoặc đóng thanh điều hướng"
      @click="emit('toggle-drawer')"
    />

    <v-app-bar-title>Quản trị chấm công</v-app-bar-title>

    <v-spacer />

    <v-btn aria-label="Thông báo" icon="mdi-bell-outline" variant="text" />

    <v-menu location="bottom end" offset="8">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          aria-label="Tài khoản"
          icon="mdi-account-circle-outline"
          variant="text"
        />
      </template>

      <v-card class="account-menu" elevation="8" min-width="240">
        <div class="account-menu__profile">
          <v-avatar color="primary" size="40">
            <span class="text-subtitle-2">QT</span>
          </v-avatar>
          <div>
            <div class="account-menu__name">Quản trị viên</div>
            <div class="account-menu__role">Quản trị hệ thống</div>
          </div>
        </div>

        <v-divider />

        <v-list density="compact" nav>
          <v-list-item
            v-for="item in accountMenuItems"
            :key="item.title"
            :class="{ 'account-menu__danger-item': item.danger }"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.to"
            rounded="lg"
            @click="handleAccountAction(item)"
          />
        </v-list>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>

<style scoped>
.admin-header {
  background: #ffffff;
  color: #172033;
}

.account-menu {
  border: 1px solid #eaecf0;
  border-radius: 8px;
}

.account-menu__profile {
  align-items: center;
  display: flex;
  gap: 12px;
  padding: 14px 16px;
}

.account-menu__name {
  color: #172033;
  font-size: 0.95rem;
  font-weight: 700;
}

.account-menu__role {
  color: #667085;
  font-size: 0.8125rem;
}

.account-menu__danger-item {
  color: #b42318;
}
</style>
