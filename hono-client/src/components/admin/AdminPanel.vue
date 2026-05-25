<template>
  <div style="padding: 4px;">
    <div v-if="!isAdmin" style="padding:20px; text-align:center; color:#666;">
      You do not have admin access.
    </div>
    <div v-else>
      <!-- eployee table -->
      <div style="display:flex; gap: 6px; margin-bottom: 8px;">
        <button @click="loadAll" style="min-width:auto; padding:0 8px;">↺ Refresh</button>
        <span style="font-size:10px; align-self:center; color:#666;">Click a row to select, then use actions below.</span>
      </div>

      <div class="sunken-panel" style="max-height:220px; overflow-y:auto; margin-bottom: 8px;">
        <table class="interactive" style="width:100%;">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Department</th>
              <th>Roles</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="emp in employees"
              :key="emp.id"
              :class="{ highlighted: selected?.id === emp.id }"
              @click="select(emp)"
            >
              <td>{{ emp.id }}</td>
              <td>{{ emp.first_name }} {{ emp.last_name }}</td>
              <td>{{ emp.email }}</td>
              <td>{{ emp.status || 'offline' }}</td>
              <td>{{ emp.department || '-' }}</td>
              <td>{{ emp.roles?.join(', ') || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Edit panel -->
        <fieldset>
          <legend>Edit: {{ selected.first_name }} {{ selected.last_name }}</legend>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
            <div class="field-row-stacked">
              <label>First Name</label>
              <input type="text" v-model="editForm.first_name" />
            </div>
            <div class="field-row-stacked">
              <label>Last Name</label>
              <input type="text" v-model="editForm.last_name" />
            </div>
            <div class="field-row-stacked">
              <label>Email</label>
              <input type="text" v-model="editForm.email" />
            </div>
            <div class="field-row-stacked">
              <label>Department</label>
              <select v-model="editForm.department_id">
                <option :value="null">— None —</option>
                <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 8px;">
            <b style="font-size:11px;">Roles:</b>
            <div style="display: flex; flex-wrap:wrap; gap: 6px; margin-top: 4px;">
              <div v-for="role in allRoles" :key="role.id" class="field-row">
                <input
                  type="checkbox"
                  :id="'role-' + role.id"
                  :checked="editForm.role_ids.includes(role.id)"
                  @change="toggleRole(role.id)"
                />
                <label :for="'role-' + role.id">{{ role.name }}</label>
              </div>
            </div>
          </div>

          <div class="field-row" style="gap:6px; flex-wrap:wrap;">
            <button class="default" @click="saveEmployee" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
            <button @click="forceLogout(selected.id)">Force Log Out</button>
            <button @click="deleteEmployee(selected.id)" style="color: #c00;">Delete Account</button>
          </div>
          <span v-if="saveMsg" style="font-size:10px; color:green; margin-top:4px; display:block;">{{ saveMsg }}</span>
        </fieldset>

      <!-- audit log -->
      <div v-if="selected">
        <h4 style="margin-bottom:6px;">Audit Log --- {{ selected.first_name }} {{ selected.last_name }}</h4>
        <div class="sunken-panel" style="max-height:160px; overflow-y:auto;">
          <table style="width:100%;">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Method</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in auditLogs" :key="log.id">
                <td style="white-space:nowrap;">{{ formatDate(log.created_at) }}</td>
                <td>{{ log.action }}</td>
                <td>{{ log.method }}</td>
                <td>{{ log.ip_address }}</td>
              </tr>
              <tr v-if="auditLogs.length === 0">
                <td colspan="4" style="text-align:center; color:#666; padding:8px;">No logs found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../../js/api.js'
import { currentUser } from '../../js/user.js'

const isAdmin = computed(() => currentUser.value?.roles?.includes('admin'))

const employees = ref([])
const departments = ref([])
const allRoles = ref([])
const selected = ref(null)
const auditLogs = ref([])
const saving = ref(false)
const saveMsg = ref('')

const editForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  department_id: null,
  role_ids: [],
})

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString()
}

function select(emp) {
  selected.value = emp
  editForm.value = {
    first_name: emp.first_name,
    last_name: emp.last_name,
    email: emp.email,
    department_id: emp.department_id || null,
    role_ids: [...(emp.role_ids || [])],
  }
  loadLogs(emp.id)
}

function toggleRole(roleId) {
  const idx = editForm.value.role_ids.indexOf(roleId)
  if (idx >= 0) editForm.value.role_ids.splice(idx, 1)
  else editForm.value.role_ids.push(roleId)
}

async function loadAll() {
  try {
    employees.value = await api('/employees/admin/all')
    if (selected.value) {
      const refreshed = employees.value.find(e => e.id === selected.value.id)
      if (refreshed) select(refreshed)
    }
  } catch {}
}

async function loadDepsRoles() {
  try {
    departments.value = await api('/employees/departments')
    allRoles.value = await api('/employees/roles')
  } catch {}
}

async function loadLogs(id) {
  try {
    auditLogs.value = await api(`/employees/admin/${id}/logs`)
  } catch {
    auditLogs.value = []
  }
}

async function saveEmployee() {
  saving.value = true
  saveMsg.value = ''
  try {
    await api(`/employees/admin/${selected.value.id}`, {
      method: 'PATCH',
      body: JSON.stringify(editForm.value),
    })
    saveMsg.value = '✔ Saved!'
    setTimeout(() => { saveMsg.value = '' }, 2000)
    await loadAll()
  } catch (err) {
    saveMsg.value = '✗ Error: ' + err.message
  }
  saving.value = false
}

async function forceLogout(id) {
  await api(`/employees/admin/${id}/logout`, { method: 'POST' }).catch(() => {})
  await loadAll()
}

async function deleteEmployee(id) {
  if (!confirm('Permanently delete this employee and all their data?')) return
  try {
    await api(`/employees/admin/${id}`, { method: 'DELETE' })
    selected.value = null
    await loadAll()
  } catch (err) {
    alert('Delete failed: ' + err.message)
  }
}

onMounted(async () => {
  await loadDepsRoles()
  if (isAdmin.value) await loadAll()
})
</script>