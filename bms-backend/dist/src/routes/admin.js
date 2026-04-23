import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { Middleware } from "../Middleware/middleware.js";
import { adminMiddleware } from "../Middleware/adminMiddleware.js";
const AdminRouter = express.Router();
const createEventSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    artist: z.string(),
    category: z.enum(["COMEDY", "MUSIC", "SPORTS", "THEATER_PLAY", "OTHER"]),
    posterUrl: z.url(),
    durationMin: z.number().int().positive("Duration must be a positive number"),
});
const createVenueSchema = z.object({
    name: z.string().min(2, "Venue name required"),
    location: z.string().min(5, "Location required"),
    auditoriums: z.array(z.object({
        name: z.string(),
        totalRows: z.number().int().positive(),
        seatsPerRow: z.number().int().positive(),
    })).min(1, "At least one auditorium is required"),
});
AdminRouter.post("/venue", Middleware, adminMiddleware, async (req, res) => {
    const parser = createVenueSchema.safeParse(req.body);
    if (!parser.success) {
        return res.status(400).json({ error: parser.error.message });
    }
    const { name, location, auditoriums } = parser.data;
    try {
        const newVenue = await prisma.$transaction(async (tx) => {
            const venue = await tx.venue.create({
                data: { name, location },
            });
            for (const audConfig of auditoriums) {
                const auditorium = await tx.auditorium.create({
                    data: {
                        name: audConfig.name,
                        venueId: venue.id,
                    },
                });
                const seatsToInsert = [];
                const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                for (let r = 0; r < audConfig.totalRows; r++) {
                    const rowLetter = alphabet[r] || `R${r}`;
                    for (let s = 1; s <= audConfig.seatsPerRow; s++) {
                        let category = "PREMIUM";
                        if (r < 2)
                            category = "VIP";
                        else if (r >= audConfig.totalRows - 3)
                            category = "REGULAR";
                        seatsToInsert.push({
                            row: rowLetter,
                            number: s,
                            category: category,
                            auditoriumId: auditorium.id,
                        });
                    }
                }
                await tx.seat.createMany({
                    data: seatsToInsert,
                });
            }
            return venue;
        });
        res.status(201).json({
            message: "Venue, Auditoriums, and Seats generated successfully!",
            venueId: newVenue.id,
        });
    }
    catch (error) {
        console.error("Admin Creation Error:", error);
        res.status(500).json({ error: "Failed to build the venue." });
    }
});
AdminRouter.post("/event", Middleware, adminMiddleware, async (req, res) => {
    const parser = createEventSchema.safeParse(req.body);
    if (!parser.success) {
        return res.status(400).json({ error: parser.error.message });
    }
    try {
        const event = await prisma.event.create({
            data: parser.data,
        });
        res.status(201).json({ message: "Event added successfully!", event });
    }
    catch (error) {
        console.error("Event Creation Error:", error);
        res.status(500).json({ error: "Failed to add event." });
    }
});
AdminRouter.post("/movie", Middleware, adminMiddleware, async (req, res) => {
    try {
        const { title, description, language, durationMin, posterUrl } = req.body;
        // ADD THIS CHECK: Don't create if it already exists
        const existingMovie = await prisma.movie.findFirst({ where: { title } });
        if (existingMovie) {
            return res.status(400).json({ error: "A movie with this title already exists!" });
        }
        const movie = await prisma.movie.create({
            data: {
                title,
                description,
                language,
                durationMin,
                posterUrl
            }
        });
        res.status(201).json({
            message: "Movie added successfully!",
            movieId: movie.id
        });
    }
    catch (error) {
        console.error("Movie Creation Error:", error);
        res.status(500).json({ error: "Failed to add movie." });
    }
});
AdminRouter.post("/show", Middleware, adminMiddleware, async (req, res) => {
    try {
        const { movieId, auditoriumId, startTime, regularPrice, premiumPrice, vipPrice } = req.body;
        const show = await prisma.show.create({
            data: {
                movieId,
                auditoriumId,
                startTime: new Date(startTime),
                regularPrice,
                premiumPrice,
                vipPrice
            }
        });
        res.status(201).json({ message: "Show scheduled!", showId: show.id });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to schedule show." });
    }
});
AdminRouter.delete("/movie/:movieId", Middleware, adminMiddleware, async (req, res) => {
    try {
        const { movieId } = req.params;
        if (typeof movieId !== "string") {
            return;
        }
        await prisma.$transaction([
            prisma.show.deleteMany({ where: { movieId } }),
            prisma.movie.delete({ where: { id: movieId } })
        ]);
        res.status(200).json({
            message: "Movie and all associated shows deleted successfully!"
        });
    }
    catch (error) {
        console.error("Delete Movie Error:", error);
        res.status(500).json({
            error: "Failed to delete movie. There might be active bookings preventing deletion."
        });
    }
});
AdminRouter.delete("/show/:showId", Middleware, adminMiddleware, async (req, res) => {
    try {
        const { showId } = req.params;
        if (typeof showId !== "string") {
            return;
        }
        await prisma.$transaction([
            prisma.booking.deleteMany({ where: { showId: showId } }),
            prisma.show.delete({ where: { id: showId } })
        ]);
        res.status(200).json({
            message: "Event cancelled and all associated tickets refunded/removed."
        });
    }
    catch (error) {
        console.error("Cancel Event Error:", error);
        res.status(500).json({
            error: "Failed to cancel event. Please check the database logs."
        });
    }
});
AdminRouter.get("/dropdown-data", Middleware, adminMiddleware, async (req, res) => {
    try {
        const movies = await prisma.movie.findMany({
            select: { id: true, title: true }
        });
        const auditoriums = await prisma.auditorium.findMany({
            include: { venue: true }
        });
        res.status(200).json({ movies, auditoriums });
    }
    catch (error) {
        console.error("Dropdown Data Error:", error);
        res.status(500).json({ error: "Failed to fetch dropdown data." });
    }
});
export default AdminRouter;
//# sourceMappingURL=admin.js.map