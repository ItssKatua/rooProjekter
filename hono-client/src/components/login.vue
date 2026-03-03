<template>
    <div class="window windowLogin">
        <div class="title-bar">
            <div class="flex flex-row" style="gap: 4px;">
            <img src="/img/channels-5.png" alt="">
            <div class="title-bar-text">Log in</div>
            </div>
            <div class="title-bar-controls">
                <button aria-label="Close" disabled></button>
            </div>
        </div>

        <div class="window-body">
            <h4>Welcome back to <b>CommSat</b></h4>
            <br>
            <form>

                <div class="field-row-stacked">
                    <label for="text18">Username</label>
                    <input id="text18" type="text" />
                </div>
                <div class="field-row-stacked">
                    <label for="text19">Password</label>
                    <input id="text19" type="text" />
                </div>
                <br>
                <div class="field-row">
                    <button class="default" formaction="submit">Submit</button>
                    <button>Cancel</button>
                    <button>Register</button>
                </div>
            </form>
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
.windowLogin{
    top: 400px;
    left: 500px;
    width: 320px;
    z-index: 200;
}
</style>