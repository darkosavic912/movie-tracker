<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import apiClient from '@/api/axios'
import { useRouter } from 'vue-router'
import Breadcrumb from "@/components/Breadcrumb.vue";

const router = useRouter()
const authStore = useAuthStore()
const user = ref<any>(null)
const oldPassword = ref('')
const newPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const showOld = ref(false)
const showNew = ref(false)

async function handleChangePassword() {
     if (!oldPassword.value) {
        errorMessage.value = 'Enter current password!'
        setTimeout(() => errorMessage.value = '', 3000)
        return
    }
    if (!newPassword.value) {
        errorMessage.value = 'Enter new password!'
        setTimeout(() => errorMessage.value = '', 3000)
        return
    }
     //const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; regex for real
     // password
    if (newPassword.value.length < 8) {
        errorMessage.value = 'Password needs to be minimum 8 caracters long!'
        newPassword.value = ''
        setTimeout(() => errorMessage.value = '', 3000)
        return 
    }

    try {
        await apiClient.put('/auth/profile', {
            oldPassword: oldPassword.value,
            newPassword: newPassword.value
        })
        successMessage.value = 'Your password has been changed successfully!'
        oldPassword.value = ''
        newPassword.value = ''
        setTimeout(() => successMessage.value = '', 3000)
    } catch (e: any) {
         if (e.response?.status === 400) {
            errorMessage.value = 'The current password is incorrect!'
            oldPassword.value = ''
            newPassword.value = ''
        } else {
            errorMessage.value = 'Error changing password!'
        }
        setTimeout(() => errorMessage.value = '', 3000)
    }
}

async function handleDeleteAccount() {
   if (!confirm(`Are you sure you want to delete your account ${user.value?.username}?`)) return
    await apiClient.delete('/auth/profile')
    authStore.isLoggedIn = false
    authStore.user = null
    alert(`Account ${user.value?.username} deleted successfully!`)
    router.push('/')
}

onMounted(async () => {
    const response = await apiClient.get('/auth/me')
    user.value = response.data
})
</script>
<template>
<Breadcrumb :items="[{ label: 'Home', path: '/' }, { label: 'Profile' }]" />
<div class=" mt-4 ps-5">
    <h3 class="fw-bold mb-4"><i class="fa-solid fa-user-tie text-success"></i> My Profile</h3>
    
    <div v-if="user" class="mb-4">
        <p><i class="fa-solid fa-id-card text-success"></i>  <strong>First Name:</strong>{{  user.first_name }}</p>
        <p><i class="fa-solid fa-id-card text-success"></i>  <strong>Last Name:</strong> {{ user.last_name }}</p>
        <p><i class="fa-solid fa-at text-success"></i> <strong>Username:</strong> {{ user.username }}</p>
        <p><i class="fa-solid fa-envelope text-success"></i> <strong>Email:</strong> {{ user.email }}</p>
    </div>

    <h5 class="fw-bold">Change password</h5>
    <form @submit.prevent="handleChangePassword" class="mb-4 w-50">
         <div class="input-group mb-2">
     <input   :type="showOld ? 'text' : 'password'"   v-model="oldPassword"   placeholder="Current password"          class="form-control"/>
      <button class="btn btn-outline-secondary" type="button" @click="showOld = !showOld">
          <i :class="showOld ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
      </button>
     </div>
    
        <div class="input-group mb-2">
            <input :type="showNew ? 'text' : 'password'" v-model="newPassword" placeholder="New password" 
                class="form-control"/>
            <button class="btn btn-outline-secondary" type="button" @click="showNew = !showNew">
                <i :class="showNew ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
            </button>
        </div>
        <button type="submit" class="btn btn-outline-success fw-bold">Change password</button>
    </form>

    <h5 class="fw-bold text-danger mt-2 mb-3">Delete account</h5>
    <button @click="handleDeleteAccount" class="btn btn-outline-danger fw-bold">Delete account</button>

    <div v-if="errorMessage" class="alert alert-danger w-50 mt-3">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success w-50 mt-3">{{ successMessage }}</div>
</div>

</template>