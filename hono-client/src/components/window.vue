<template>
    <slot name="windowMenu">
        
    </slot>
    <div class="window" role="tabpanel" >
        <!-- window title -->
        <div class="title-bar">
            <div class="flex flex-row gap-1"> 
                <img v-if="imgsrc" :src="imgsrc">
                <div class="title-bar-text">{{ title }}</div>
            </div>
            <div class="title-bar-controls">
                <button aria-label="Minimize"></button>
                <button aria-label="Close"></button>
            </div>
        </div>

        <!-- window body -->
        <div class="window-body">
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
    defineProps({
        title: String,
        imgsrc: String
    })
</script>
<style>

</style>