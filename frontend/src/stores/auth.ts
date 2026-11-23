import { ref } from "vue";
import { defineStore } from "pinia";
import apiClient from '@/api/axios'

export const useAuthStore = defineStore('auth', () => {
 const isLoggedIn = ref(false)
 const user = ref<any>(null)

  async function login(email: string, password: string) {
       await apiClient.post('/auth/login',{
        email,
        password,
      })

    isLoggedIn.value = true;
    const meResponse = await apiClient.get('/auth/me')
    user.value = meResponse.data
  }

  async function register( first_name: string, last_name: string, username: string, email: string, password: string) {
    await apiClient.post('/auth/register', {
      first_name, 
      last_name,
      username, 
      email,
      password
      
    });
  }

  async function logout() {
    await apiClient.post('/auth/logout',
      {},
      { withCredentials: true },
    );
    isLoggedIn.value = false;
    user.value = null;
  }

  return { isLoggedIn, user, login, logout, register };
});
