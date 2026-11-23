import { Router } from "express";
import { getAllMovies,getMovieById, getPopularMovies, getTopRated, getByGenre,} from "../controllers/movie.controllers.ts";

const router = Router();

router.get("/", getAllMovies);
router.get("/popular", getPopularMovies);
router.get("/top-rated", getTopRated);
router.get("/genre", getByGenre);
router.get("/:id", getMovieById);

export default router;
