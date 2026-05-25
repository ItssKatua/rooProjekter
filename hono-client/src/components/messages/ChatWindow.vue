<template>
  <div style="display:flex; flex-direction:column; height:380px; min-width:300px;">
    <!-- Messages area -->
    <div
      ref="msgContainer"
      class="status-field-border"
      style="flex:1; overflow-y:auto; padding:6px; font-size:11px; font-family: monospace; background:#fff;"
    >
      <div v-if="messages.length === 0" style="color:#888; text-align:center; padding-top:20px;">
        No messages yet.
      </div>
      <div
        v-for="(msg, i) in messages"
        :key="i"
        style="margin-bottom:3px; word-break: break-word;"
      >
        <span style="color:#555;">[{{ formatTime(msg.created_at) }}]</span>
        <b :style="{ color: msg.sender_id === currentUser?.id ? '#000080' : '#800000' }">
          {{ msg.sender_name || msg.first_name + ' ' + msg.last_name }}:
        </b>
        {{ msg.content }}
      </div>
    </div>

    <!-- Input area -->
    <div style="display:flex; gap:4px; padding:6px 0 0;">
      <input
        ref="inputRef"
        type="text"
        v-model="draft"
        @keydown.enter="send"
        style="flex:1;"
        placeholder="Type a message..."
        :disabled="!connected"
      />
      <button @click="send" :disabled="!draft.trim() || !connected" style="min-width:auto; padding:0 10px;">
        Send
      </button>
    </div>
    <div v-if="!connected" style="font-size:10px; color:#c00; text-align:center; padding-top:4px;">
      Connecting...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { api, getToken } from '../../js/api.js'
import { currentUser } from '../../js/user.js'

const props = defineProps({
  roomId: { type: Number, required: true },
  otherUser: { type: Object, required: true },
})

const messages = ref([])
const draft = ref('')
const connected = ref(false)
const msgContainer = ref(null)
const inputRef = ref(null)
let ws = null

function formatTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function loadHistory() {
  try {
    const hist = await api(`/dm/${props.roomId}/messages`)
    messages.value = hist
    await scrollBottom()
  } catch {}
}

async function scrollBottom() {
  await nextTick()
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  }
}

function connectWS() {
  const token = getToken()
  const wsUrl = `ws://localhost:3000/dm/${props.roomId}/ws?token=${encodeURIComponent(token)}`
  // Note: WS auth via query param since headers aren't supported in browser WS
  ws = new WebSocket(wsUrl)

  ws.onopen = () => { connected.value = true }
  ws.onclose = () => {
    connected.value = false
    // try to reconnect after 3s
    setTimeout(connectWS, 3000)
  }
  ws.onerror = () => { connected.value = false }
  ws.onmessage = async (e) => {
    const data = JSON.parse(e.data)
    if (data.type === 'message') {
      messages.value.push(data)
      await scrollBottom()
    }
  }
}

async function send() {
  const content = draft.value.trim()
  if (!content) return
  draft.value = ''

  try {
    // send via HTTP (more reliable than WS send for delivery confirmation)
    await api(`/dm/${props.roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
    // message will arrive via WS broadcast
  } catch {
    draft.value = content // restore on error
  }
}

onMounted(async () => {
  await loadHistory()
  connectWS()
  await nextTick()
  inputRef.value?.focus()
})

onUnmounted(() => {
  if (ws) {
    ws.onclose = null // prevent reconnect
    ws.close()
  }
})
</script>