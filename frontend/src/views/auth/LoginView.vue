<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)
const errorMessage = ref('')

const form = reactive({
  email: '',
  password: '',
  remember: true,
})

const login = async () => {
  errorMessage.value = ''

  try {
    await authStore.login({
      email: form.email,
      password: form.password,
    })

    const redirectPath = Array.isArray(route.query.redirect)
      ? route.query.redirect[0]
      : route.query.redirect

    router.replace(redirectPath || '/')
  } catch (error) {
    errorMessage.value = authStore.error || error.response?.data?.message
  }
}
</script>

<template>
  <v-main class="login-page">
    <div class="login-shell">
      <section class="login-intro">
        <div class="brand-mark">
          <v-icon icon="mdi-calendar-check-outline" size="30" />
        </div>
        <p class="eyebrow">Hệ thống chấm công</p>
        <h1>Đăng nhập quản trị</h1>
        <p>
          Truy cập bảng điều khiển để quản lý nhân viên, chấm công, báo cáo và cấu hình hệ thống.
        </p>
      </section>

      <v-card border class="login-card" elevation="0">
        <v-card-title class="login-title">Đăng nhập</v-card-title>
        <v-card-subtitle class="login-subtitle">
          Nhập thông tin tài khoản quản trị của bạn.
        </v-card-subtitle>

        <v-card-text>
          <v-form @submit.prevent="login" au>
            <v-alert
              v-if="errorMessage"
              class="mb-4"
              density="compact"
              type="error"
              variant="tonal"
            >
              {{ errorMessage }}
            </v-alert>

            <v-text-field
              v-model="form.email"
              autocomplete="email"
              label="Email"
              prepend-inner-icon="mdi-email-outline"
              type="email"
              variant="outlined"
            />

            <v-text-field
              v-model="form.password"
              :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              label="Mật khẩu"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              @click:append-inner="showPassword = !showPassword"
            />

            <div class="login-options">
              <v-checkbox
                v-model="form.remember"
                color="primary"
                density="compact"
                hide-details
                label="Ghi nhớ đăng nhập"
              />

              <v-btn variant="text">Quên mật khẩu?</v-btn>
            </div>

            <v-btn
              block
              color="primary"
              :loading="authStore.loading"
              prepend-icon="mdi-login"
              size="large"
              type="submit"
            >
              Đăng nhập
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
  </v-main>
</template>

<style scoped>
.login-page {
  background: #f6f7f9;
  min-height: 100vh;
}

.login-shell {
  align-items: center;
  display: grid;
  gap: 40px;
  grid-template-columns: minmax(0, 1fr) 440px;
  margin: 0 auto;
  min-height: 100vh;
  max-width: 1120px;
  padding: 32px;
}

.login-intro {
  max-width: 560px;
}

.brand-mark {
  align-items: center;
  background: #e8f5f2;
  border-radius: 8px;
  color: #0f766e;
  display: flex;
  height: 54px;
  justify-content: center;
  margin-bottom: 22px;
  width: 54px;
}

.eyebrow {
  color: #0f766e;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0;
  margin-bottom: 8px;
  text-transform: uppercase;
}

h1 {
  color: #172033;
  font-size: 2.3rem;
  font-weight: 800;
  line-height: 1.1;
  margin: 0;
}

.login-intro p:not(.eyebrow) {
  color: #667085;
  font-size: 1rem;
  line-height: 1.7;
  margin-top: 16px;
}

.login-card {
  border-radius: 8px;
  padding: 10px;
}

.login-title {
  color: #172033;
  font-size: 1.4rem;
  font-weight: 800;
  padding: 22px 22px 4px;
}

.login-subtitle {
  color: #667085;
  padding: 0 22px 18px;
}

.login-options {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: -6px 0 18px;
}

@media (max-width: 860px) {
  .login-shell {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .login-intro {
    max-width: none;
  }

  .login-card {
    width: 100%;
  }
}

@media (max-width: 520px) {
  h1 {
    font-size: 1.8rem;
  }

  .login-options {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }
}
</style>
