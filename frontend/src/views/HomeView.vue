<script setup lang="ts">
import { useMovieStore } from "@/stores/movie";
import { useAuthStore } from "@/stores/auth";
import { onMounted, ref, watch } from "vue";

const movieStore = useMovieStore();
const authStore = useAuthStore();
const successMessages = ref<{ [key: number]: string }>({});
const jumpPage = ref(1);
const genreMap: { [key: number]: string } = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

async function handleAddToWatchlist(movie: any) {
  try {
    await movieStore.addToWatchlist(movie);
    successMessages.value[movie.id] = "Movie added to your watchlist! ✓";
    setTimeout(() => delete successMessages.value[movie.id], 3000);
  } catch (e: any) {
    if (e.response?.status === 409) {
      successMessages.value[movie.id] = "Movie already in your watchlist!";
      setTimeout(() => delete successMessages.value[movie.id], 3000);
    }
  }
}

function handlePageChange(page: number) {
  // Security check for page boundaries
 // if (page < 1 || page > movieStore.totalPages) return;

  if (movieStore.searchActive) {
    movieStore.searchMovies(page);
  } else if (movieStore.selectedGenre) {
    movieStore.getByGenre(movieStore.selectedGenre, page);
  } else if (movieStore.isTopRated) {
    movieStore.getTopRated(page);
  } else {
    movieStore.getPopularMovies(page);
  }
}

watch( () => movieStore.currentPage, (newPage) => {
    jumpPage.value = newPage;
  },
);

onMounted(async () => {
  if (!movieStore.searchActive) {
    await movieStore.getPopularMovies();
  }
});
</script>
<template>
  <div class="d-flex justify-content-center gap-2 mt-4 mb-2">
    <button @click="movieStore.getPopularMovies()" :class="!movieStore.isTopRated && !movieStore.selectedGenre ? 'btn-success' : 'btn-outline-success'"
      class="btn fw-bold">
      <i class="fa-solid fa-fire"></i> Popular
    </button>
    <button
      @click="movieStore.getTopRated()" :class="movieStore.isTopRated ? 'btn-success' : 'btn-outline-success'"
      class="btn fw-bold">
      <i class="fa-solid fa-star"></i> Top Rated
    </button>

    <div class="dropdown">
        <button :class="movieStore.selectedGenre ? 'btn-success' : 'btn-outline-success'" class="btn dropdown-toggle fw-bold"  data-bs-toggle="dropdown">
            <i class="fa-solid fa-masks-theater"></i>  Genre
      </button>
      <ul class="dropdown-menu">
        <li v-for="(name, id) in genreMap" :key="id">
          <button  class="dropdown-item" @click="movieStore.getByGenre(Number(id))">
            {{ name }}
          </button>
        </li>
      </ul>
    </div>
  </div>

  <div class="d-flex justify-content-center gap-2 mt-4 mb-4">
    <button   class="btn btn-outline-success"   @click="handlePageChange(movieStore.currentPage - 1)"
      :disabled="movieStore.currentPage <= 1">
      Previous
    </button>

    <span class="btn btn-light">{{ movieStore.currentPage }} / {{ movieStore.totalPages }}</span>

    <button  class="btn btn-outline-success"  @click="handlePageChange(movieStore.currentPage + 1)"
      :disabled="movieStore.currentPage >= movieStore.totalPages">
      Next
    </button>

    <input type="number" class="form-control text-center" style="width: 80px"  :min="1"  :max="movieStore.totalPages"
      v-model="jumpPage" @keyup.enter="handlePageChange(Number(jumpPage))"/>
  </div>

  <div v-if="movieStore.movies.length > 0" class="row row-cols-1 row-cols-md-4 g-4 ps-4 pe-4 mt-4">
    <div v-for="movie in movieStore.movies" :key="movie.id" class="col">
      <div class="card h-100 border-0 overflow-hidden">
        <img :src="movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-poster.jpg'"
          style="height: 600px; object-fit: cover" class="card-img-top rounded-5"/>
        <h5 class="card-title fw-bold mt-3 ps-2">{{ movie.title }}</h5>
        <div class="d-flex gap-2 mb-2">
          <span> ⭐ {{ movie.vote_average > 0 ? movie.vote_average.toFixed(1) : "N/A"}}</span>
          <span><i class="fa-solid fa-calendar-days"></i>{{ movie.release_date?.substring(0, 4) }}</span>
        </div>
      <div v-if="movie.genre_ids && movie.genre_ids.length > 0" class="d-flex flex-wrap gap-2 ms-2 mb-3">
         <span v-for="id in movie.genre_ids" :key="id" class="badge bg-secondary">
              {{ genreMap[id] || id }}
            </span>
          </div>
         <div v-else class="ms-2 mb-3">
    <span class="badge bg-secondary">Genres not available</span>
        </div>

        <p class="card-text mb-2 ps-2">
          {{ movie.overview || "Description does not available" }}
        </p>
        <div class="buttons-container">
          <RouterLink :to="`/movies/${movie.id}`">
            <button type="button" class="btn btn-outline-success btn-sm fw-semibold ms-2" style="width: 20%">
              Details
            </button>
          </RouterLink>
          <button v-if="authStore.isLoggedIn" @click="handleAddToWatchlist(movie)" class="btn btn-outline-success btn-sm fw-semibold ms-2" style="width: 40%">
            Add to watchlist
          </button>
        </div>
        <div v-if="successMessages[movie.id]" class="alert alert-success mt-2 w-100">
          {{ successMessages[movie.id] }}
        </div>
      </div>
    </div>
  </div>
  
   <div class="d-flex justify-content-center gap-2 mt-4 mb-4">
    <button   class="btn btn-outline-success"   @click="handlePageChange(movieStore.currentPage - 1)"
      :disabled="movieStore.currentPage <= 1">
      Previous
    </button>

    <span class="btn btn-light">{{ movieStore.currentPage }} / {{ movieStore.totalPages }}</span>

    <button  class="btn btn-outline-success"  @click="handlePageChange(movieStore.currentPage + 1)"
      :disabled="movieStore.currentPage >= movieStore.totalPages">
      Next
    </button>

    <input type="number" class="form-control text-center" style="width: 80px"  :min="1"  :max="movieStore.totalPages"
      v-model="jumpPage" @keyup.enter="handlePageChange(Number(jumpPage))"/>
  </div>
</template>
