<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Breadcrumb from "@/components/Breadcrumb.vue";

const authStore = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('')

async function toLogin(){  
    if (!email.value && !password.value) {
        errorMessage.value = 'Enter email and password!'
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if(!emailRegex.test(email.value)){
        errorMessage.value = 'Enter email correctly!'
        setTimeout(() => errorMessage.value = '', 3000)
        return
    }

    try {
        await authStore.login(email.value, password.value)
        router.push('/')
    } catch (e: any) {
    if (e.response?.status === 404) {
        email.value = ''
        password.value = ''
        errorMessage.value = 'No account found with this email!'
        setTimeout(() => errorMessage.value = '', 3000)
    } else if (e.response?.status === 401) {
        password.value = ''
        errorMessage.value = 'Wrong password!'
        setTimeout(() => errorMessage.value = '', 3000)
    } else if (e.response?.status === 400) {
        errorMessage.value = 'Invalid email or password format!'
        setTimeout(() => errorMessage.value = '', 3000)
    } else {
        errorMessage.value = 'Unable to log in. Please try again!'
        setTimeout(() => errorMessage.value = '', 3000)
    }
}
}
</script>
<template>
<Breadcrumb :items="[{ label: 'Home', path: '/' }, { label: 'Login' }]" />
<form @submit.prevent="toLogin()">
    <div class="ps-5 mt-3">
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
<div v-if="errorMessage" class="alert alert-danger  w-50 ms-5 mt-2 ">
{{ errorMessage }}
 <span v-if="errorMessage === 'No account found with this email!'">
    <RouterLink to="/register" class="alert-link"> Create an account</RouterLink>
 </span>
</div>
</template>