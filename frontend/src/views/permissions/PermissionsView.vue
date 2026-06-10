<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { permissionsApi } from '@/api/permissions'

const permissions = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const moduleFilter = ref('all')
const actionFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = 10
const formDialog = ref(false)
const deleteDialog = ref(false)
const editingPermission = ref(null)
const deletingPermission = ref(null)
const formError = ref('')

const form = reactive({
  name: '',
})

const snackbar = reactive({
  show: false,
  color: 'success',
  message: '',
})

const actionLabels = {
  view: 'Xem',
  create: 'Thêm',
  update: 'Sửa',
  delete: 'Xóa',
}

const actionFilterItems = [
  { title: 'Tất cả thao tác', value: 'all' },
  ...Object.entries(actionLabels).map(([value, title]) => ({ title, value })),
]

const normalizePermissions = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  return []
}

const parsePermissionName = (name = '') => {
  const parts = name.split('.').filter(Boolean)

  if (parts.length < 2) {
    return {
      module: name,
      action: '',
    }
  }

  return {
    module: parts.slice(0, -1).join('.'),
    action: parts.at(-1),
  }
}

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

const showMessage = (message, color = 'success') => {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

const getErrorMessage = (error, fallback) => {
  const errors = error.response?.data?.errors
  const firstError = errors ? Object.values(errors).flat()[0] : null

  return firstError || error.response?.data?.message || fallback
}

const normalizedName = computed(() => form.name.trim().toLowerCase())

const moduleItems = computed(() => {
  const modules = new Set()

  permissions.value.forEach((permission) => {
    const { module } = parsePermissionName(permission.name)

    if (module) {
      modules.add(module)
    }
  })

  return [
    { title: 'Tất cả module', value: 'all' },
    ...Array.from(modules)
      .sort((a, b) => a.localeCompare(b))
      .map((module) => ({
        title: module,
        value: module,
      })),
  ]
})

const filteredPermissions = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return permissions.value.filter((permission) => {
    const { module, action } = parsePermissionName(permission.name)
    const matchesSearch = !keyword || permission.name.toLowerCase().includes(keyword)
    const matchesModule = moduleFilter.value === 'all' || module === moduleFilter.value
    const matchesAction = actionFilter.value === 'all' || action === actionFilter.value

    return matchesSearch && matchesModule && matchesAction
  })
})

const totalPermissionPages = computed(() =>
  Math.max(1, Math.ceil(filteredPermissions.value.length / itemsPerPage)),
)

const paginatedPermissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage

  return filteredPermissions.value.slice(start, start + itemsPerPage)
})

const permissionRangeStart = computed(() => {
  if (filteredPermissions.value.length === 0) {
    return 0
  }

  return (currentPage.value - 1) * itemsPerPage + 1
})

const permissionRangeEnd = computed(() =>
  Math.min(currentPage.value * itemsPerPage, filteredPermissions.value.length),
)

watch([search, moduleFilter, actionFilter], () => {
  currentPage.value = 1
})

watch(totalPermissionPages, (totalPages) => {
  if (currentPage.value > totalPages) {
    currentPage.value = totalPages
  }
})

const permissionNameRules = computed(() => [
  (value) => Boolean(value?.trim()) || 'Vui lòng nhập tên permission.',
  (value) =>
    /^[a-z][a-z0-9_-]*(\.[a-z][a-z0-9_-]*)+$/.test(value?.trim() || '') ||
    'Tên permission phải theo dạng module.action, ví dụ users.view.',
])

const isDuplicateName = computed(() => {
  return permissions.value.some((permission) => {
    const sameName = permission.name.toLowerCase() === normalizedName.value
    const sameRecord = editingPermission.value?.id === permission.id

    return sameName && !sameRecord
  })
})

const resetForm = () => {
  form.name = ''
  formError.value = ''
  editingPermission.value = null
}

const loadPermissions = async () => {
  loading.value = true

  try {
    const data = await permissionsApi.list()
    permissions.value = normalizePermissions(data)
  } catch (error) {
    showMessage(getErrorMessage(error, 'Không thể tải danh sách permissions.'), 'error')
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  resetForm()
  formDialog.value = true
}

const openEditDialog = (permission) => {
  editingPermission.value = permission
  form.name = permission.name
  formError.value = ''
  formDialog.value = true
}

const closeFormDialog = () => {
  formDialog.value = false
  resetForm()
}

const savePermission = async () => {
  formError.value = ''

  const invalidRule = permissionNameRules.value
    .map((rule) => rule(normalizedName.value))
    .find((result) => result !== true)

  if (invalidRule) {
    formError.value = invalidRule
    return
  }

  if (isDuplicateName.value) {
    formError.value = 'Permission này đã tồn tại.'
    return
  }

  saving.value = true

  try {
    const payload = {
      name: normalizedName.value,
    }

    if (editingPermission.value) {
      await permissionsApi.update(editingPermission.value.id, payload)
      showMessage('Cập nhật permission thành công.')
    } else {
      await permissionsApi.create(payload)
      showMessage('Thêm permission thành công.')
    }

    closeFormDialog()
    await loadPermissions()
  } catch (error) {
    formError.value = getErrorMessage(error, 'Không thể lưu permission.')
  } finally {
    saving.value = false
  }
}

const openDeleteDialog = (permission) => {
  deletingPermission.value = permission
  deleteDialog.value = true
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
  deletingPermission.value = null
}

const deletePermission = async () => {
  if (!deletingPermission.value) {
    return
  }

  deleting.value = true

  try {
    await permissionsApi.remove(deletingPermission.value.id)
    showMessage('Xóa permission thành công.')
    closeDeleteDialog()
    await loadPermissions()
  } catch (error) {
    showMessage(getErrorMessage(error, 'Không thể xóa permission.'), 'error')
  } finally {
    deleting.value = false
  }
}

onMounted(loadPermissions)
</script>

<template>
  <div class="permissions-page">
    <div class="page-heading">
    <div>
      <p class="eyebrow">Phân quyền</p>
      <h1>Permissions</h1>
      <p class="heading-copy">Quản lý các quyền thao tác được gán cho role trong hệ thống.</p>
    </div>

    <v-btn color="primary" prepend-icon="mdi-shield-plus-outline" @click="openCreateDialog">
      Thêm permission
    </v-btn>
  </div>

  <v-card border elevation="0">
    <div class="permission-toolbar">
      <v-text-field
        v-model="search"
        clearable
        density="comfortable"
        hide-details
        label="Tìm kiếm"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
      />

      <v-select
        v-model="moduleFilter"
        density="comfortable"
        hide-details
        :items="moduleItems"
        label="Module"
        variant="outlined"
      />

      <v-select
        v-model="actionFilter"
        density="comfortable"
        hide-details
        :items="actionFilterItems"
        label="Thao tác"
        variant="outlined"
      />
    </div>

    <div class="table-wrap">
      <v-table class="permission-table">
        <thead>
          <tr>
            <th>Tên permission</th>
            <th>Module</th>
            <th>Thao tác</th>
            <th>Ngày tạo</th>
            <th class="actions-column">Tác vụ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5">
              <div class="table-state">
                <v-progress-circular color="primary" indeterminate size="24" />
                <span>Đang tải permissions...</span>
              </div>
            </td>
          </tr>

          <tr v-else-if="filteredPermissions.length === 0">
            <td colspan="5">
              <div class="table-state">Không có permission phù hợp.</div>
            </td>
          </tr>

          <template v-else>
            <tr v-for="permission in paginatedPermissions" :key="permission.id">
              <td>
                <span class="permission-name">{{ permission.name }}</span>
              </td>
              <td>{{ parsePermissionName(permission.name).module || '-' }}</td>
              <td>
                <v-chip size="small" variant="tonal">
                  {{ actionLabels[parsePermissionName(permission.name).action] || parsePermissionName(permission.name).action || '-' }}
                </v-chip>
              </td>
              <td>{{ formatDate(permission.created_at) }}</td>
              <td>
                <div class="row-actions">
                  <v-tooltip text="Sửa permission">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        aria-label="Sửa permission"
                        icon="mdi-pencil-outline"
                        size="small"
                        variant="text"
                        @click="openEditDialog(permission)"
                      />
                    </template>
                  </v-tooltip>

                  <v-tooltip text="Xóa permission">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        aria-label="Xóa permission"
                        color="error"
                        icon="mdi-delete-outline"
                        size="small"
                        variant="text"
                        @click="openDeleteDialog(permission)"
                      />
                    </template>
                  </v-tooltip>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </v-table>
    </div>

    <div v-if="filteredPermissions.length > 0" class="pagination-bar">
      <span>Hiển thị {{ permissionRangeStart }}-{{ permissionRangeEnd }} / {{ filteredPermissions.length }}</span>
      <v-pagination
        v-model="currentPage"
        :length="totalPermissionPages"
        :total-visible="5"
        density="comfortable"
      />
    </div>
  </v-card>

  <v-dialog v-model="formDialog" max-width="520">
    <v-card>
      <v-card-title class="dialog-title">
        {{ editingPermission ? 'Sửa permission' : 'Thêm permission' }}
      </v-card-title>

      <v-card-text>
        <v-alert
          v-if="formError"
          class="mb-4"
          density="comfortable"
          type="error"
          variant="tonal"
        >
          {{ formError }}
        </v-alert>

        <v-text-field
          v-model="form.name"
          autofocus
          clearable
          density="comfortable"
          label="Tên permission"
          placeholder="users.view"
          :rules="permissionNameRules"
          variant="outlined"
          @keyup.enter="savePermission"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="closeFormDialog">Hủy</v-btn>
        <v-btn
          color="primary"
          :loading="saving"
          prepend-icon="mdi-content-save-outline"
          @click="savePermission"
        >
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog" max-width="460">
    <v-card>
      <v-card-title class="dialog-title">Xóa permission</v-card-title>
      <v-card-text>
        Bạn có chắc muốn xóa
        <strong>{{ deletingPermission?.name }}</strong>
        ?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="closeDeleteDialog">Hủy</v-btn>
        <v-btn
          color="error"
          :loading="deleting"
          prepend-icon="mdi-delete-outline"
          @click="deletePermission"
        >
          Xóa
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
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

.permission-toolbar {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(240px, 1fr) minmax(180px, 220px) minmax(180px, 220px);
  padding: 16px;
}

.table-wrap {
  overflow-x: auto;
}

.permission-table {
  min-width: 820px;
}

.permission-name {
  color: #172033;
  font-weight: 700;
}

.actions-column {
  text-align: right;
  width: 128px;
}

.row-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}

.table-state {
  align-items: center;
  color: #667085;
  display: flex;
  gap: 10px;
  justify-content: center;
  min-height: 120px;
}

.pagination-bar {
  align-items: center;
  border-top: 1px solid #eaecf0;
  color: #667085;
  display: flex;
  font-size: 0.875rem;
  gap: 12px;
  justify-content: space-between;
  padding: 12px 16px;
}

.dialog-title {
  color: #172033;
  font-size: 1rem;
  font-weight: 700;
  padding: 18px 24px 8px;
}

@media (max-width: 760px) {
  .page-heading {
    display: block;
  }

  .page-heading .v-btn {
    margin-top: 14px;
    width: 100%;
  }

  .permission-toolbar {
    grid-template-columns: 1fr;
  }

  .pagination-bar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
