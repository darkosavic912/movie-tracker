<script setup lang="ts">
import apiClient from '@/api/axios'
import { ref, onMounted, computed } from 'vue'
import Breadcrumb from "@/components/Breadcrumb.vue";

const watchlist = ref<any[]>([])
const selectedMovies = ref<any[]>([])
const recommendation = ref('')
const showMoodModal = ref(false)
const selectedMood = ref('')
const currentPage = ref(1)
const itemsPerPage = 8
const jumpPage = ref(1)

const moods = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 
               'Fantasy','History', 'Horor', 'Music', 'Mystery', 'Romance', 'Science Fiction', 'TV Movie', 
               'Thriller', 'War', 'Western','Surprise me']

const paginatedWatchlist = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return watchlist.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(watchlist.value.length / itemsPerPage))

function openModal() {
    if (selectedMovies.value.length === 2) {
        showMoodModal.value = true
    }
}

function nextPage() {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

function prevPage() {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

function toggleSelect(movie: any) {
    const index = selectedMovies.value.findIndex(m => m.movie_id === movie.movie_id)
    if (index > -1) {
        selectedMovies.value.splice(index, 1)
    } else if (selectedMovies.value.length < 2) {
        selectedMovies.value.push(movie)
        if (selectedMovies.value.length === 2) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }
}

async function getRecommendation() {
    showMoodModal.value = false
    const response = await apiClient.post('/ai/recommend', {
        movie1: selectedMovies.value[0],
        movie2: selectedMovies.value[1],
        mood: selectedMood.value
    })
    recommendation.value = response.data.recommendation

     setTimeout(() => {
        recommendation.value = ''
        selectedMovies.value = []
        selectedMood.value = ''
    }, 45000)
}

async function removeFromWatchlist(watchlistId: number) {
    await apiClient.delete(`/watchlist/${watchlistId}`)
    watchlist.value = watchlist.value.filter(m => m.watchlist_id !== watchlistId)
}

onMounted(async () => {
    const response = await apiClient.get('/watchlist')
    watchlist.value = response.data.watchlist
})
</script>
<template>
   <Breadcrumb :items="[{ label: 'Home', path: '/' }, { label: 'Watchlist' }]" />
  <div class="d-flex justify-content-center gap-2 mt-4 mb-4">
   <button class="btn btn-outline-success" :disabled="currentPage === 1" @click="prevPage">Previous</button>
<span class="btn btn-light">{{ currentPage }} / {{ totalPages }}</span>
<button class="btn btn-outline-success" :disabled="currentPage === totalPages" @click="nextPage">Next</button>
<input type="number" class="form-control text-center" style="width: 80px" :min="1" :max="totalPages" v-model="jumpPage"
    @keyup.enter="currentPage = Number(jumpPage)"/>
</div>
  <div class="d-flex justify-content-center">
  <button class="btn btn-outline-success fw-bold mt-3 ms-4 d-flex align-items-center" :disabled="selectedMovies.length < 2" @click="openModal">
    <i class="fa-brands fa-bots text-danger fs-3 me-2"></i> 
    <span>Recommend a movie</span>
</button>
</div>

<div v-if="showMoodModal" class="modal d-block" style="background: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">How are you felling?</h5>
            </div>
            <div class="modal-body d-flex flex-wrap gap-2">
                <button v-for="mood in moods" :key="mood" class="btn" :class="selectedMood === mood ? 'btn-success' : 'btn-outline-success'" @click="selectedMood = mood">
                    {{ mood }}
                </button>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" @click="showMoodModal = false"> Cancel </button>
                <button class="btn btn-outline-success fw-bold d-inline-flex align-items-center" :disabled="!selectedMood" @click="getRecommendation">
                <span class="me-2">Recommend!</span>
           <i class="fa-brands fa-bots text-danger fs-3"></i>
        </button>

            </div>
        </div>
    </div>
</div>
<div v-if="recommendation" class="d-flex justify-content-center mt-3">
    <div class="alert alert-success rounded-5" style="width: 60%;">
        {{ recommendation }}
    </div>
</div>

  <div v-if="watchlist.length > 0" class="row row-cols-1 row-cols-md-4 g-4 ps-4 pe-4 mt-4">
    <div v-for="movie in paginatedWatchlist" :key="movie.watchlist_id" class="col">
        <div class="card h-100 border-0 overflow-hidden">
            <img :src="movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                : '/no-poster.jpg'" 
                style="height: 600px; object-fit: cover;" class="card-img-top rounded-5" />
            <div class="card-body d-flex flex-column">
                <h6 class="fw-bold">{{ movie.title }}</h6>
                <p class="card-text small">{{ movie.overview || 'Opis nije dostupan' }}</p>
                <div class="d-flex gap-3 mb-2">
         <span> ⭐ {{ movie.vote_average > 0 ? Number(movie.vote_average).toFixed(1) : 'N/A' }}</span>
         <span> <i class="fa-solid fa-calendar-days"></i> {{ movie.release_date?.substring(0, 4) }}</span>
          </div>
       <div class="d-flex flex-wrap gap-2">
    <p v-for="genre in JSON.parse(movie.genre_ids || '[]')" :key="genre" class="badge bg-secondary me-1 mb-4 mt-3">
        {{ genre }}
    </p>
</div>
  
 <div class="d-flex gap-2 mt-auto">
    <button  class="btn btn-sm flex-fill fw-bold" :class="selectedMovies.includes(movie) ? 'btn-success' : 'btn-outline-success'" @click="toggleSelect(movie)"><i class="fa-solid fa-circle-check"></i>
        {{ selectedMovies.includes(movie) ?  ' Selected' : 'Select' }}
          </button>
       <button  @click="removeFromWatchlist(movie.watchlist_id)" class="btn btn-outline-danger btn-sm flex-fill fw-bold">
        <i class="fa-solid fa-trash-can text-danger"></i> Remove
          </button>
      </div>
            </div>
        </div>
    </div>
</div>

 <div class="d-flex justify-content-center gap-2 mt-4 mb-4">
   <button class="btn btn-outline-success" :disabled="currentPage === 1" @click="prevPage">Previous</button>
<span class="btn btn-light">{{ currentPage }} / {{ totalPages }}</span>
<button class="btn btn-outline-success" :disabled="currentPage === totalPages" @click="nextPage">Next</button>
<input type="number" class="form-control text-center" style="width: 80px" :min="1"  :max="totalPages" v-model="jumpPage"
    @keyup.enter="currentPage = Number(jumpPage)"/>
</div>
</template>
