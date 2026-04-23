import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { Middleware } from "../Middleware/middleware.js";
const BookingRouter = express.Router();
const createBookingSchema = z.object({
    showId: z.string(),
    seatIds: z.array(z.string()).min(1, "Select at least one seat"),
});
BookingRouter.post("/create", Middleware, async (req, res) => {
    const parser = createBookingSchema.safeParse(req.body);
    if (!parser.success)
        return res.status(400).json({ error: parser.error.message });
    const { showId, seatIds } = parser.data;
    const userId = req.userId;
    try {
        const result = await prisma.$transaction(async (tx) => {
            const existingTickets = await tx.ticket.findMany({
                where: {
                    seatId: { in: seatIds },
                    booking: { showId: showId }
                }
            });
            if (existingTickets.length > 0) {
                throw new Error("This Seat is Already Booked!");
            }
            const booking = await tx.booking.create({
                data: {
                    userId,
                    showId,
                    status: "CONFIRMED",
                }
            });
            const tickets = await Promise.all(seatIds.map(seatId => tx.ticket.create({
                data: {
                    bookingId: booking.id,
                    seatId: seatId
                }
            })));
            return { booking, tickets };
        }, { maxWait: 5000, timeout: 10000 });
        res.status(201).json({
            message: "Booking successful! Enjoy your show.",
            bookingId: result.booking.id,
            ticketCount: result.tickets.length
        });
    }
    catch (error) {
        console.error("Booking Error:", error);
        res.status(400).json({ error: error.message || "Booking failed" });
    }
});
BookingRouter.get("/my-tickets", Middleware, async (req, res) => {
    try {
        const userId = req.userId;
        const history = await prisma.booking.findMany({
            where: { userId: userId },
            include: {
                show: {
                    include: {
                        movie: true,
                        auditorium: {
                            include: {
                                venue: true
                            }
                        }
                    }
                },
                tickets: {
                    include: {
                        seat: true
                    }
                }
            },
            orderBy: {
                id: 'desc'
            }
        });
        res.status(200).json({
            count: history.length,
            history
        });
    }
    catch (error) {
        console.error("Fetch History Error:", error);
        res.status(500).json({ error: "Failed to fetch your tickets" });
    }
});
export default BookingRouter;
//# sourceMappingURL=booking.js.map