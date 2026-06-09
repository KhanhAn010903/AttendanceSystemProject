import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export const useAccountDisplay = () => {
  const authStore = useAuthStore()
  const { user } = storeToRefs(authStore)

  const accountName = computed(() => user.value?.name || user.value?.email || 'Tai khoan')

  const accountSubtitle = computed(() => {
    const roles = user.value?.roles

    if (Array.isArray(roles) && roles.length > 0) {
      return roles.map((role) => role.name || role).filter(Boolean).join(', ')
    }

    return user.value?.role?.name || user.value?.role || user.value?.email || 'Nguoi dung'
  })

  const accountInitials = computed(() => {
    const nameParts = accountName.value.trim().split(/\s+/).filter(Boolean)

    if (nameParts.length === 0) {
      return 'TK'
    }

    return nameParts
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  })

  const ensureUser = () => authStore.ensureUser()

  return {
    accountInitials,
    accountName,
    accountSubtitle,
    ensureUser,
    user,
  }
}
