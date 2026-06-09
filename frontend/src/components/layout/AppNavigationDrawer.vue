<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const drawer = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const navItems = [
  { title: 'Tổng quan', to: '/', icon: 'mdi-view-dashboard-outline' },
  { title: 'Nhân viên', to: '/employees', icon: 'mdi-account-group-outline' },
  { title: 'Chấm công', to: '/attendance', icon: 'mdi-calendar-check-outline' },
  { title: 'Báo cáo', to: '/reports', icon: 'mdi-chart-box-outline' },
  { title: 'Cài đặt', to: '/settings', icon: 'mdi-cog-outline' },
]
</script>

<template>
  <v-navigation-drawer
    v-model="drawer"
    border="end"
    class="admin-drawer"
    width="280"
  >
    <div class="drawer-brand">
      <div class="brand-mark">
        <v-icon icon="mdi-calendar-check-outline" size="26" />
      </div>
      <div>
        <div class="brand-title">Chấm công</div>
        <div class="brand-subtitle">Trang quản trị</div>
      </div>
    </div>

    <v-divider />

    <v-list class="px-3 py-4" density="compact" nav>
      <v-list-item
        v-for="item in navItems"
        :key="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
        color="primary"
        rounded="lg"
      />
    </v-list>

    <template #append>
      <div class="drawer-profile">
        <v-avatar color="primary" size="36">
          <span class="text-subtitle-2">AD</span>
        </v-avatar>
        <div class="profile-copy">
          <div class="profile-name">Quản trị viên</div>
          <div class="profile-role">Quản trị hệ thống</div>
        </div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.admin-drawer {
  background: #ffffff;
}

.drawer-brand {
  align-items: center;
  display: flex;
  gap: 12px;
  min-height: 72px;
  padding: 16px;
}

.brand-mark {
  align-items: center;
  background: #e8f5f2;
  border-radius: 8px;
  color: #0f766e;
  display: flex;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.brand-title {
  color: #172033;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
}

.brand-subtitle,
.profile-role {
  color: #667085;
  font-size: 0.8125rem;
}

.drawer-profile {
  align-items: center;
  border-top: 1px solid #eaecf0;
  display: flex;
  gap: 10px;
  padding: 14px 16px;
}

.profile-copy {
  min-width: 0;
}

.profile-name {
  color: #172033;
  font-size: 0.9rem;
  font-weight: 600;
}
</style>
