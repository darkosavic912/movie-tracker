<script setup lang="ts">
import apiClient from "@/api/axios";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useMovieStore } from '@/stores/movie'
import Breadcrumb from "@/components/Breadcrumb.vue";

const route = useRoute()
const authStore = useAuthStore()
const movieStore = useMovieStore()
const movieId = route.params.id;
const movie = ref<any>(null);
const error = ref<string | null>(null);
const comments = ref<any[]>([])
const newComment = ref('')
const successMessage = ref('')

async function getComments(){
    try {
        const response = await apiClient.get(`/comments/${movieId}`)
        comments.value = response.data.comment
    } catch (e){
        error.value = "Error while loading comments";
        console.error(e);
    }
}

async function addComment() {
    try {
        await apiClient.post(`/comments/${movieId}`, {
            tmdb_id: movie.value.id,
            title: movie.value.title,
            poster_path: movie.value.poster_path,
            overview: movie.value.overview,
            vote_average: movie.value.vote_average,
            release_date: movie.value.release_date,
            genre_ids: JSON.stringify(movie.value.genres?.map((g: any) => g.name) || []),
            text: newComment.value
        })
        newComment.value = ''
        await getComments()
    } catch (e) {
        error.value = "Failed to add comment";
        console.error(e);
    }
}

async function addToWatchlist() {
    try {
        await movieStore.addToWatchlist(movie.value)
        successMessage.value = 'Movie successfully added to your watchlist!'
        setTimeout(() => successMessage.value = '', 3000)
    } catch (e: any) {
        if (e.response?.status === 409) {
            successMessage.value = 'Movie already exist in your watchlist!'
            setTimeout(() => successMessage.value = '', 3000)
        }
    }
}

async function getMovie() {
  try {
    const response = await apiClient.get(`/movies/${movieId}`);
    movie.value = response.data;
  } catch (e) {
    error.value = "Error loading movies";
    console.error(e);
  }
}

onMounted(async () => {
  await getMovie()
  await getComments()
});

</script>
<template>
   <Breadcrumb :items="[{ label: 'Home', path: '/' }, { label: movie?.title || 'Film' }]" />
  <div v-if="movie" class="container-fluid mt-4">
     <div class="row justify-content-start ps-3">
       <div class="col-md-4 ps-5">
        <img :src="  movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : '/no-poster.jpg' "
        style="height: 750px; width: 100%; object-fit: cover"
        class="card-img-top rounded-5"/>
       </div>
    <div class="col-md-8">
      <h5 class="card-title fw-bold">{{ movie.title }}</h5>
      <p class="card-text mt-2 pe-5">{{ movie.overview || "Overview not available" }}</p>
      <p class="card-text">
         ⭐ {{ movie.vote_average > 0 ? movie.vote_average.toFixed(1) : 'N/A' }}
      </p>
      <p v-for="genre in movie.genres" :key="genre.id"  class="badge bg-secondary me-1">
        {{ genre.name }}
      </p>
      <p class="card-text"> Release date: {{ new Date(movie.release_date).toLocaleDateString('sr-RS') }}</p>
      <button v-if="authStore.isLoggedIn"  @click="addToWatchlist" class="btn btn-outline-success fw-bold">
        Add to watchlist
      </button>
     <div v-if="successMessage" class="alert alert-success mt-2 w-25">
             {{ successMessage }}
         </div>
<div class="comments mt-4">
    <h5>Comments:</h5>
    <div v-if="authStore.isLoggedIn">
        <textarea v-model="newComment" class="form-control w-75" rows="3"></textarea>
        <button @click="addComment" class="btn btn-outline-success btn-sm mt-4 fw-bold">Add comment</button>
    </div>

    <div v-else class="mt-3">
    <p class="text-muted">Would you like to leave a comment? 
        <RouterLink to="/login" class="text-success fw-bold text-decoration-none">Log in...</RouterLink>
    </p>
</div>

    <div v-for="comment in comments" :key="comment.comment_id" class="mt-3">
        <strong><i class="fa-solid fa-user-check text-success"></i> : {{ comment.username }}</strong>
        <p>{{ comment.text }}</p>
    </div>

    <div v-if="comments.length === 0" class="mt-3 text-muted">
        No comments yet for this movie.
    </div>
</div>
    </div>
  </div>
  </div>
  <div v-else class="alert alert-danger">{{ error }}</div>
</template>
