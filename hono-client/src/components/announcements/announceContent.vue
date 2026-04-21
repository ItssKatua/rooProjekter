<template>
    <div>
        <input type="text" id="addme" v-model="email">
        <input type="text" name="ps" id="password" v-model="password">
        <button @click="loginer">login</button>
        <br>
        <input type="text" name="name" id="name">
        <button @click="loadEmployees">show all</button>
        <ul>
            <li v-for="e in employees" :key="e.id">
                {{ e.first_name }} {{ e.last_name }}
            </li>
        </ul>
        <button @click="showme">print me</button>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { api, login } from '../../js/api.js'


    const email = ref('')
    const password = ref('')
    
    function loginer(){
        login(email.value, password.value);
    }
    const employees = ref([])

    const loadEmployees = async () => {
    try {
        employees.value = await api('/employees/employees')
    } catch (err) {
        console.error(err)
    }

    function showme(){

    }


}

// onMounted(loadEmployees);
</script>

<style>

</style>