<template>
  <v-footer app border class="admin-footer-ad" height="72">
    <div class="ad-content">
      <v-icon icon="mdi-bullhorn-outline" size="22" />
      <div>
        <div class="ad-title">Khu vực quảng cáo</div>
        <div class="ad-copy">Hiển thị thông báo, banner quảng cáo hoặc gói nâng cấp.</div>
      </div>
    </div>
  </v-footer>
</template>

<style scoped>
.admin-footer-ad {
  background: #ffffff;
  color: #172033;
}

.ad-content {
  align-items: center;
  display: flex;
  gap: 12px;
  margin: 0 auto;
  max-width: 1440px;
  width: 100%;
}

.ad-title {
  font-size: 0.9rem;
  font-weight: 700;
}

.ad-copy {
  color: #667085;
  font-size: 0.8125rem;
}

@media (max-width: 600px) {
  .ad-content {
    align-items: flex-start;
  }
}
</style>
