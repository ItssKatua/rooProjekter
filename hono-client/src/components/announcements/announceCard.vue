<template>
    <div class="status-field-border" style="padding: 8px;">
        <div class="flex flex-row ">
            {{ props.poster }}
            <div>aasd</div>
            <div>aasd</div>
        </div>
    </div>
</template>

<script>
import { defineProps } from 'vue';

const props = defineProps({
    poster: String,
    content: String,
    timestamp: Date,
    likes: Number
})
</script>

<style>

</style>