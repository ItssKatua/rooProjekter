<template>
    <div class="window windowLoading">
        <div class="title-bar">
            <div class="flex flex-row" style="gap: 4px;">
            <img src="/img/channels-5.png" alt="">
            <div class="title-bar-text">CommSat</div>
            </div>
            <div class="title-bar-controls">
                <button aria-label="Close" disabled></button>
            </div>
        </div>

        <div class="window-body">
            <p><b>Please wait while the application loads. . .</b></p>
            <br>
            <div class="progress-indicator">
                <span class="progress-indicator-bar" :style="{ width: uhhuh + '%' }" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const uhhuh = ref(0)
const emit = defineEmits(['loaded'])

function dothefunny() {
    console.log(uhhuh);
    
    if (uhhuh.value >= 100) {
        uhhuh.value = 100
        emit('loaded')
        console.log("sigma");
        
        return
    }

    uhhuh.value = Math.min(uhhuh.value + (Math.floor(Math.random() * 16.069 /* bahbhabhhaahhahaha */) + 8.21), 100)
    setTimeout(dothefunny, Math.random() * 3164 + 500)
}

onMounted(() => {
    dothefunny()
})
</script>

<style>
.windowLoading{
    cursor: wait;
    margin: 0 auto;
    width: 400px;
}
</style>