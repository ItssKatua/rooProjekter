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

</script>




<template>
  <!-- <LoadingComp v-if="loading" @loaded="rasizmus" /> -->
  <!-- <div v-else class="mainWindow"> -->
  <div style="position: absolute; left: 200px; top: 200px;">
    <Window title="CommSat" imgsrc="/img/channels-5.png">
      <!-- the gigga chigga nigga -->
      <template #windowMenu>
        <menu role="tablist" class="tab-menu">
            <!-- <li v-for="tab in tabs" role="tab" :aria-selected="tab.name === activePage ? 'true' : 'false'">
                <a href="#" @click.prevent="ChangePage(tab.name)">{{ tab.label }}</a>
            </li> -->
            <li role="tab" aria-selected="true"><a href="#">siagma</a></li>
            <li role="tab" aria-selected="false"><a href="#">siagma</a></li>
            <li role="tab" aria-selected="false"><a href="#">siagma</a></li>
        </menu>
      </template>

      <!-- content -->
      <template #default>
        <windowHome/>
      </template>
    </Window>
    <br><br>
    <Home/>
  </div>
</template>

<style>
.mainwindow{
  position: absolute;
  top: 300px;
  left: 300px;
  width: 800px;
  height: 100%;
  padding-top: 70px;
}
</style>