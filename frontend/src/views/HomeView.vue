<script setup>
const metrics = [
  {
    label: 'Nhân viên',
    value: '128',
    change: '+6 trong tháng này',
    icon: 'mdi-account-group-outline',
    color: '#0f766e',
  },
  {
    label: 'Đúng giờ',
    value: '92%',
    change: '+4% so với hôm qua',
    icon: 'mdi-clock-check-outline',
    color: '#2563eb',
  },
  {
    label: 'Đi muộn',
    value: '11',
    change: '-3 ca trong ngày',
    icon: 'mdi-timer-alert-outline',
    color: '#b45309',
  },
  {
    label: 'Chờ duyệt',
    value: '7',
    change: 'Đơn nghỉ phép mới',
    icon: 'mdi-file-document-alert-outline',
    color: '#7c3aed',
  },
]

const attendanceRows = [
  { name: 'Nguyễn Văn An', department: 'Kế toán', time: '08:01', status: 'Đúng giờ' },
  { name: 'Trần Minh Châu', department: 'Nhân sự', time: '08:18', status: 'Đi muộn' },
  { name: 'Lê Hoàng Nam', department: 'Kỹ thuật', time: '07:54', status: 'Đúng giờ' },
  { name: 'Phạm Thu Hà', department: 'Vận hành', time: '08:05', status: 'Đúng giờ' },
]

const schedules = [
  'Duyệt bảng công phòng Kỹ thuật',
  'Kiểm tra ca đêm hôm qua',
  'Gửi báo cáo tổng hợp tuần',
]
</script>

<template>
  <div class="home-page">
    <div class="page-heading">
    <div>
      <p class="eyebrow">Tổng quan</p>
      <h1>Tổng quan quản trị</h1>
      <p class="heading-copy">Theo dõi tình hình chấm công và các việc cần xử lý trong ngày.</p>
    </div>

    <v-btn color="primary" prepend-icon="mdi-download-outline">
      Xuất báo cáo
    </v-btn>
  </div>

  <v-row>
    <v-col
      v-for="metric in metrics"
      :key="metric.label"
      cols="12"
      lg="3"
      sm="6"
    >
      <v-card border class="metric-card" elevation="0">
        <div class="metric-icon" :style="{ color: metric.color }">
          <v-icon :icon="metric.icon" size="26" />
        </div>
        <div>
          <p>{{ metric.label }}</p>
          <strong>{{ metric.value }}</strong>
          <span>{{ metric.change }}</span>
        </div>
      </v-card>
    </v-col>

    <v-col cols="12" lg="8">
      <v-card border elevation="0">
        <v-card-title class="card-title">Chấm công hôm nay</v-card-title>
        <v-table>
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Phòng ban</th>
              <th>Giờ vào</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in attendanceRows" :key="row.name">
              <td>{{ row.name }}</td>
              <td>{{ row.department }}</td>
              <td>{{ row.time }}</td>
              <td>
                <v-chip
                  :color="row.status === 'Đúng giờ' ? 'success' : 'warning'"
                  size="small"
                  variant="tonal"
                >
                  {{ row.status }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card border class="h-100" elevation="0">
        <v-card-title class="card-title">Việc cần làm</v-card-title>
        <v-list density="compact">
          <v-list-item
            v-for="schedule in schedules"
            :key="schedule"
            prepend-icon="mdi-checkbox-marked-circle-outline"
            :title="schedule"
          />
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

.metric-card {
  align-items: center;
  display: flex;
  gap: 14px;
  min-height: 128px;
  padding: 18px;
}

.metric-icon {
  align-items: center;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  height: 46px;
  justify-content: center;
  width: 46px;
}

.metric-card p,
.metric-card span {
  color: #667085;
  margin: 0;
}

.metric-card strong {
  color: #172033;
  display: block;
  font-size: 1.7rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 2px 0;
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
