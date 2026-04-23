import "dotenv/config";
import express from "express";
import cors from "cors"
const app = express();
app.use(cors({
  origin: 'https://tix-flow-beta.vercel.app/',
  credentials: true 
}));
app.use(express.json())
import AuthRouter from "./routes/auth.js";
import MovieRouter from "./routes/movies.js";
import EventRouter from "./routes/events.js";
import AdminRouter from "./routes/admin.js";
import ShowRouter from "./routes/show.js";
import BookingRouter from "./routes/booking.js";
app.use("/api/v1/auth",AuthRouter)
app.use("/api/v1/movies",MovieRouter)
app.use("/api/v1/events",EventRouter)
app.use("/api/v1/admin",AdminRouter)
app.use("/api/v1/shows",ShowRouter)
app.use("/api/v1/booking",BookingRouter)



app.listen(3001)
