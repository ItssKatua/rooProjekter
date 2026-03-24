<template>
    <div class="windowLoading">
        <button @click="skip">ss</button>
        <p><b>Please wait while the application loads. . .</b></p>
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
emit('loaded')

function skip(){
    uhhuh.value = 100;
}
function dothefunny() {
    // console.log(uhhuh);
    
    if (uhhuh.value >= 100) {
        uhhuh.value = 100
        emit('loaded')
        
        // console.log("sigma");
        
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
    user-select: none;
}
</style>