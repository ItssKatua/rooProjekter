<template>
    <div class="windowLoading">
        <p><b>Please wait while CommSat loads. . .</b></p>
        <br>
        <div class="progress-indicator">
            <span class="progress-indicator-bar" :style="{ width: uhhuh + '%' }" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const uhhuh = ref(0)
const emit = defineEmits(['loaded'])

function dothefunny() {
    // console.log(uhhuh);
    
    if (uhhuh.value >= 100) {
        uhhuh.value = 100
        emit('loaded')
        
        // console.log("sigma");
        
        return
    }

    uhhuh.value = Math.min(uhhuh.value + (Math.floor(Math.random() * 21.069 /* bahbhabhhaahhahaha */) + 8.21), 100)
    setTimeout(dothefunny, Math.random() * 400 + 200)
}

onMounted(dothefunny)
</script>

<style>
.windowLoading{
    cursor: wait;
    padding: 8px 4px;
    width: 100%;
    user-select: none;
}
</style>