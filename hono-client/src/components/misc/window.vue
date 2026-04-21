<template>
    <div class="window-wrapper" v-if="visible" :style="windowPosition" @mousedown="focusWindow">
        <slot name="windowMenu">
            
        </slot>
        <div class="window" role="tabpanel">
            <!-- window title -->
            <div class="title-bar" @mousedown.stop="startDrag" :class="{ inactive: !active}">
                <div class="flex flex-row gap-1"> 
                    <img v-if="imgsrc" :src="imgsrc" draggable="false">
                    <div class="title-bar-text">{{ title }}</div>
                </div>
                <div class="title-bar-controls">
                    <button aria-label="Minimize"></button>
                    <button aria-label="Close" @click.stop="closeWindow"></button>
                </div>
            </div>
            
            <!-- window body -->
            <div class="window-body">
                <slot></slot>
            </div>
        </div>
    </div>
</template>


<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';

const props = defineProps({
    title: String,
    imgsrc: {
        type: String,
        default: "/img/channels-5.png"
    },
    active: Boolean,
    z: Number
})

const emit = defineEmits(['focus', 'close']);

const visible = ref(true)

//
// position managrhe
//
const pos = ref({
    x: 400,
    y: 300
})
const windowPosition = computed(() => ({
    left: pos.value.x + 'px',
    top: pos.value.y + 'px',
    zIndex: props.z
}))

//
// drag racing or sm
//
let offX = 0;
let offY = 0;
function startDrag(e){
    emit('focus')
    offX = e.clientX - pos.value.x;
    offY = e.clientY - pos.value.y
    document.addEventListener('mousemove', doDrag)
    document.addEventListener('mouseup', stopDrag);
}
function doDrag(e){
    pos.value.x = e.clientX - offX;
    pos.value.y = e.clientY - offY;
}
function stopDrag(e){
    document.removeEventListener('mousemove', doDrag);
    document.removeEventListener('mouseup', stopDrag)
}

onBeforeUnmount(stopDrag);

// sm other bs
function closeWindow(){
    visible.value = false;
    emit('close')
}
function focusWindow() {
    emit("focus");
}
</script>

<style>
.window-wrapper {
  position: absolute;
}
</style>