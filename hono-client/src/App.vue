<script setup>
import { ref } from 'vue'
import Window from './components/window.vue'
import windowHome from './components/home.vue'
import LoadingComp from './components/loading.vue'
import LoginComp from './components/login.vue'
import Home from './components/home.vue'

// loading winfowd
const loading = ref(true);
const windowActive = ref(true)
function rasizmus(){
  loading.value = false;
}
//windows (the os)
const windows = ref([
  { 
    id: 1,
    title: "CommSat",
    active: true,
    z: 1
  },
  {
    id: 2,
    title: "Log In",
    component: LoginComp,
    active: false,
    z: 0
  }
])
let topZ = 10;

function focusWindow(id){
  windows.value.forEach(g => g.active = false)
  const win = windows.value.find(d => d.id === id)
  win.active = true;
  win.z = ++topZ;
}

function closeWindow(id){
  windows.value = windows.value.filter(o => o.id !== id)
}

function focusDesktop() {
  windows.value.forEach(e => e.active = false)
}


// login idk
const userStatus = ref("Online");
const user = {
  name: "John Malkovich",
  status: userStatus.value
}

// audios
const audioChime = new Audio('/sound/chime.mp3')
const audioTadaa = new Audio('/sound/tada.mp3')
const audioNotify = new Audio('/sound/notify.mp3')

// pagestabs
const tabs = [
  {name: "home", label: "Home"},
  {name: "announce", label: "Announcements"},
  {name: "dm", label: "Messages"}
]
const activePage = ref('home')

function ChangePage(target){
  activePage.value = target
}

</script>




<template>
  <!-- <LoadingComp v-if="loading" @loaded="rasizmus" /> -->
  <!-- <div v-else class="mainWindow"> -->

    <div class="desktop" @mousedown.self="focusDesktop">
      <!-- main window -->
      <Window
        v-for="occ in windows"
        :key="occ.id"
        :title="occ.title"
        :active="occ.active"
        :z="occ.z"
        :imgsrc="occ.logo"
        @focus="focusWindow(occ.id)"
        @close="closeWindow(occ.id)">

      <template #windowMenu v-if="occ.id === 1">
        <menu role="tablist" class="tab-menu">
          <li v-for="tab in tabs" role="tab" :aria-selected="tab.name === activePage ? 'true' : 'false'">
            <a href="#" @click.prevent="ChangePage(tab.name)">{{ tab.label }}</a>
          </li>
        </menu>
      </template>

      <!-- content -->
      <component :is="occ.component" />

      </Window>
    </div>
  <!-- <div style="position: absolute; left: 200px; top: 200px;">
    <Window title="CommSat" imgsrc="/img/channels-5.png">
      <-- the gigga chigga nigga ->
      <template #windowMenu>
        <menu role="tablist" class="tab-menu">
            <li v-for="tab in tabs" role="tab" :aria-selected="tab.name === activePage ? 'true' : 'false'">
              <a href="#" @click.prevent="ChangePage(tab.name)">{{ tab.label }}</a>
            </li>
        </menu>
      </template>

      <!- content ->
      <template #default>
        <windowHome/>
      </template>
    </Window>
    <br><br>
    <Home/>
  </div> -->
</template>

<style>
</style>