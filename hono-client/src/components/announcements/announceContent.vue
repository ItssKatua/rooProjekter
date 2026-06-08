<template>
  <div style="padding: 4px; display:flex; flex-direction:column; gap:6px;">

    <!-- New post composer — visible only to management/admin -->
    <div v-if="canPost" class="status-field-border" style="padding: 6px;">
      <b>New Announcement</b>
      <div class="field-row-stacked" style="margin-bottom:4px;">
        <input
          type="text"
          v-model="newTitle"
          placeholder="Title . . ."
          style="width:100%; font-size:11px;"
          @keydown.enter="$refs.contentArea.focus()"
        />
      </div>
      <div style="display:flex; gap:4px; align-items:flex-start;">
        <textarea
          ref="contentArea"
          v-model="newContent"
          placeholder="Write text here..."
          style="flex:1; height:80px; padding:3px 4px; resize: none;"
        ></textarea>
        <div style="display:flex; flex-direction:column; gap:3px;">
          <button
            class="default"
            @click="submitPost"
            :disabled="!newTitle.trim() || !newContent.trim() || submitting"
            style="min-width:50px; height:28px; font-size:11px;"
          >{{ submitting ? '...' : 'Post' }}</button>
        </div>
      </div>
    </div>

    <!-- Post feed -->
    <div v-if="loading" style="padding:16px; text-align:center; font-size:11px;">
      Loading announcements...
    </div>
    <div v-else>
      <Post
        v-for="p in posts"
        :key="p.id"
        :post="p"
        :currentUser="currentUser"
        :isAdmin="isAdmin"
        :canManage="canPost"
        @react="handleReact"
        @delete="handleDelete"
        @toggle-pin="handleTogglePin"
        @react-comment="handleReactComment"
        @refresh="loadPosts"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import Post from './Post.vue'
import { api } from '../../js/api.js'
import { currentUser } from '../../js/user.js'

const openError = inject('openError', null)
const openErrorConfirm = inject('openErrorConfirm', null)

const posts = ref([])
const loading = ref(true)
const submitting = ref(false)
const newTitle = ref('')
const newContent = ref('')
const pinNew = ref(false)
const contentArea = ref(null)

const isAdmin = computed(() => currentUser.value?.roles?.includes('admin'))
const canPost = computed(() =>
  isAdmin.value ||
  currentUser.value?.roles?.includes('management')
)

async function loadPosts() {
  loading.value = true
  try {
    posts.value = await api('/posts')
  } catch (err) {
    openError?.('Failed to load posts: ' + err.message)
  } finally {
    loading.value = false
  }
}

async function submitPost() {
  if (!newTitle.value.trim() || !newContent.value.trim() || submitting.value) return
  submitting.value = true
  try {
    await api('/posts', {
      method: 'POST',
      body: JSON.stringify({
        title: newTitle.value.trim(),
        content: newContent.value.trim(),
        pinned: pinNew.value,
      }),
    })
    newTitle.value = ''
    newContent.value = ''
    pinNew.value = false
    await loadPosts()
  } catch (err) {
    openError?.('Failed to post: ' + err.message)
  } finally {
    submitting.value = false
  }
}

async function handleReact(postId) {
  try {
    await api(`/posts/${postId}/react`, {
      method: 'POST',
      body: JSON.stringify({ type: 'like' }),
    })
    // update locally for instant feedback
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      if (post.user_reacted) {
        post.reaction_count = Math.max(0, (post.reaction_count || 0) - 1)
        post.user_reacted = 0
      } else {
        post.reaction_count = (post.reaction_count || 0) + 1
        post.user_reacted = 1
      }
    }
  } catch (err) {
    openError?.('Failed to react: ' + err.message)
  }
}

async function handleDelete(postId) {
  const ok = await openErrorConfirm?.('Delete this announcement?')
  if (!ok) return
  try {
    await api(`/posts/${postId}`, { method: 'DELETE' })
    posts.value = posts.value.filter(p => p.id !== postId)
  } catch (err) {
    openError?.('Failed to delete: ' + err.message)
  }
}

async function handleTogglePin(post) {
  try {
    await api(`/posts/${post.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ pinned: !post.pinned }),
    })
    // optimistic update
    const p = posts.value.find(p => p.id === post.id)
    if (p) p.pinned = !post.pinned
    // re-sort (pinned posts should come first)
    posts.value.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
  } catch (err) {
    openError?.('Failed to toggle pin: ' + err.message)
  }
}

async function handleReactComment(commentId) {
  // Comment reactions aren't in the current backend schema but can be added later
  // For now just a no-op (the reactions table only links to post_id or comment_id)
  try {
    // Future: await api(`/posts/comments/${commentId}/react`, ...)
  } catch {}
}

onMounted(loadPosts)
</script>