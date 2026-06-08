<template>
  <div class="post-card status-field-border" style="margin-bottom: 6px;">
    <!-- Post header -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding: 4px 6px;  background: silver; border-bottom: 1px solid #808080;">
      <span style="font-weight:bold; font-size:11px;">
        {{ post.first_name }} {{ post.last_name }}
        <span v-if="postDepartment" style="font-weight:normal;"> - {{ postDepartment }}</span>
        <span v-if="post.pinned" style="margin-left:6px;" title="Pinned">📌</span>
      </span>
      <div style="display:flex; gap:4px; align-items:center;">
        <span style="font-size:10px;">{{ formatDate(post.created_at) }}</span>
        <!-- like -->
        <button
          @click.stop="$emit('react', post.id)"
          style="min-width:auto; padding:0 6px; height:18px; font-size:10px;"
          :style="post.user_reacted ? 'box-shadow: inset -1px -1px #fff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px grey;' : ''"
          title="Like"
        >👍 {{ post.reaction_count || 0 }}</button>
        <!-- pin toggle (admin/management only) -->
        <button
          v-if="canManage"
          @click.stop="$emit('toggle-pin', post)"
          style="min-width:auto; padding:0 5px; height:18px; font-size:10px;"
          :title="post.pinned ? 'Unpin' : 'Pin'"
        >{{ post.pinned ? '📌' : '📍' }}</button>
        <!-- delete (owner or admin/management) -->
        <button
          v-if="canDelete"
          @click.stop="$emit('delete', post.id)"
          style="min-width:auto; padding:0 5px; height:18px; font-size:10px; color:#c00;"
          title="Delete post"
        >❌</button>
      </div>
    </div>

    <!-- Post title + content — click to expand/collapse -->
    <div style="padding: 6px 8px; cursor:pointer;" @click="toggleExpand">
      <div style="font-weight:bold; font-size:12px; margin-bottom:4px;">{{ post.title }}</div>
      <div style="font-size:11px; white-space:pre-wrap; word-break:break-word; color:#111;">{{ post.content }}</div>
    </div>

    <!-- Comment count + expand toggle -->
    <div
      style="padding: 2px 8px 4px; font-size:10px; color:#555; cursor:pointer; display:flex; gap:8px; user-select:none;"
      @click="toggleExpand"
    >
      <span> {{ localCommentCount }} comment{{ localCommentCount !== 1 ? 's' : '' }}</span>
      <span style="color:navy;">{{ expanded ? '▲ hide' : '▼ show' }}</span>
    </div>

    <!-- Comments section -->
    <div v-if="expanded" style="border-top: 1px solid #dfdfdf;">
      <div v-if="loadingComments" style="padding:8px; font-size:11px; color:#666;">Loading...</div>
      <div v-else style="padding: 4px 8px;">
        <Comment
          v-for="c in topLevelComments"
          :key="c.id"
          :comment="c"
          :allComments="comments"
          :depth="0"
          :postId="post.id"
          :currentUser="currentUser"
          :isAdmin="isAdmin"
          :canManage="canManage"
          @delete-comment="(id) => handleDeleteComment(id)"
          @react-comment="(id) => $emit('react-comment', id)"
          @reload="loadComments"
        />
        <div v-if="topLevelComments.length === 0" style="padding:4px 0 8px; font-size:11px; color:#888; text-align:center;">
          No comments yet.
        </div>
      </div>

      <!-- Add top-level comment -->
      <div style="padding: 6px 8px; border-top: 1px solid #dfdfdf; display:flex; gap:4px;">
        <input
          type="text"
          v-model="newComment"
          @keydown.enter="submitComment"
          placeholder="Add a comment..."
          style="flex:1; font-size:11px;"
        />
        <button
          @click="submitComment"
          :disabled="!newComment.trim() || submittingComment"
          style="min-width:auto; padding:0 8px; font-size:11px;"
        >{{ submittingComment ? '...' : 'Reply' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Comment from './Comment.vue'
import { api } from '../../js/api.js'
import { useSSE } from '../../js/sse.js'

const props = defineProps({
  post: { type: Object, required: true },
  currentUser: { type: Object, default: null },
  isAdmin: { type: Boolean, default: false },
  canManage: { type: Boolean, default: false },
  employees: { type: Array, default: () => [] },
})

const emit = defineEmits(['react', 'delete', 'toggle-pin', 'react-comment', 'refresh'])

const expanded = ref(false)
const comments = ref([])
const loadingComments = ref(false)
const newComment = ref('')
const submittingComment = ref(false)
// track comment count locally so SSE can update it without a full reload
const localCommentCount = ref(props.post.comment_count || 0)

watch(() => props.post.comment_count, (v) => { localCommentCount.value = v ?? 0 })

const postDepartment = computed(() => props.post.department || null)

const canDelete = computed(() =>
  props.isAdmin ||
  props.canManage ||
  (props.currentUser && props.currentUser.id === props.post.author_id)
)

const topLevelComments = computed(() =>
  comments.value.filter(c => c.parent_comment_id === null || c.parent_comment_id === undefined)
)

function formatDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function toggleExpand() {
  expanded.value = !expanded.value
  if (expanded.value && comments.value.length === 0) {
    await loadComments()
  }
}

async function loadComments() {
  loadingComments.value = true
  try {
    comments.value = await api(`/posts/${props.post.id}/comments`)
  } catch {}
  loadingComments.value = false
}

async function submitComment() {
  const content = newComment.value.trim()
  if (!content || submittingComment.value) return
  submittingComment.value = true
  try {
    await api(`/posts/${props.post.id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: null }),
    })
    newComment.value = ''
    // DO NOT toggle expanded — SSE will push the new comment in
    // but if SSE isn't available yet, reload manually
    if (!expanded.value) {
      // comments section is closed, just let SSE update count
    }
  } catch (err) {
    console.error(err)
  } finally {
    submittingComment.value = false
  }
}

async function handleDeleteComment(commentId) {
  try {
    await api(`/posts/${props.post.id}/comments/${commentId}`, { method: 'DELETE' })
    // SSE will remove it; also update locally immediately
    comments.value = comments.value.filter(c => c.id !== commentId)
    localCommentCount.value = Math.max(0, localCommentCount.value - 1)
    emit('refresh')
  } catch (err) {
    console.error(err)
  }
}

// SSE: live comment updates for THIS post only
useSSE({
  'comment:created': (data) => {
    if (data.postId !== props.post.id) return
    localCommentCount.value++
    if (expanded.value) {
      // avoid duplicate if we somehow already have it
      if (!comments.value.find(c => c.id === data.comment.id)) {
        comments.value.push(data.comment)
      }
    }
  },
  'comment:deleted': (data) => {
    if (data.postId !== props.post.id) return
    localCommentCount.value = Math.max(0, localCommentCount.value - 1)
    if (expanded.value) {
      comments.value = comments.value.filter(c => c.id !== data.commentId)
    }
  },
})
</script>

<style scoped>
.post-card {
  background: #fff;
}
</style>