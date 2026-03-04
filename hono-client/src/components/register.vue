<template>
    <div class="window windowRegister">
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
            <h4>Welcome back to <b>CnjkegvfbbmejvcvfxjcsyuekctsyewommSat</b></h4>
            <br>
            <form action="#">

                <div class="field-row-stacked">
                    <label for="text18">Username</label>
                    <input id="text18" type="text" />
                </div>
                <div class="field-row-stacked">
                    <label for="text19">Password</label>
                    <input id="text19" type="password" />
                </div>
                <br>
                <div class="field-row">
                    <button class="default" formaction="submit">Submit</button>
                    <button>Cancel</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'


</script>

<style>
.windowRegister{
    top: 400px;
    left: 810px;
    width: 320px;
    z-index: 200;
}
</style>