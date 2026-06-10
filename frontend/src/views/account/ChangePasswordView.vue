<script setup>
import { reactive, ref } from 'vue'

const visible = reactive({
  current: false,
  next: false,
  confirm: false,
})

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const loading = ref(false)
</script>

<template>
  <div class="change-password-page">
    <div class="page-heading">
    <div>
      <p class="eyebrow">Tài khoản</p>
      <h1>Đổi mật khẩu</h1>
      <p class="heading-copy">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản quản trị.</p>
    </div>
  </div>

  <v-row>
    <v-col cols="12" lg="7">
      <v-card border elevation="0">
        <v-card-title class="card-title">Thông tin mật khẩu</v-card-title>

        <v-card-text>
          <v-form @submit.prevent>
            <v-text-field
              v-model="form.currentPassword"
              :append-inner-icon="visible.current ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              :type="visible.current ? 'text' : 'password'"
              label="Mật khẩu hiện tại"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              @click:append-inner="visible.current = !visible.current"
            />

            <v-text-field
              v-model="form.newPassword"
              :append-inner-icon="visible.next ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              :type="visible.next ? 'text' : 'password'"
              label="Mật khẩu mới"
              prepend-inner-icon="mdi-lock-plus-outline"
              variant="outlined"
              @click:append-inner="visible.next = !visible.next"
            />

            <v-text-field
              v-model="form.confirmPassword"
              :append-inner-icon="visible.confirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              :type="visible.confirm ? 'text' : 'password'"
              label="Xác nhận mật khẩu mới"
              prepend-inner-icon="mdi-lock-check-outline"
              variant="outlined"
              @click:append-inner="visible.confirm = !visible.confirm"
            />

            <div class="form-actions">
              <v-btn variant="text">Hủy</v-btn>
              <v-btn
                color="primary"
                :loading="loading"
                prepend-icon="mdi-content-save-outline"
                type="submit"
              >
                Cập nhật mật khẩu
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="5">
      <v-card border elevation="0">
        <v-card-title class="card-title">Lưu ý bảo mật</v-card-title>

        <v-list density="compact">
          <v-list-item
            prepend-icon="mdi-check-circle-outline"
            title="Dùng ít nhất 8 ký tự"
          />
          <v-list-item
            prepend-icon="mdi-check-circle-outline"
            title="Kết hợp chữ hoa, chữ thường và số"
          />
          <v-list-item
            prepend-icon="mdi-check-circle-outline"
            title="Không dùng lại mật khẩu cũ"
          />
        </v-list>
      </v-card>
    </v-col>
  </v-row>
  </div>
</template>

<style scoped>
.page-heading {
  margin-bottom: 22px;
}

.eyebrow {
  color: #0f766e;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0;
  margin-bottom: 4px;
  text-transform: uppercase;
}

h1 {
  color: #172033;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}

.heading-copy {
  color: #667085;
  margin-top: 6px;
}

.card-title {
  color: #172033;
  font-size: 1rem;
  font-weight: 700;
  padding: 18px 20px 10px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

@media (max-width: 700px) {
  .form-actions {
    display: grid;
  }
}
</style>
