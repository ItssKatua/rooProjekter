<script setup>
import { ref } from 'vue'
import LoadingComp from './components/loading.vue'
import LoginComp from './components/login.vue'

// loading winfowd
const loading = ref(true);
const windowActive = ref(true)
function rasizmus(){
  loading.value = false;
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

function sigma(){
  windowActive.value = !windowActive.value;
  audioChime.pause();
  audioChime.currentTime = 0;
  audioChime.play();
}

const tabs = [
  {name: "home", label: "Home"},
  {name: "announce", label: "Announcements"},
  {name: "dm", label: "Messages"}
]
const activePage = ref('home')

function ChangePage(target){
  activePage.value = target
}

// const users = ref([])

// async function fetchUsers() {
//   const response = await fetch('http://localhost:3000/users')
//   const usersResponse = await response.json()

//   users.value = usersResponse
// }

// async function deleteUser(index) {
//   const response = await fetch('http://localhost:3000/users/' + index, {
//     method: 'delete',
//   })

//   const deleteUserResponse = await response.text()

//   if (deleteUserResponse === 'ok') {
//     await fetchUsers()
//   }
// }

// const text = ref('')

// async function addUser() {
//   const response = await fetch('http://localhost:3000/users', {
//     method: 'post',
//     headers: {
//       'content-type': 'application/json',
//     },
//     body: JSON.stringify({
//       newUsername: text.value,
//     }),
//   })

//   const responseText = await response.text()

//   if (responseText === 'ok') {
//     await fetchUsers()
//   }
// }
</script>




<template>
  <!-- <LoadingComp v-if="loading" @loaded="rasizmus" /> -->
  <!-- <div v-else class="mainWindow"> -->
  <div class="mainwindow">
    <menu role="tablist" class="tab-menu">
      <li v-for="tab in tabs" role="tab" :aria-selected="tab.name === activePage ? 'true' : 'false'">
        <a href="#" @click.prevent="ChangePage(tab.name)">{{ tab.label }}</a>
      </li>
    </menu>
    <!-- widow -->
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
  <LoginComp v-if="user" />
</template>

<style>
.window{
  position: absolute;
}
.mainwindow{
  position: absolute;
  top: 300px;
  left: 300px;
  width: 800px;
  height: 100%;
  padding-top: 70px;
}
</style>