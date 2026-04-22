import express from "express";
import { prisma } from "../lib/prisma.js";
import { Middleware } from "../Middleware/middleware.js";
import { redis } from "../lib/redis.js";

const ShowRouter = express.Router();

ShowRouter.get("/:showId/seats", async (req, res) => {
  try {
    const { showId } = req.params;
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
    const allSeats = await prisma.seat.findMany({
      where: { auditoriumId: show.auditoriumId },
      orderBy: [{ row: 'asc' }, { number: 'asc' }]
    });
    const soldTickets = await prisma.ticket.findMany({
      where: { booking: { showId: showId } },
      select: { seatId: true }
    });

    const bookedSeatIds = soldTickets.map(ticket => ticket.seatId);
    const seatingMatrix = allSeats.map(seat => ({
      id: seat.id,
      row: seat.row,
      number: seat.number,
      category: seat.category,
      isBooked: bookedSeatIds.includes(seat.id)
    }));
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
    const currentLock = await redis.get(lockKey);
    if (currentLock && currentLock !== userId) {
      return res.status(400).json({
        error: "Seat is currently reserved by another user. Try again in 5 minutes."
      });
    }
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
    res.status(200).json({ shows });
  } catch (error) {
    console.error("Fetch Trending Shows Error:", error);
    res.status(500).json({ error: "Failed to fetch trending shows" });
  }
});
export default ShowRouter;