<script setup>
import { reactive } from 'vue'

const account = reactive({
  name: 'Quản trị viên',
  email: 'admin@attendance.local',
  phone: '0900 000 000',
  role: 'Quản trị hệ thống',
  department: 'Văn phòng',
  status: 'Đang hoạt động',
})
</script>

<template>
  <div class="page-heading">
    <div>
      <p class="eyebrow">Tài khoản</p>
      <h1>Thông tin tài khoản</h1>
      <p class="heading-copy">Quản lý thông tin cá nhân và vai trò đang sử dụng trong hệ thống.</p>
    </div>
  </div>

  <v-row>
    <v-col cols="12" lg="4">
      <v-card border class="profile-card" elevation="0">
        <v-avatar color="primary" size="88">
          <span class="text-h5">AD</span>
        </v-avatar>

        <h2>{{ account.name }}</h2>
        <p>{{ account.role }}</p>

        <v-chip color="success" size="small" variant="tonal">
          {{ account.status }}
        </v-chip>
      </v-card>
    </v-col>

    <v-col cols="12" lg="8">
      <v-card border elevation="0">
        <v-card-title class="card-title">Thông tin cơ bản</v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="account.name"
                label="Họ tên"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="account.email"
                label="Email"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="account.phone"
                label="Số điện thoại"
                prepend-inner-icon="mdi-phone-outline"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="account.department"
                label="Bộ phận"
                prepend-inner-icon="mdi-office-building-outline"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="account.role"
                label="Vai trò"
                prepend-inner-icon="mdi-shield-account-outline"
                readonly
                variant="outlined"
              />
            </v-col>
          </v-row>

          <div class="form-actions">
            <v-btn color="primary" prepend-icon="mdi-content-save-outline">
              Lưu thay đổi
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
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

h1,
h2 {
  color: #172033;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}

h1 {
  font-size: 1.75rem;
}

h2 {
  font-size: 1.25rem;
  margin-top: 14px;
}

.heading-copy,
.profile-card p {
  color: #667085;
  margin-top: 6px;
}

.profile-card {
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: 320px;
  padding: 32px 24px;
  text-align: center;
}

.card-title {
  color: #172033;
  font-size: 1rem;
  font-weight: 700;
  padding: 18px 20px 10px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

@media (max-width: 700px) {
  .form-actions .v-btn {
    width: 100%;
  }
}
</style>
