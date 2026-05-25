<template>
    <div class="window-wrapper" v-if="visible" :style="windowPosition" @mousedown="focusWindow">
        
        <slot name="tabs"></slot>
        <div class="window" role="tabpanel" :style="windowStyle">
            <!-- window title -->
            <div class="title-bar" @mousedown.stop="startDrag" :class="{ inactive: !active}">
                <div class="flex flex-row gap-1 items-center"> 
                    <img v-if="imgsrc" :src="imgsrc" draggable="false">
                    <div class="title-bar-text">{{ title }}</div>
                </div>
                <div class="title-bar-controls">
                    <button aria-label="Minimize" @click.stop="$emit('minimize')"></button>
                    <button aria-label="Close" @click.stop="closeWindow"></button>
                </div>
            </div>
            
            <!-- window body -->
            <div class="window-body" :style="bodyStyle">
                <slot></slot>
            </div>
        </div>
    </div>
</template>


<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';

const props = defineProps({
    title: { type: String, default: 'Window' },
    imgsrc: { type: String, default: '/img/channels-5.png' },
    active: { type: Boolean, default: false },
    z: { type: Number, default: 0 },
    initialX: { type: Number, default: 200 },
    initialY: { type: Number, default: 100 },
    width: { type: String, default: 'auto' },
    minWidth: { type: String, default: '280px' },
    bodyOverflow: { type: String, default: 'auto' },
})

const emit = defineEmits(['focus', 'close', 'minimize']);

const visible = ref(true)

const windowStyle = computed(() => ({
    width: '100%',
}))

const bodyStyle = computed(() => ({
    overflow: props.bodyOverflow,
    maxHeight: '70vh',
}))
//
// position managrhe
//

const pos = ref({ x: props.initialX, y: props.initialY })
const windowPosition = computed(() => ({
    position: 'absolute',
    left: pos.value.x + 'px',
    top: pos.value.y + 'px',
    zIndex: props.z,
    width: props.width,
    minWidth: props.minWidth,
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
    user-select: none;
}
</style>