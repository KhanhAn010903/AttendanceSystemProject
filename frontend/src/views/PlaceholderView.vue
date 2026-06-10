<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="placeholder-page">
    <div class="page-heading">
    <div>
      <p class="eyebrow">Phân hệ</p>
      <h1>{{ title }}</h1>
      <p class="heading-copy">{{ description }}</p>
    </div>

    <v-btn color="primary" prepend-icon="mdi-plus">
      Thêm mới
    </v-btn>
  </div>

  <v-row>
    <v-col cols="12" lg="8">
      <v-card border elevation="0">
        <v-card-title class="card-title">Nội dung chính</v-card-title>
        <v-card-text>
          Đây là khung trang cơ bản. Bạn có thể thay bằng bảng dữ liệu, biểu mẫu hoặc bộ lọc
          riêng cho phân hệ này.
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card border elevation="0">
        <v-card-title class="card-title">Tác vụ nhanh</v-card-title>
        <v-list density="compact">
          <v-list-item prepend-icon="mdi-filter-outline" title="Thêm bộ lọc" />
          <v-list-item prepend-icon="mdi-file-export-outline" title="Xuất dữ liệu" />
          <v-list-item prepend-icon="mdi-history" title="Xem lịch sử" />
        </v-list>
      </v-card>
    </v-col>
  </v-row>
  </div>
</template>

<style scoped>
.page-heading {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
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

@media (max-width: 700px) {
  .page-heading {
    display: block;
  }

  .page-heading .v-btn {
    margin-top: 14px;
    width: 100%;
  }
}
</style>
