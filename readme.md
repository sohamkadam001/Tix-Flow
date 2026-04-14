# 🎬 TixFlow | High-Concurrency Event Booking Engine

TixFlow is a premium movie and event booking platform built with a focus on system design, concurrency control, and a high-fidelity user experience. 

It solves the "Double Booking Problem" using a distributed locking strategy, ensuring that even under heavy traffic, seat integrity remains absolute.

---

## 🛠 Tech Stack & Architecture

### **Core Engine (Backend)**
- **Runtime:** Node.js with TypeScript
- **Database:** PostgreSQL via **Neon DB**
- **ORM:** Prisma (Handling complex relational schemas for Venues, Shows, and Seats)
- **Caching & Concurrency:** **Redis (Upstash)** - Implements temporary 5-minute seat locks to prevent race conditions.
- **Security:** JWT-based Auth with custom Middleware for Admin and User role segregation.

### **The Experience (Frontend)**
- **Framework:** **Next.js 14** (App Router)
- **Styling:** Tailwind CSS (Dark Mode optimized)
- **Components:** Radix UI / **Shadcn UI**
- **State Management:** React Hooks + Axios Interceptors for seamless API communication.

🔥 Key Features Implemented
✅ Distributed Seat Locking: Using Redis SETNX logic to hold seats for 5 minutes during checkout.

✅ Atomic Transactions: Prisma $transaction ensures that seat status and booking records are updated simultaneously or not at all.

✅ Tiered Seating: Dynamic generation of Standard, Premium, and VIP seat matrices for any auditorium.

✅ Admin Suite: Full CRUD capabilities for movies, show timings, and event management.