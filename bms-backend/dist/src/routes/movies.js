import express from "express";
import { prisma } from "../lib/prisma.js";
const MovieRouter = express.Router();
MovieRouter.get("/", async (req, res) => {
    try {
        const movies = await prisma.movie.findMany({
            select: {
                id: true,
                title: true,
                posterUrl: true,
                durationMin: true,
            }
        });
        res.status(200).json({ movies });
    }
    catch (error) {
        console.error("Fetch Movies Error:", error);
        res.status(500).json({ error: "Failed to fetch movies" });
    }
});
MovieRouter.get("/:id", async (req, res) => {
    try {
        const movieId = req.params.id;
        const movieDetails = await prisma.movie.findUnique({
            where: { id: movieId },
            include: {
                shows: {
                    include: {
                        auditorium: {
                            include: {
                                venue: true
                            }
                        }
                    }
                }
            }
        });
        if (!movieDetails) {
            return res.status(404).json({ error: "Movie not found" });
        }
        res.status(200).json({ movieDetails });
    }
    catch (error) {
        console.error("Fetch Movie Details Error:", error);
        res.status(500).json({ error: "Failed to fetch movie details" });
    }
});
export default MovieRouter;
//# sourceMappingURL=movies.js.map