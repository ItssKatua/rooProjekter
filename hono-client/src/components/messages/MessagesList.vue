<template>
  <div>
    <p style="font-size:10px; color:#666;">
        Double-click to open chat
    </p>
    <div v-if="loading" style="padding:12px; color:#666; font-size:11px;">Loading...</div>

    <div class="sunken-panel" style="max-height:400px; overflow-y:auto;" v-else>
      <table class="interactive" style="width:100%;">
        <thead>
          <tr>
            <th style="min-width: 130px">Name</th>
            <th style="min-width: 50px">Status</th>
            <th style="min-width: 100px">Department</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="emp in employees"
            :key="emp.id"
            :class="{ highlighted: selectedEmp?.id === emp.id }"
            @click="selectEmp(emp)"
            @dblclick="openChat(emp)"
          >
            <td>{{ emp.first_name }} {{ emp.last_name }}</td>
            <td>{{ statusIcon(emp.status) }} {{ emp.status || 'offline' }}</td>
            <td>{{ emp.department || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="field-row" style="margin: 8px 0px; gap: 6px;">
      <button :disabled="!selectedEmp || selectedEmp.id === currentUser?.id" @click="openChat(selectedEmp)">
        Open Chat
      </button>
      <button @click="loadEmployees" style="min-width:auto; padding: 0 8px;">↺ Refresh</button>
    </div>

    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../../js/api.js'
import { currentUser } from '../../js/user.js'

const emit = defineEmits(['open-chat'])
const employees = ref([])
const loading = ref(true)
const selectedEmp = ref(null)

function statusIcon(s) {
  return { online: '🟢', busy: '🔴', away: '🟡', invisible: '⚫' }[s] || '⚫'
}

function selectEmp(emp) {
  selectedEmp.value = emp
}

async function openChat(emp) {
  if (!emp || emp.id === currentUser.value?.id) return
  try {
    
    const res = await api('/dm/room', {
      method: 'POST',
      body: JSON.stringify({ user_id: emp.id }),
    })
    emit('open-chat', { roomId: res.room_id, otherUser: emp })
  } catch {}
}

async function loadEmployees() {
  loading.value = true
  try {
    employees.value = await api('/employees')
  } catch {}
  loading.value = false
}

onMounted(loadEmployees)
</script>