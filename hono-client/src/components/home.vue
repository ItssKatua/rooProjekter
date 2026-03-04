<template>
    <div>
        <!-- tabs menu -->
        <menu role="tablist" class="tab-menu">
            <li role="tab" aria-selected="true"><a href="#">awdawdaw</a></li>
            <li role="tab" aria-selected="false"><a href="#">wasss</a></li>
            <li role="tab" aria-selected="false"><a href="#">fvlkjkfdvbjvn</a></li>
        </menu>
        <!-- main window -->
        <div class="window" role="tabpanel">
        <div class="title-bar" :class="{inactive: windowActive}">
        <div class="flex flex-row" style="gap: 4px;">
        <img src="/img/channels-5.png" alt="">
        <div class="title-bar-text">CommSat</div>
        </div>
        <div class="title-bar-controls">
        <button aria-label="Maximize" disabled></button>
        <button aria-label="Close" disabled></button>
        </div>
        </div>
        <!-- widow body count -->
        <div class="window-body">

        <div v-if="activePage === 'home'">
        <h3>Hello, {{user.name}}</h3>
        <fieldset style="width:fit-content;">
        <legend>My status</legend>
        <div class="field-row">
        <div class="field-row">
        <input id="radio10" type="radio" name="fieldset-example" checked="checked" v-model="userStatus" value="Online" :disabled="windowActive">
        <label for="radio10">Online</label>
        </div>
        <div class="field-row">
        <input id="radio11" type="radio" name="fieldset-example" v-model="userStatus" value="Away" :disabled="windowActive">
        <label for="radio11">Away</label>
        </div>
        <div class="field-row">
        <input id="radio12" type="radio" name="fieldset-example" v-model="userStatus" value="Busy" :disabled="windowActive">
        <label for="radio12">Busy</label>
        </div>
        <div class="field-row">
        <input id="radio13" type="radio" name="fieldset-example" v-model="userStatus" value="DND" :disabled="windowActive">
        <label for="radio13">DND</label>
        </div>
        </div>
        </fieldset>
        {{ userStatus }}

        <button :disabled="windowActive">click me</button>
        <button v-on:click="sigma()">aasa</button>
        </div>

        <div v-if="activePage === 'announce'">
        <button @click="() => audioTadaa.play()">tada</button>
        </div>

        <div v-if="activePage === 'dm'">
        <a href="">Text john</a>
        <button @click="() => audioNotify.play()">dindon</button>
        </div>
        </div>
        </div>
    </div>
</template>

<script>

</script>

<style lang="scss" scoped>

</style>