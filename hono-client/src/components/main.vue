<script setup>
import { ref } from "vue"

import Home from "./home.vue"
import Announce from "./announce.vue"
import Messages from "./messages.vue"

const tabs = [
  { name: "home", label: "Home", comp: Home },
  { name: "announce", label: "Announcements", comp: Announce },
  { name: "dm", label: "Messages", comp: Messages }
]

const activePage = ref("home")

function changePage(name) {
  activePage.value = name
}

const activeComponent = computed(() =>
  tabs.find(t => t.name === activePage.value)?.comp
)
</script>
<template>

  <!-- WINDOW MENU SLOT -->
  <template #windowMenu>
    <menu role="tablist" class="tab-menu">
      <li
        v-for="tab in tabs"
        :key="tab.name"
        role="tab"
        :aria-selected="tab.name === activePage"
      >
        <a href="#" @click.prevent="changePage(tab.name)">
          {{ tab.label }}
        </a>
      </li>
    </menu>
  </template>

  <!-- SWITCHED CONTENT -->
  <component :is="activeComponent" />

</template>