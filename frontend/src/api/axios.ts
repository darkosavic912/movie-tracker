import axios from 'axios'

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true
})

apiClient.interceptors.response.use(
    response => response,
    async error => {
         const isPasswordChange = error.config.url.includes('/profile')
        if (error.response?.status === 401 && !error.config.url.includes('/auth/login') && !isPasswordChange) {
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default apiClient