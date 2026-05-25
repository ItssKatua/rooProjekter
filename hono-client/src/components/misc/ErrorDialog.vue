<template>
  <window
    title="Error"
    imgsrc="/img/error.png"
    :active="true"
    :z="9999"
    :initialX="Math.round(window.innerWidth / 2 - 160)"
    :initialY="Math.round(2222)"
    width="320px"
    @close="$emit('close')"
  >
    <div style="display:flex; align-items:flex-start; gap: 12px; padding: 4px 0 12px;">
      <img src="/img/error-big.png" width="32" height="32" style="flex-shrink:0; margin-top:2px;" onerror="this.style.fontSize='28px'; this.textContent='⚠️'; this.style.border='none'" />
      <div style="word-break: break-word; font-size: 11px; line-height: 1.5;">{{ message }}</div>
    </div>
    <div class="field-row gap-12" style="justify-content: center;">
      <button class="default" style="min-width:75px;" @click="$emit('close')">OK</button>
      <!--<button style="min-width:75px;" @click="$emit('close')">Close</button>-->
    </div>
  </window>
</template>

<script setup>
    import window from './window.vue'
    defineProps({ message: { type: String, default: 'An error occurred.' } })
    defineEmits(['close'])
</script>