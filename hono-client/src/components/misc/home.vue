<template>
  <div style="padding: 4px;">
    <h4 style="margin-bottom: 12px;">
      Hello, <b>{{ user?.first_name }} {{ user?.last_name }}</b>
    </h4>

      <fieldset>
        <legend>My Status</legend>
          <select v-model="selectedStatus" @change="changeStatus" style="width: 100%">
            <option value="online">🟢 Online</option>
            <option value="busy">🔴 Busy</option>
            <option value="away">🟡 Away</option>
            <option value="invisible">⚫ Invisible</option>
          </select>
      </fieldset>
      <br>
      <fieldset>
        <legend>Profile</legend>
        <div class="field-row-stacked" style="margin-bottom: 6px;">
          <label for="home-fname">First Name</label>
          <input id="home-fname" type="text" v-model="editFirst" style="width: 100%;" :disabled="saving" />
        </div>
        <div class="field-row-stacked" style="margin-bottom: 10px;">
          <label for="home-lname">Last Name</label>
          <input id="home-lname" type="text" v-model="editLast" style="width: 100%;" :disabled="saving"/>
        </div>
        <div class="field-row">
          <button @click="saveName" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Profile' }}
          </button>
          <span v-if="saved" style="margin-left: 8px; color: green; font-size: 11px;">✔ Saved</span>
        </div>
      </fieldset>

    <div class="status-field-border" style="padding: 6px; font-size: 11px;">
      <b>Email:</b> {{ user?.email }}<br />
      <b>Department:</b> {{ user?.department || 'None' }}<br />
      <b>Roles:</b> {{ user?.roles?.join(', ') || 'None' }}<br />
      <b>Manager:</b> {{ user?.manager_name }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { api } from '../../js/api.js'
import { currentUser, updateStatus } from '../../js/user.js'

const user = currentUser
const selectedStatus = ref(user.value?.status || 'online')
const editFirst = ref(user.value?.first_name || '')
const editLast = ref(user.value?.last_name || '')
const saving = ref(false)
const saved = ref(false)

watch(user, (u) => {
  if (u) {
    selectedStatus.value = u.status || 'online'
    editFirst.value = u.first_name || ''
    editLast.value = u.last_name || ''
  }
})

async function changeStatus() {
  await updateStatus(selectedStatus.value).catch(() => {})
}

async function saveName() {
  saving.value = true
  saved.value = false
  try {
    await api('/employees/me', {
      method: 'PATCH',
      body: JSON.stringify({ first_name: editFirst.value, last_name: editLast.value }),
    })
    if (currentUser.value) {
      currentUser.value.first_name = editFirst.value
      currentUser.value.last_name = editLast.value
    }
    saved.value = true
    setTimeout(() => { saved.value = false }, 2000)
  } catch {}
  saving.value = false
}
</script>