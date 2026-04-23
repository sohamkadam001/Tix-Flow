import express from "express";
import { prisma } from "../lib/prisma.js";
const EventRouter = express.Router();
EventRouter.get("/", async (req, res) => {
    try {
        const events = await prisma.event.findMany();
        res.status(200).json({ events });
    }
    catch (error) {
        console.error("Fetch Events Error:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});
EventRouter.get("/:id", async (req, res) => {
    try {
        const eventId = req.params.id;
        const eventDetails = await prisma.event.findUnique({
            where: { id: eventId },
            include: { shows: { include: { auditorium: { include: { venue: true } } } } }
        });
        if (!eventDetails) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.status(200).json({ eventDetails });
    }
    catch (error) {
        console.error("Fetch Event Details Error:", error);
        res.status(500).json({ error: "Failed to fetch event details" });
    }
});
export default EventRouter;
//# sourceMappingURL=events.js.map