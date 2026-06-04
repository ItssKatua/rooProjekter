<template>
  <window
    :title="mode === 'alert' ? 'Error' : 'Warning'"
    :imgsrc="mode === 'alert' ? '/img/error.png' : '/img/warn-small.png'"
    :active="true"
    :z="9999"
    :initialX="Math.round((window.innerWidth - 320) / 2)"
    :initialY="Math.round((window.innerHeight - 220) / 2)"
    width="320px"
    @close="$emit('close',)"
  >
    <div style="display:flex; align-items:flex-start; gap: 12px; padding: 4px 0 12px;">
      <img v-if="mode === 'alert'" src="/img/error-big.png" width="32" height="32" style="flex-shrink:0; margin-top:2px;" onerror="this.style.fontSize='28px'; this.style.border='none'" />
      <img v-else src="/img/warn-big.png" width="32" height="32" style="flex-shrink:0; margin-top:2px;" onerror="this.style.fontSize='28px'; this.style.border='none'" />
      <div style="word-break: break-word; font-size: 11px; line-height: 1.5;">{{ message }}</div>
    </div>
    <div class="field-row gap-12" style="justify-content: center;">
      <button class="default" style="min-width:75px;" @click="$emit('close', true)">OK</button>
      <button style="min-width:75px;" @click="$emit('close', false)" v-if="mode === 'confirm'">Cancel</button>
    </div>
  </window>
</template>

<script setup>
    import window from './window.vue'
    defineProps({
      message: { type: String, default: 'An error occurred.' },
      mode: { type: String, default: 'alert' }
    })
    defineEmits(['close'])
</script>