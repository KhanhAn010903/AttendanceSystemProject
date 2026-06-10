<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { rolesApi } from '@/api/roles'
import { usersApi } from '@/api/users'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const users = ref([])
const roles = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const formDialog = ref(false)
const deleteDialog = ref(false)
const editingUser = ref(null)
const deletingUser = ref(null)
const formError = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  role_id: null,
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

const getRoleName = (user) => user?.role?.name || 'Chưa gán role'

const currentUserId = computed(() => authStore.user?.id)

const roleItems = computed(() => {
  return [...roles.value]
    .filter((role) => role.name !== 'Admin')
    .sort((a, b) => a.name.localeCompare(b.name))
})

const getAssignableRoleId = (roleId = null) => {
  if (roleItems.value.some((role) => role.id === roleId)) {
    return roleId
  }

  return roleItems.value[0]?.id ?? null
}

const filteredUsers = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  if (!keyword) {
    return users.value
  }

  return users.value.filter((user) => {
    return (
      user.name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      getRoleName(user).toLowerCase().includes(keyword)
    )
  })
})

const totalUserPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / itemsPerPage)))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage

  return filteredUsers.value.slice(start, start + itemsPerPage)
})

const userRangeStart = computed(() => {
  if (filteredUsers.value.length === 0) {
    return 0
  }

  return (currentPage.value - 1) * itemsPerPage + 1
})

const userRangeEnd = computed(() => Math.min(currentPage.value * itemsPerPage, filteredUsers.value.length))

const isEditing = computed(() => Boolean(editingUser.value))

const userNameRules = computed(() => [
  (value) => Boolean(value?.trim()) || 'Vui lòng nhập tên nhân viên.',
  (value) => value?.trim().length <= 255 || 'Tên không được quá 255 ký tự.',
])

const isDuplicateEmail = computed(() => {
  const email = form.email.trim().toLowerCase()

  return users.value.some((user) => {
    const sameEmail = user.email.toLowerCase() === email
    const sameRecord = editingUser.value?.id === user.id

    return sameEmail && !sameRecord
  })
})

const emailRules = computed(() => [
  (value) => Boolean(value?.trim()) || 'Vui lòng nhập email.',
  (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value?.trim() || '') || 'Email không hợp lệ.',
  () => !isDuplicateEmail.value || 'Email này đã tồn tại.',
])

const passwordRules = computed(() => [
  (value) => isEditing.value || Boolean(value) || 'Vui lòng nhập mật khẩu.',
  (value) => !value || value.length >= 6 || 'Mật khẩu phải có ít nhất 6 ký tự.',
])

const isCurrentUser = (user) => currentUserId.value === user?.id

watch(search, () => {
  currentPage.value = 1
})

watch(totalUserPages, (totalPages) => {
  if (currentPage.value > totalPages) {
    currentPage.value = totalPages
  }
})

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.password = ''
  form.role_id = getAssignableRoleId()
  formError.value = ''
  editingUser.value = null
}

const loadUsers = async () => {
  const data = await usersApi.list()
  users.value = normalizeCollection(data)
}

const loadRoles = async () => {
  const data = await rolesApi.list()
  roles.value = normalizeCollection(data)
}

const reloadUsers = async () => {
  try {
    await loadUsers()
  } catch (error) {
    showMessage(getErrorMessage(error, 'Không thể tải lại danh sách nhân viên.'), 'error')
  }
}

const loadData = async () => {
  loading.value = true

  try {
    await Promise.all([
      loadUsers(),
      loadRoles(),
    ])
  } catch (error) {
    showMessage(getErrorMessage(error, 'Không thể tải dữ liệu nhân viên.'), 'error')
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  resetForm()
  formDialog.value = true
}

const openEditDialog = (user) => {
  editingUser.value = user
  form.name = user.name
  form.email = user.email
  form.password = ''
  form.role_id = getAssignableRoleId(user.role?.id)
  formError.value = ''
  formDialog.value = true
}

const closeFormDialog = () => {
  formDialog.value = false
  resetForm()
}

const validateForm = () => {
  const fieldRules = [
    ...userNameRules.value.map((rule) => rule(form.name)),
    ...emailRules.value.map((rule) => rule(form.email)),
    ...passwordRules.value.map((rule) => rule(form.password)),
  ]

  const invalidRule = fieldRules.find((result) => result !== true)

  if (invalidRule) {
    return invalidRule
  }

  if (!form.role_id) {
    return 'Vui lòng chọn role cho nhân viên.'
  }

  return ''
}

const saveUser = async () => {
  formError.value = ''

  const validationError = validateForm()

  if (validationError) {
    formError.value = validationError
    return
  }

  saving.value = true

  try {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role_id: form.role_id,
    }

    if (form.password) {
      payload.password = form.password
    }

    if (editingUser.value) {
      await usersApi.update(editingUser.value.id, payload)
      showMessage('Cập nhật nhân viên thành công.')
    } else {
      await usersApi.create(payload)
      showMessage('Thêm nhân viên thành công.')
    }

    closeFormDialog()
    await reloadUsers()
  } catch (error) {
    formError.value = getErrorMessage(error, 'Không thể lưu nhân viên.')
  } finally {
    saving.value = false
  }
}

const openDeleteDialog = (user) => {
  if (isCurrentUser(user)) {
    showMessage('Không thể xóa tài khoản đang đăng nhập.', 'error')
    return
  }

  deletingUser.value = user
  deleteDialog.value = true
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
  deletingUser.value = null
}

const deleteUser = async () => {
  if (!deletingUser.value) {
    return
  }

  deleting.value = true

  try {
    await usersApi.remove(deletingUser.value.id)
    showMessage('Xóa nhân viên thành công.')
    closeDeleteDialog()
    await reloadUsers()
  } catch (error) {
    showMessage(getErrorMessage(error, 'Không thể xóa nhân viên.'), 'error')
  } finally {
    deleting.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="users-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">Nhân viên</p>
        <h1>Quản lý nhân viên</h1>
        <p class="heading-copy">Quản lý tài khoản đăng nhập và role của từng nhân viên.</p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-account-plus-outline" @click="openCreateDialog">
        Thêm nhân viên
      </v-btn>
    </div>

    <v-card border elevation="0">
      <div class="user-toolbar">
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
        <v-table class="user-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Email</th>
              <th>Role</th>
              <th>Ngày tạo</th>
              <th class="actions-column">Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5">
                <div class="table-state">
                  <v-progress-circular color="primary" indeterminate size="24" />
                  <span>Đang tải nhân viên...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="5">
                <div class="table-state">Không có nhân viên phù hợp.</div>
              </td>
            </tr>

            <template v-else>
              <tr v-for="user in paginatedUsers" :key="user.id">
                <td>
                  <div class="user-name">
                    <v-avatar color="primary" size="32">
                      <span>{{ user.name.slice(0, 1).toUpperCase() }}</span>
                    </v-avatar>
                    <span>{{ user.name }}</span>
                    <v-chip v-if="isCurrentUser(user)" color="primary" size="x-small" variant="tonal">
                      Bạn
                    </v-chip>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <v-chip v-if="user.role" size="small" variant="tonal">
                    {{ user.role.name }}
                  </v-chip>
                  <span v-else class="muted-text">Chưa gán role</span>
                </td>
                <td>{{ formatDate(user.created_at) }}</td>
                <td>
                  <div class="row-actions">
                    <v-tooltip text="Sửa nhân viên">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          aria-label="Sửa nhân viên"
                          icon="mdi-pencil-outline"
                          size="small"
                          variant="text"
                          @click="openEditDialog(user)"
                        />
                      </template>
                    </v-tooltip>

                    <v-tooltip :text="isCurrentUser(user) ? 'Không thể xóa tài khoản đang đăng nhập' : 'Xóa nhân viên'">
                      <template #activator="{ props }">
                        <span v-bind="props">
                          <v-btn
                            aria-label="Xóa nhân viên"
                            color="error"
                            :disabled="isCurrentUser(user)"
                            icon="mdi-delete-outline"
                            size="small"
                            variant="text"
                            @click="openDeleteDialog(user)"
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

      <div v-if="filteredUsers.length > 0" class="pagination-bar">
        <span>Hiển thị {{ userRangeStart }}-{{ userRangeEnd }} / {{ filteredUsers.length }}</span>
        <v-pagination
          v-model="currentPage"
          :length="totalUserPages"
          :total-visible="5"
          density="comfortable"
        />
      </div>
    </v-card>

    <v-dialog v-model="formDialog" max-width="640">
      <v-card>
        <v-card-title class="dialog-title">
          {{ editingUser ? 'Sửa nhân viên' : 'Thêm nhân viên' }}
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
            class="form-field"
            clearable
            density="comfortable"
            label="Tên nhân viên"
            :rules="userNameRules"
            variant="outlined"
          />

          <v-text-field
            v-model="form.email"
            autocomplete="off"
            class="form-field"
            clearable
            density="comfortable"
            label="Email"
            :rules="emailRules"
            type="email"
            validate-on="input"
            variant="outlined"
          />

          <v-text-field
            v-model="form.password"
            autocomplete="new-password"
            class="form-field"
            clearable
            density="comfortable"
            label="Mật khẩu"
            :placeholder="editingUser ? 'Bỏ trống nếu không đổi mật khẩu' : ''"
            :rules="passwordRules"
            type="password"
            variant="outlined"
          />

          <v-radio-group v-model="form.role_id" class="role-radio-group" label="Role">
            <v-radio
              v-for="role in roleItems"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </v-radio-group>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeFormDialog">Hủy</v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            prepend-icon="mdi-content-save-outline"
            @click="saveUser"
          >
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="460">
      <v-card>
        <v-card-title class="dialog-title">Xóa nhân viên</v-card-title>
        <v-card-text>
          Bạn có chắc muốn xóa
          <strong>{{ deletingUser?.name }}</strong>
          ?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDeleteDialog">Hủy</v-btn>
          <v-btn
            color="error"
            :loading="deleting"
            prepend-icon="mdi-delete-outline"
            @click="deleteUser"
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

.user-toolbar {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(240px, 420px);
  padding: 16px;
}

.table-wrap {
  overflow-x: auto;
}

.user-table {
  min-width: 860px;
}

.user-name {
  align-items: center;
  color: #172033;
  display: flex;
  font-weight: 700;
  gap: 10px;
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

.form-field {
  margin-bottom: 12px;
}

.form-field :deep(.v-input__details) {
  padding-top: 6px;
}

.role-radio-group {
  margin-top: 6px;
}

@media (max-width: 760px) {
  .page-heading {
    display: block;
  }

  .page-heading .v-btn {
    margin-top: 14px;
    width: 100%;
  }

  .user-toolbar {
    grid-template-columns: 1fr;
  }

  .pagination-bar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
