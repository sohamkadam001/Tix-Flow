import express from "express";
import { prisma } from "../lib/prisma.js";
import { Middleware } from "../Middleware/middleware.js";
import { redis } from "../lib/redis.js";

const ShowRouter = express.Router();

ShowRouter.get("/:showId/seats", async (req, res) => {
  try {
    const { showId } = req.params;

    // 1. Fetch Show, Movie, and Venue details all at once
    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        movie: true,
        auditorium: {
          include: { venue: true }
        }
      }
    });

   if (!show || !show.movie || !show.auditorium) {
  return res.status(404).json({ error: "Show, Movie, or Auditorium not found" });
}

    // 2. Fetch Seats
    const allSeats = await prisma.seat.findMany({
      where: { auditoriumId: show.auditoriumId },
      orderBy: [ { row: 'asc' }, { number: 'asc' } ]
    });

    // 3. Fetch Sold Tickets
    const soldTickets = await prisma.ticket.findMany({
      where: { booking: { showId: showId } },
      select: { seatId: true }
    });

    const bookedSeatIds = soldTickets.map(ticket => ticket.seatId);

    // 4. Map the matrix
    const seatingMatrix = allSeats.map(seat => ({
      id: seat.id,
      row: seat.row,
      number: seat.number,
      category: seat.category, // Brings VIP/PREMIUM/REGULAR from DB
      isBooked: bookedSeatIds.includes(seat.id)
    }));

    // 5. Send EVERYTHING to the frontend
    res.status(200).json({
      showDetails: {
        title: show.movie.title,
        image: show.movie.posterUrl,
        location: show.auditorium.venue.name,
        startTime: show.startTime,
        prices: {
          REGULAR: show.regularPrice,
          PREMIUM: show.premiumPrice,
          VIP: show.vipPrice
        }
      },
      totalSeats: seatingMatrix.length,
      availableSeats: seatingMatrix.filter(s => !s.isBooked).length,
      seatingMatrix
    });

  } catch (error) {
    console.error("Seating Matrix Error:", error);
    res.status(500).json({ error: "Failed to fetch seating data" });
  }
});


ShowRouter.post("/:showId/lock", Middleware, async (req, res) => {
  try {
    const { showId } = req.params;
    const { seatId } = req.body;
    const userId = req.userId as string;
    const lockKey = `lock:${showId}:${seatId}`;

    // FIX 1: Check who owns the lock first
    const currentLock = await redis.get(lockKey);
    
    // If it's locked AND the person holding it is NOT the current user
    if (currentLock && currentLock !== userId) {
      return res.status(400).json({
        error: "Seat is currently reserved by another user. Try again in 5 minutes."
      });
    }

    // Overwrite/Extend the lock for THIS specific user without 'nx' failing
    await redis.set(lockKey, userId, { ex: 300 });

    res.status(200).json({ message: "Seat locked successfully." });
  } catch (error) {
    console.error("Lock Error:", error);
    res.status(500).json({ error: "Failed to lock seat" });
  }
});
ShowRouter.get("/", async (req, res) => {
  try {
    const shows = await prisma.show.findMany({
      include: {
        movie: true,
        auditorium: {
          include: { venue: true }
        }
      },
      orderBy: { startTime: 'asc' },
      take: 10
    });

    // We are explicitly sending { shows } so it matches the frontend!
    res.status(200).json({ shows }); 
  } catch (error) {
    console.error("Fetch Trending Shows Error:", error);
    res.status(500).json({ error: "Failed to fetch trending shows" });
  }
});
export default ShowRouter;