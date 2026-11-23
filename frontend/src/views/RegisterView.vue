<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Breadcrumb from "@/components/Breadcrumb.vue";

const authStore = useAuthStore()
const router = useRouter()
const firstName = ref('')
const lastName = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

async function toRegister(){
    if (!firstName.value) {
    errorMessage.value = 'Enter first name!'
    setTimeout(() => errorMessage.value = '', 3000)
    return
}
if (!lastName.value) {
    errorMessage.value = 'Enter last name!'
    setTimeout(() => errorMessage.value = '', 3000)
    return
}
if (!username.value) {
    errorMessage.value = 'Enter username!'
    setTimeout(() => errorMessage.value = '', 3000)
    return
}
if (!email.value) {
    errorMessage.value = 'Enter email!'
    setTimeout(() => errorMessage.value = '', 3000)
    return
}
if (!password.value) {
    errorMessage.value = 'Enter password!'
    setTimeout(() => errorMessage.value = '', 3000)
    return
}
     //const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; regex for
     // real password
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const nameRegex = /^[A-ZČĆŠĐŽ][a-zčćšđž]{1,}( [A-ZČĆŠĐŽ][a-zčćšđž]{1,})*$/
    const lastNameRegex = /^[A-ZČĆŠĐŽ][a-zčćšđž]{1,}( [A-ZČĆŠĐŽ][a-zčćšđž]{1,})*$/
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/

    if (!nameRegex.test(firstName.value)){
        errorMessage.value = 'Enter first name correctly!'
        setTimeout(() => errorMessage.value = '', 3000)
        return
    }

    if (!lastNameRegex.test(lastName.value)){
        errorMessage.value = 'Enter last name correctly!'
        setTimeout(() => errorMessage.value = '', 3000)
        return
    }       

     if (!usernameRegex.test(username.value)){
        errorMessage.value = 'Enter username correctly!'
        setTimeout(() => errorMessage.value = '', 3000)
        return
    }

    if (!emailRegex.test(email.value)){
        errorMessage.value = 'Enter email correctly!'
        setTimeout(() => errorMessage.value = '', 3000)
        return
    }

      if (password.value.length < 8) {
        errorMessage.value = 'Password needs to be minimum 8 caracters long!'
        setTimeout(() => errorMessage.value = '', 3000)
        return
    }

  try {
        await authStore.register(firstName.value, lastName.value, username.value,email.value,password.value)
        successMessage.value = 'Account successfully created! Redirection...'
        setTimeout(() => router.push('/login'), 1000)
  } catch (e: any){
   if (e.response?.status === 409) {
    email.value = ''
    errorMessage.value = 'Email already exist!'
} else {
    firstName.value = ''
    lastName.value = ''
    username.value = ''
    password.value = ''
    errorMessage.value = 'Unable to register. Please try again!'
}
setTimeout(() => errorMessage.value = '', 3000)
  }
}
</script>
<template>
  <Breadcrumb :items="[{ label: 'Home', path: '/' }, { label: 'Register' }]" />
<form @submit.prevent="toRegister()">
    <div class="ps-5 mt-3">
        <div class="mb-3">
    <label for="inputFirstName" class="form-label fw-semibold"> First Name</label>
    <input type="text" v-model="firstName" class="form-control w-50" id="inputFirstName">
  </div>
  <div class="mb-3">
    <label for="inputLastName" class="form-labe fw-semibold"> Last Name</label>
    <input type="text" v-model="lastName" class="form-control w-50" id="inputLastName">
    </div>
     <div class="mb-3">
    <label for="inputUsername" class="form-labe fw-semibold"> Username </label>
    <input type="text" v-model="username" class="form-control w-50" id="inputUserame">
    </div>
  <div class="mb-3">
    <label for="inputEmail" class="form-label fw-semibold">Email address</label>
    <input type="email" v-model="email" class="form-control w-50" id="inputEmail" aria-describedby="emailHelp">
  </div>
  <div class="mb-3">
    <label for="inputPassword" class="form-labe fw-semibold">Password</label>
    <input type="password" v-model="password" class="form-control w-50" id="inputPassword">
  </div>
  <button type="submit" class="btn btn-outline-success fw-bold">Submit</button>
  </div>
</form>
<div v-if="errorMessage" class="alert alert-danger  w-50 ms-5 mt-2 ">{{ errorMessage }}</div>
<div v-if="successMessage" class="alert alert-success   w-50 ms-5 mt-2">{{ successMessage }}</div>
</template>