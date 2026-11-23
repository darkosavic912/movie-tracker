<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useMovieStore } from '@/stores/movie';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore()
const router = useRouter()
const movieStore = useMovieStore()

async function handleSearch() {
    await movieStore.searchMovies()
    router.push('/')
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

onMounted(async () => {
    if (movieStore.movies.length === 0) {
        await movieStore.getPopularMovies()
    }
})
</script>

<template>
<nav class="navbar navbar-expand-lg bg-body-tertiary ps-5 pe-5" >
  <div class="container-fluid">
    <RouterLink class="navbar-brand fw-bold" to="/"><i class="fa-solid fa-clapperboard text-success"></i>
       Movie-Tracker
      </RouterLink>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarScroll">
      <ul class="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 100px;">
        <li class="nav-item">
          <RouterLink class="nav-link fw-bold" to="/"><i class="fa-solid fa-film text-success"></i>
            Movies
          </RouterLink>
        </li>

        <!--User is not logged in!-->
        <template v-if="!authStore.isLoggedIn">
        <li class="nav-item">
          <RouterLink class="nav-link fw-bold" to="/login"><i class="fa-solid fa-right-to-bracket text-success"></i>
            Login
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link fw-bold" to="/register"><i class="fa-solid fa-user-plus text-success"></i>
            Register
          </RouterLink>
          </li>
        </template>

        <template v-else>
          <li class="nav-item">
            <RouterLink class="nav-link fw-bold" to="/watchlist"> <i class="fa-solid fa-eye text-success"></i> Watchlist</RouterLink>
        </li>
         <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle fw-bold" href="#" role="button" data-bs-toggle="dropdown">
            <i class="fa-solid fa-circle-user text-success"></i> {{ authStore.user?.username || 'User' }}
        </a>
        <ul class="dropdown-menu">
            <li><RouterLink class="dropdown-item fw-bold" to="/profile"><i class="fa-solid fa-user text-success"></i>  Profile</RouterLink></li>
            <li><hr class="dropdown-divider"></li>
            <li><button class="dropdown-item text-danger fw-bold" @click="handleLogout"><i class="fa-solid fa-arrow-right-to-bracket text-danger"></i>  Logout</button></li>
            </ul>
        </li>
        </template>
      </ul>
     <form class="d-flex ms-auto" style="width: 500px;" role="search" @submit.prevent="handleSearch">
        <input class="form-control me-2" type="search" v-model="movieStore.searchQuery" placeholder="Search movies . . ." aria-label="Search"/>
        <button class="btn btn-outline-success fw-semibold" type="submit">Search</button>
      </form>
    </div>
  </div>
</nav>
</template>
<style scooped>
button.nav-link:hover {
    background-color: #f8f9fa;
    color: red !important;
}
</style>
