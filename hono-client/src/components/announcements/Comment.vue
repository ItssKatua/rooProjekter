<template>
  <div
    :style="{
      marginLeft: depth > 0 ? '16px' : '0',
      borderLeft: depth > 0 ? '2px solid #c0c0c0' : 'none',
      paddingLeft: depth > 0 ? '6px' : '0',
      position: 'relative',
    }"
  >

    <!-- Comment card -->
    <div class="status-field-border" style="margin: 4px 0 2px; background:#fff;">
      <!-- header -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding:3px 6px; background:silver; border-bottom:1px solid #c0c0c0;">
        <span style="font-size:10px; font-weight:bold;">
          {{ comment.first_name }} {{ comment.last_name }}
          <span style="font-weight:normal; color:#666;"> · {{ formatDate(comment.created_at) }}</span>
        </span>
        <div style="display:flex; gap:3px; align-items:center;">
          <button
            v-if="depth < 2"
            @click.stop="toggleReply"
            style="min-width:auto; padding:0 5px; height:16px; font-size:9px;"
            title="Reply"
          >↩</button>
          <button
            v-if="canDelete"
            @click.stop="$emit('delete-comment', comment.id)"
            style="min-width:auto; padding:0 5px; height:16px; font-size:9px; color:#c00;"
            title="Delete"
          >✕</button>
        </div>
      </div>

      <!-- content -->
      <div style="padding:4px 6px;  word-break:break-word; ">{{ comment.content }}</div>

      <!-- inline reply box -->
      <div v-if="showReply && depth < 2" style="padding:4px 6px; border-top:1px solid #dfdfdf; display:flex; gap:4px;">
        <input
          type="text"
          v-model="replyText"
          @keydown.enter="submitReply"
          placeholder="Write a reply..."
          style="flex:1;"
          ref="replyInput"
        />
        <button
          @click="submitReply"
          :disabled="!replyText.trim() || submitting"
          style="min-width:auto; padding:0 6px; font-size:10px;"
        >Send</button>
        <button
          @click="showReply = false"
          style="min-width:auto; padding:0 5px; font-size:10px;"
        >✕</button>
      </div>
    </div>

    <!-- child comments recursively, max depth index = 2 -->
    <template v-if="depth < 2">
      <Comment
        v-for="child in childComments"
        :key="child.id"
        :comment="child"
        :allComments="allComments"
        :depth="depth + 1"
        :postId="postId"
        :currentUser="currentUser"
        :isAdmin="isAdmin"
        :canManage="canManage"
        @delete-comment="(id) => $emit('delete-comment', id)"
        @react-comment="(id) => $emit('react-comment', id)"
        @reload="$emit('reload')"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { api } from '../../js/api.js'

const props = defineProps({
  comment: { type: Object, required: true },
  allComments: { type: Array, default: () => [] },
  depth: { type: Number, default: 0 },
  postId: { type: [Number, String], required: true },
  currentUser: { type: Object, default: null },
  isAdmin: { type: Boolean, default: false },
  canManage: { type: Boolean, default: false },
})

const emit = defineEmits(['delete-comment', 'react-comment', 'reload'])

const showReply = ref(false)
const replyText = ref('')
const replyInput = ref(null)
const submitting = ref(false)

const childComments = computed(() =>
  props.allComments.filter(c => c.parent_comment_id === props.comment.id)
)

const canDelete = computed(() =>
  props.isAdmin ||
  props.canManage ||
  props.currentUser?.id === props.comment.author_id
)

function formatDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function toggleReply() {
  showReply.value = !showReply.value
  if (showReply.value) {
    await nextTick()
    replyInput.value?.focus()
  }
}

async function submitReply() {
  const content = replyText.value.trim()
  if (!content || submitting.value) return
  submitting.value = true
  try {
    await api(`/posts/${props.postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: props.comment.id }),
    })
    replyText.value = ''
    showReply.value = false
    emit('reload')
  } catch (err) {
    console.error(err)
  } finally {
    submitting.value = false
  }
}
</script>