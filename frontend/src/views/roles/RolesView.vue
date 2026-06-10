<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { permissionsApi } from '@/api/permissions'
import { rolesApi } from '@/api/roles'

const roles = ref([])
const permissions = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const formDialog = ref(false)
const deleteDialog = ref(false)
const editingRole = ref(null)
const deletingRole = ref(null)
const formError = ref('')

const form = reactive({
  name: '',
  permissions: [],
})

const snackbar = reactive({
  show: false,
  color: 'success',
  message: '',
})

const normalizeCollection = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  return []
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

const getPermissionNames = (role) => {
  if (!Array.isArray(role?.permissions)) {
    return []
  }

  return role.permissions.map((permission) => permission.name || permission).filter(Boolean)
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

const normalizedRoleName = computed(() => form.name.trim())

const permissionItems = computed(() => {
  return [...permissions.value]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((permission) => ({
      title: permission.name,
      value: permission.name,
    }))
})

const filteredRoles = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  if (!keyword) {
    return roles.value
  }

  return roles.value.filter((role) => {
    const permissionNames = getPermissionNames(role).join(' ').toLowerCase()

    return role.name.toLowerCase().includes(keyword) || permissionNames.includes(keyword)
  })
})

const totalRolePages = computed(() => Math.max(1, Math.ceil(filteredRoles.value.length / itemsPerPage)))

const paginatedRoles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage

  return filteredRoles.value.slice(start, start + itemsPerPage)
})

const roleRangeStart = computed(() => {
  if (filteredRoles.value.length === 0) {
    return 0
  }

  return (currentPage.value - 1) * itemsPerPage + 1
})

const roleRangeEnd = computed(() => Math.min(currentPage.value * itemsPerPage, filteredRoles.value.length))

watch(search, () => {
  currentPage.value = 1
})

watch(totalRolePages, (totalPages) => {
  if (currentPage.value > totalPages) {
    currentPage.value = totalPages
  }
})

const roleNameRules = computed(() => [
  (value) => Boolean(value?.trim()) || 'Vui lòng nhập tên role.',
  (value) => value?.trim().length <= 255 || 'Tên role không được quá 255 ký tự.',
])

const isDuplicateName = computed(() => {
  return roles.value.some((role) => {
    const sameName = role.name.toLowerCase() === normalizedRoleName.value.toLowerCase()
    const sameRecord = editingRole.value?.id === role.id

    return sameName && !sameRecord
  })
})

const isProtectedRole = (role) => role?.name === 'Admin'

const resetForm = () => {
  form.name = ''
  form.permissions = []
  formError.value = ''
  editingRole.value = null
}

const loadRoles = async () => {
  const data = await rolesApi.list()
  roles.value = normalizeCollection(data)
}

const loadPermissions = async () => {
  const data = await permissionsApi.list()
  permissions.value = normalizeCollection(data)
}

const reloadRoles = async () => {
  try {
    await loadRoles()
  } catch (error) {
    showMessage(getErrorMessage(error, 'Không thể tải lại danh sách roles.'), 'error')
  }
}

const loadData = async () => {
  loading.value = true

  try {
    await Promise.all([
      loadRoles(),
      loadPermissions(),
    ])
  } catch (error) {
    showMessage(getErrorMessage(error, 'Không thể tải dữ liệu roles.'), 'error')
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  resetForm()
  formDialog.value = true
}

const openEditDialog = (role) => {
  editingRole.value = role
  form.name = role.name
  form.permissions = getPermissionNames(role)
  formError.value = ''
  formDialog.value = true
}

const closeFormDialog = () => {
  formDialog.value = false
  resetForm()
}

const saveRole = async () => {
  formError.value = ''

  const invalidRule = roleNameRules.value
    .map((rule) => rule(normalizedRoleName.value))
    .find((result) => result !== true)

  if (invalidRule) {
    formError.value = invalidRule
    return
  }

  if (isDuplicateName.value) {
    formError.value = 'Role này đã tồn tại.'
    return
  }

  saving.value = true

  try {
    const payload = {
      name: normalizedRoleName.value,
      permissions: form.permissions,
    }

    if (editingRole.value) {
      await rolesApi.update(editingRole.value.id, payload)
      showMessage('Cập nhật role thành công.')
    } else {
      await rolesApi.create(payload)
      showMessage('Thêm role thành công.')
    }

    closeFormDialog()
    await reloadRoles()
  } catch (error) {
    formError.value = getErrorMessage(error, 'Không thể lưu role.')
  } finally {
    saving.value = false
  }
}

const openDeleteDialog = (role) => {
  if (isProtectedRole(role)) {
    showMessage('Không thể xóa role Admin.', 'error')
    return
  }

  deletingRole.value = role
  deleteDialog.value = true
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
  deletingRole.value = null
}

const deleteRole = async () => {
  if (!deletingRole.value) {
    return
  }

  deleting.value = true

  try {
    await rolesApi.remove(deletingRole.value.id)
    showMessage('Xóa role thành công.')
    closeDeleteDialog()
    await reloadRoles()
  } catch (error) {
    showMessage(getErrorMessage(error, 'Không thể xóa role.'), 'error')
  } finally {
    deleting.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="roles-page">
    <div class="page-heading">
    <div>
      <p class="eyebrow">Phân quyền</p>
      <h1>Roles</h1>
      <p class="heading-copy">Quản lý nhóm quyền và các permission được gán cho từng role.</p>
    </div>

    <v-btn color="primary" prepend-icon="mdi-account-key-outline" @click="openCreateDialog">
      Thêm role
    </v-btn>
  </div>

  <v-card border elevation="0">
    <div class="role-toolbar">
      <v-text-field
        v-model="search"
        clearable
        density="comfortable"
        hide-details
        label="Tìm kiếm"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
      />
    </div>

    <div class="table-wrap">
      <v-table class="role-table">
        <thead>
          <tr>
            <th>Tên role</th>
            <th>Permissions</th>
            <th>Số permission</th>
            <th>Ngày tạo</th>
            <th class="actions-column">Tác vụ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5">
              <div class="table-state">
                <v-progress-circular color="primary" indeterminate size="24" />
                <span>Đang tải roles...</span>
              </div>
            </td>
          </tr>

          <tr v-else-if="filteredRoles.length === 0">
            <td colspan="5">
              <div class="table-state">Không có role phù hợp.</div>
            </td>
          </tr>

          <template v-else>
            <tr v-for="role in paginatedRoles" :key="role.id">
              <td>
                <div class="role-name">
                  <span>{{ role.name }}</span>
                  <v-chip v-if="isProtectedRole(role)" color="primary" size="x-small" variant="tonal">
                    Mặc định
                  </v-chip>
                </div>
              </td>
              <td>
                <div v-if="getPermissionNames(role).length > 0" class="permission-chips">
                  <v-chip
                    v-for="permissionName in getPermissionNames(role).slice(0, 4)"
                    :key="permissionName"
                    size="small"
                    variant="tonal"
                  >
                    {{ permissionName }}
                  </v-chip>
                  <v-chip
                    v-if="getPermissionNames(role).length > 4"
                    size="small"
                    variant="outlined"
                  >
                    +{{ getPermissionNames(role).length - 4 }}
                  </v-chip>
                </div>
                <span v-else class="muted-text">Chưa gán permission</span>
              </td>
              <td>{{ getPermissionNames(role).length }}</td>
              <td>{{ formatDate(role.created_at) }}</td>
              <td>
                <div class="row-actions">
                  <v-tooltip text="Sửa role">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        aria-label="Sửa role"
                        icon="mdi-pencil-outline"
                        size="small"
                        variant="text"
                        @click="openEditDialog(role)"
                      />
                    </template>
                  </v-tooltip>

                  <v-tooltip :text="isProtectedRole(role) ? 'Không thể xóa role Admin' : 'Xóa role'">
                    <template #activator="{ props }">
                      <span v-bind="props">
                        <v-btn
                          aria-label="Xóa role"
                          color="error"
                          :disabled="isProtectedRole(role)"
                          icon="mdi-delete-outline"
                          size="small"
                          variant="text"
                          @click="openDeleteDialog(role)"
                        />
                      </span>
                    </template>
                  </v-tooltip>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </v-table>
    </div>

    <div v-if="filteredRoles.length > 0" class="pagination-bar">
      <span>Hiển thị {{ roleRangeStart }}-{{ roleRangeEnd }} / {{ filteredRoles.length }}</span>
      <v-pagination
        v-model="currentPage"
        :length="totalRolePages"
        :total-visible="5"
        density="comfortable"
      />
    </div>
  </v-card>

  <v-dialog v-model="formDialog" max-width="680">
    <v-card>
      <v-card-title class="dialog-title">
        {{ editingRole ? 'Sửa role' : 'Thêm role' }}
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
          label="Tên role"
          placeholder="Manager"
          :rules="roleNameRules"
          variant="outlined"
        />

        <v-autocomplete
          v-model="form.permissions"
          chips
          clearable
          closable-chips
          density="comfortable"
          item-title="title"
          item-value="value"
          :items="permissionItems"
          label="Permissions"
          multiple
          no-data-text="Chưa có permission"
          prepend-inner-icon="mdi-shield-key-outline"
          variant="outlined"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="closeFormDialog">Hủy</v-btn>
        <v-btn
          color="primary"
          :loading="saving"
          prepend-icon="mdi-content-save-outline"
          @click="saveRole"
        >
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog" max-width="460">
    <v-card>
      <v-card-title class="dialog-title">Xóa role</v-card-title>
      <v-card-text>
        Bạn có chắc muốn xóa
        <strong>{{ deletingRole?.name }}</strong>
        ?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="closeDeleteDialog">Hủy</v-btn>
        <v-btn
          color="error"
          :loading="deleting"
          prepend-icon="mdi-delete-outline"
          @click="deleteRole"
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

.role-toolbar {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(240px, 420px);
  padding: 16px;
}

.table-wrap {
  overflow-x: auto;
}

.role-table {
  min-width: 900px;
}

.role-name {
  align-items: center;
  color: #172033;
  display: flex;
  font-weight: 700;
  gap: 8px;
}

.permission-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 520px;
}

.muted-text {
  color: #667085;
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

  .role-toolbar {
    grid-template-columns: 1fr;
  }

  .pagination-bar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
