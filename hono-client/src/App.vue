<script setup>
import { onMounted, provide, ref } from 'vue'
import Window from './components/misc/window.vue'

// windows content components
import LoadingComp from './components/misc/loading.vue'
import MainComp from './components/commSat.vue'
import LoginComp from './components/user/login.vue'
import RegisterComp from './components/user/register.vue'


import { fetchUser } from './js/user.js'




// loading winfowd
const windowActive = ref(true)
function nacitalSomSa(){
  windows.value = windows.value.filter(a => a.id !== 10)

  windows.value.push(
    { 
      id: 1,
      title: "CommSat",
      component: MainComp,
      active: false,
      z: 0
    },
    {
      id: 2,
      title: "Log In",
      component: LoginComp,
      active: false,
      z: 0
    }
  )
}
//windows
const windows = ref([
  { 
    id: 10,
    title: "Loading. . .",
    component: LoadingComp,
    active: true,
    z: 1
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
  {name: "dm", label: "Messages"},
  {name: "admin", label: "Admin"}
]
const activePage = ref('home')

function ChangePage(target){
  activePage.value = target
}

provide('activePage', activePage)


onMounted(() => {
  fetchUser();
})
</script>




<template>
  <!-- <LoadingComp v-if="loading" @loaded="rasizmus" /> -->
  <!-- <div v-else class="mainWindow"> -->

    <div class="desktop" @mousedown.self="focusDesktop">
      <!-- make windows for each window in winjdows -->
      <Window
        v-for="occ in windows"
        :key="occ.id"
        :title="occ.title"
        :active="occ.active"
        :z="occ.z"
        :imgsrc="occ.logo"
        @focus="focusWindow(occ.id)"
        @close="closeWindow(occ.id)"
      >

        <!-- make the main window tabs :3 -->
        <template #windowMenu v-if="occ.id === 1">
          <menu role="tablist" class="tab-menu">
            <li v-for="tab in tabs"
            :key="tab.name"
            role="tab"
            :aria-selected="tab.name === activePage ? 'true' : 'false'">
              <a href="#" @click.prevent="ChangePage(tab.name)">{{ tab.label }}</a>
            </li>
          </menu>
        </template>

        <!-- content IDK MAN IGNORE TS IT BREAKS EVERYTHING-->
        <component :is="occ.component" @loaded="nacitalSomSa"/>
      </Window>
    </div>
</template>

<style>
</style>