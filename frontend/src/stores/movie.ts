import apiClient from "@/api/axios";
import { ref } from "vue"
import { defineStore } from 'pinia' 

export const useMovieStore = defineStore('movie',() => {
    const movies = ref<any[]>([])
    const searchQuery = ref('')
    const currentPage = ref(1)
    const searchActive = ref(false)
    const totalPages = ref(0)
    const isTopRated = ref(false)
    const isPopularMovies = ref(false)
    const selectedGenre = ref(0)

async function searchMovies(page = 1) {
    try {
      const response = await apiClient.get('/movies', {
        params: {query: searchQuery.value, page: page}
    });
    movies.value = response.data.results
    totalPages.value = response.data.total_pages
    searchActive.value = true
    currentPage.value = page
    isTopRated.value = false
    isPopularMovies.value = false
    selectedGenre.value = 0
    window.scrollTo(0, 0)
    } catch (e){
        console.error(e)
    }
 }

async function addToWatchlist(movie: any) {
    const detailsResponse = await apiClient.get(`/movies/${movie.id}`)
    const movieDetails = detailsResponse.data
    
    await apiClient.post('/watchlist', {
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        overview: movie.overview,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        genre_ids: JSON.stringify(movieDetails.genres?.map((g: any) => g.name) || []),
        status: 'want_to_watch'
    })
}

async function getPopularMovies(page = 1) {
    try {
    const response = await apiClient.get('/movies/popular', {
        params: { page, _t: Date.now()}
    })
    movies.value = response.data.results
    console.log("Page number " + currentPage.value)
    totalPages.value = response.data.total_pages
    currentPage.value = page
    searchActive.value = false
    searchQuery.value = ''
    isTopRated.value = false
    isPopularMovies.value = true
    selectedGenre.value = 0
    window.scrollTo(0, 0)
    } catch (e){
        console.error(e)
    }
}

async function getTopRated(page = 1) {
    try {
        const response = await apiClient.get('/movies/top-rated', {
            params: { page, _t: Date.now() }
        })
        movies.value = response.data.results
        totalPages.value = response.data.total_pages
        currentPage.value = page
        searchActive.value = false
        searchQuery.value = ''
        isTopRated.value = true
        isPopularMovies.value = false
        selectedGenre.value = 0
        window.scrollTo(0, 0)
    } catch (e) {
        console.error(e)
    }
}

async function getByGenre(genre_id: number, page = 1) {
    try {
        const response = await apiClient.get('/movies/genre', {
            params: { genre_id, page, _t: Date.now() }
        })
        movies.value = response.data.results
        totalPages.value = response.data.total_pages
        currentPage.value = page
        searchActive.value = false
        searchQuery.value = ''
        selectedGenre.value = genre_id
        isTopRated.value = false
        window.scrollTo(0, 0)
    } catch (e) {
        console.error(e)
    }
}

 return { movies, searchQuery, searchMovies, searchActive, getPopularMovies,addToWatchlist, currentPage, totalPages, isTopRated, getTopRated, getByGenre, selectedGenre}
})
   
