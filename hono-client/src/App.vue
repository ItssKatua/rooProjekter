<script setup>
import { ref, computed, onMounted, onUnmounted, provide } from 'vue'
import importWindow from './components/misc/window.vue'
import LoadingComp from './components/misc/loading.vue'
import LoginComp from './components/user/login.vue'
import RegisterComp from './components/user/register.vue'
import CommSatComp from './components/commSat.vue'
import ChatWindow from './components/messages/ChatWindow.vue'
import ErrorDialog from './components/misc/ErrorDialog.vue'
import { fetchUser, currentUser, logout, applyAdminUpdate } from './js/user.js'
import { getToken } from './js/api.js'
import { useSSE } from './js/sse.js'

// audio
const audioChime  = new Audio('/sound/chime.mp3')
const audioNotify = new Audio('/sound/notify.mp3')
const audioTadaa = new Audio('/sound/tada.mp3')

// state of app
const appState = ref('loading')  // loading | auth | app
const authView = ref('login')    // login | register
const errorMessage = ref('')
const showError = ref(false)

// tabs
const allTabs = [
  { name: 'home',     label: 'Home' },
  { name: 'announce', label: 'Announcements' },
  { name: 'dm',       label: 'Messages' },
  { name: 'admin',    label: 'Admin' },
]
const activePage = ref('home')
const visibleTabs = computed(() =>
  allTabs.filter(t => {
    if (t.name === 'admin') return currentUser.value?.roles?.includes('admin')
    return true
  })
)

// windows
let topZ = 100
const windows = ref([])
 
function focusWindow(id) {
  windows.value.forEach(w => { w.active = false })
  const w = windows.value.find(w => w.id === id)
  if (w) { w.active = true; w.z = ++topZ }
}
 
function closeWindow(id) {
  windows.value = windows.value.filter(w => w.id !== id)
}
 
//rorr
const dialogMode = ref('alert') // 'alert' | 'confirm'
let resolveDialog = null

function openError(msg) {
  errorMessage.value = msg
  dialogMode.value = 'alert'
  showError.value = true
  audioChime.currentTime = 0
  audioChime.play().catch(() => {})
}

function openErrorConfirm(msg) {
  errorMessage.value = msg
  dialogMode.value = 'confirm'
  showError.value = true
  audioChime.currentTime = 0
  audioChime.play().catch(() => {})
  

  return new Promise((resolve) => {
    resolveDialog = resolve
  })
}

function closeError(result = false) {
  showError.value = false
  resolveDialog?.(result)
  resolveDialog = null
}

provide('openError', openError)
provide('openErrorConfirm', openErrorConfirm)
provide('closeError', closeError)

// loaded
async function onLoaded() {
  audioNotify.play().catch(() => {})
 
  // autologin
  if (getToken()) {
    const user = await fetchUser()
    if (user) {
      appState.value = 'app'
      openMainWindow()
      return
    }
  }
  appState.value = 'auth'
}

//auth?
function onLoggedIn() {
  appState.value = 'app'
  openMainWindow()
  audioNotify.play().catch(() => {})
}
 
function onRegistered() {
  appState.value = 'app'
  openMainWindow()
  audioNotify.play().catch(() => {})
}
 
function doLogout() {
  logout()
  windows.value = []
  appState.value = 'auth'
  authView.value = 'login'
}

// window ts
function openMainWindow() {
  if (windows.value.find(w => w.id === 'main')) return
  windows.value.push({
    id: 'main',
    title: 'CommSat',
    type: 'main',
    active: true,
    z: ++topZ,
    width: '660px',
  })
}

// chat window ts
function openChat({ roomId, otherUser }) {
  const chatId = `chat-${roomId}`
  if (windows.value.find(w => w.id === chatId)) {
    focusWindow(chatId)
    return
  }

  windows.value.push({
    id: chatId,
    title: `Chat - ${otherUser.first_name} ${otherUser.last_name}`,
    type: 'chat',
    active: true,
    z: ++topZ,
    initialX: icenterX,
    initialY: icenterY,
    roomId,
    otherUser,
    width: '360px',
  })
  audioNotify.play().catch(() => {})
}

//clock
const clock = ref('')
function updateClock() {
  clock.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
updateClock()
const clockTimer = setInterval(updateClock, 1000)

provide('openChat', openChat)

onMounted(() => {
  audioChime.load()
  audioNotify.load()
})
onUnmounted(() => clearInterval(clockTimer))

// Global SSE listeners — employee/role changes that affect the current session
useSSE({
  // If an admin updates the current user's roles/profile, refresh immediately
  'employee:admin-updated': (data) => {
    applyAdminUpdate(data)
  },
  // If an admin force-logs out the current user
  'employee:updated': (data) => {
    if (currentUser.value && data.id === currentUser.value.id) {
      if (data.status !== undefined) currentUser.value.status = data.status
      if (data.first_name !== undefined) currentUser.value.first_name = data.first_name
      if (data.last_name !== undefined) currentUser.value.last_name = data.last_name
    }
  },
  // If the current user's account is deleted, force logout
  'employee:deleted': (data) => {
    if (currentUser.value && data.id === currentUser.value.id) {
      doLogout()
      openError('Your account has been removed by an administrator.')
    }
  },
})

// import { onMounted, provide, ref } from 'vue'
// import Window from './components/misc/window.vue'

// // windows content components
// import LoadingComp from './components/misc/loading.vue'
// import MainComp from './components/commSat.vue'
// import LoginComp from './components/user/login.vue'
// import RegisterComp from './components/user/register.vue'
// import ErrorComp from './components/misc/ErrorDialog.vue'
// import ohio from './components/admin/AdminPanel.vue'


// import { fetchUser } from './js/user.js'




// // loading winfowd
// const windowActive = ref(true)
// function nacitalSomSa(){
//   windows.value = windows.value.filter(a => a.id !== 10)

//   windows.value.push(
//     { 
//       id: 1,
//       title: "CommSat",
//       component: MainComp,
//       active: false,
//       z: 0
//     },
//     {
//       id: 2,
//       title: "Log In",
//       component: LoginComp,
//       active: false,
//       z: 0
//     }
//   )
// }
// //windows

// function focusWindow(id){
//   windows.value.forEach(g => g.active = false)
//   const win = windows.value.find(d => d.id === id)
//   win.active = true;
//   win.z = ++topZ;
// }

// function closeWindow(id){
//   windows.value = windows.value.filter(o => o.id !== id)
// }



// // login idk
// const userStatus = ref("Online");
// const user = {
//   name: "John Malkovich",
//   status: userStatus.value
// }

// // pagestabs
// const tabs = [
//   {name: "home", label: "Home"},
//   {name: "announce", label: "Announcements"},
//   {name: "dm", label: "Messages"},
//   {name: "admin", label: "Admin"}
// ]
// const activePage = ref('home')

// function ChangePage(target){
//   activePage.value = target
// }

// provide('activePage', activePage)


// onMounted(() => {
//   fetchUser();
// })
const icenterX = computed(() =>
  typeof window !== "undefined" ? (window.innerWidth - 320) / 2 : 0
)

const icenterY = computed(() =>
  typeof window !== "undefined" ? (window.innerHeight - 200) / 2 : 0
)
</script>

<template>
  <div class="desktop" @mousedown="focusDesktop">
 
    <!-- loading-->
    <importWindow
      v-if="appState === 'loading'"
      title="Loading. . ."
      :active="true"
      :z="200"
      :initialX="icenterX"
      :initialY="icenterY"
      width="320px"
      :minWidth="'320px'"
    >
      <LoadingComp @loaded="onLoaded" />
    </importWindow>
 
    <!-- auto(rizzacia) 🚗🚗🚗🏎🏎🚔🏎🚗🚙🚋🚘🚓🚡-->
    <importWindow
      v-if="appState === 'auth'"
      :title="authView === 'login' ? 'Log In' : 'Register'"
      imgsrc="/img/channels-5.png"
      :active="true"
      :z="150"
      :initialX="icenterX"
      :initialY="icenterY"
      width="340px"
      :minWidth="'300px'"
    >
      <LoginComp
        v-if="authView === 'login'"
        @logged-in="onLoggedIn"
        @error="openError"
        @register="authView = 'register'"
      />
      <RegisterComp
        v-else
        @registered="onRegistered"
        @error="openError"
        @login="authView = 'login'"
      />
    </importWindow>
 
    <!-- apkilacia -->
    <template v-if="appState === 'app'">
      <template v-for="win in windows" :key="win.id">
 
        <importWindow
          v-if="win.type === 'main'"
          :title="win.title"
          :active="win.active"
          :z="win.z"
          :initialX="icenterX - 200"
          :initialY="icenterY - 200"
          :width="win.width"
          bodyOverflow="auto"
          @focus="focusWindow(win.id)"
          @close="closeWindow(win.id)"
        >
          <template #tabs>
            <menu role="tablist">
              <li
                v-for="tab in visibleTabs"
                :key="tab.name"
                role="tab"
                :aria-selected="activePage === tab.name ? 'true' : 'false'"
              >
                <a href="#" @click.prevent="activePage = tab.name">{{ tab.label }}</a>
              </li>
            </menu>
          </template>
 
          
          <CommSatComp :activePage="activePage" @open-chat="openChat" />
        </importWindow>
 
        <importWindow
          v-else-if="win.type === 'chat'"
          :title="win.title"
          :active="win.active"
          :z="win.z"
          :initialX="icenterX"
          :initialY="icenterY"
          :width="win.width"
          @focus="focusWindow(win.id)"
          @close="closeWindow(win.id)"
        >
          <ChatWindow :roomId="win.roomId" :otherUser="win.otherUser" />
      </importWindow>
 
      </template>
    </template>
 
    <!-- errer -->
    <ErrorDialog
      v-if="showError"
      :message="errorMessage"
      :mode="dialogMode"
      :initialX="icenterX"
      :initialY="icenterY"
      @close="(result) => closeError(result)"
    />
 
    <!-- task -->
    <div v-if="appState === 'app'" class="taskbar">
      <button
        v-for="win in windows"
        :key="win.id"
        class="taskbar-btn"
        :class="{ active: win.active }"
        @click="focusWindow(win.id)"
        style="max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
      >
        {{ win.title }}
      </button>
 
      <div style="flex:1;"></div>
 
      <button class="taskbar-btn" @click="doLogout" style="min-width:auto; padding:0 10px;">
        Log Out
      </button>
 
      <div class="taskbar-clock">{{ clock }}</div>
    </div>
  </div>
</template>


<style>
 
.taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 32px;
  background: silver;
  box-shadow: inset 0 1px #fff, inset 0 2px #dfdfdf;
  display: flex;
  align-items: center;
  padding: 2px 4px;
  gap: 4px;
  z-index: 9998;
  border-top: 1px solid #808080;
}
 
.taskbar-btn {
  height: 22px;
  min-width: 80px;
  font-size: 11px;
  padding: 0 8px;
  background: silver;
  box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf;
  border: none;
  cursor: pointer;
  font-family: "Pixelated MS Sans Serif", "MS Sans Serif", Arial, sans-serif;
}
 
.taskbar-btn.active {
  box-shadow: inset -1px -1px #fff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px grey;
}
 
.taskbar-clock {
  font-size: 11px;
  padding: 0 8px;
  font-family: "Pixelated MS Sans Serif", "MS Sans Serif", Arial, sans-serif;
  box-shadow: inset -1px -1px #dfdfdf, inset 1px 1px grey;
  height: 22px;
  display: flex;
  align-items: center;
  min-width: 50px;
  justify-content: center;
}
 
.tab-menu {
  user-select: none;
  display: flex;
  list-style-type: none;
  margin: 0 0 -2px;
  padding-left: 3px;
  position: relative;
  text-indent: 0;
}
 
.ui-icon {
  color: white;
  text-align: center;
  width: 72px;
  padding: 8px 1px;
  font-size: 11px;
  line-height: 1.3;
  cursor: pointer;
  user-select: none;
}
 
.ui-icon:hover {
  background: rgba(255,255,255,0.15);
}
</style>


<!-- <template>
  <!-- <LoadingComp v-if="loading" @loaded="rasizmus" /> --
  <!- <div v-else class="mainWindow"> --

    <div class="desktop" @mousedown.self="focusDesktop">
      <!-- make windows for each window in winjdows --
      <Window
        v-for="okno in windows"
        :key="okno.id"
        :title="okno.title"
        :active="okno.active"
        :z="okno.z"
        :imgsrc="okno.logo"
        :initialX="okno.initialX"
        :initialY="okno.initialY"
        :width="okno.width"
        :minWidth="okno.minWidth"
        @focus="focusWindow(okno.id)"
        @close="closeWindow(okno.id)"
      >

        <!-- make the main window tabs :3 --
        <template #windowMenu v-if="okno.id === 1">
          <menu role="tablist" class="tab-menu">
            <li v-for="tab in tabs"
            :key="tab.name"
            role="tab"
            :aria-selected="tab.name === activePage ? 'true' : 'false'">
              <a href="#" @click.prevent="ChangePage(tab.name)">{{ tab.label }}</a>
            </li>
          </menu>
        </template>

        <!-- content IDK MAN IGNORE TS IT BREAKS EVERYTHING--
        <component :is="okno.component" @loaded="nacitalSomSa"/>
      </Window>
    </div>
</template> -->

<style>
</style>