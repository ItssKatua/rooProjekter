<template>
    <div>
        <HomeTab v-if="activePage === 'home'" />
        <AnnounceContent v-else-if="activePage === 'announce'" />
        <MessagesList v-else-if="activePage === 'dm'" @open-chat="$emit('open-chat', $event)"/>
        <AdminPanel v-else-if="activePage === 'admin'" />
    </div>

    <div class="status-bar">
        <p class="status-bar-field">
            {{ statusIcon }} {{ currentUser?.first_name }} {{ currentUser?.last_name }}
        </p>
        <p class="status-bar-field">{{ currentUser?.department || 'No Dept.' }}</p>
        <p class="status-bar-field">{{ currentUser?.roles?.join(', ') || '' }}</p>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { currentUser } from '../js/user.js'
 
import HomeTab        from './misc/home.vue'
import AnnounceContent from './announcements/announceContent.vue'
import MessagesList   from './messages/MessagesList.vue'
import AdminPanel     from './admin/AdminPanel.vue'
 
defineProps({ activePage: { type: String, default: 'home' } })
defineEmits(['open-chat'])
 
const statusIcon = computed(() => {
  const s = currentUser.value?.status
  return { online: '🟢', busy: '🔴', away: '🟡', invisible: '⚫' }[s] || '⚫'
})
</script>