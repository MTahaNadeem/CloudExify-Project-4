# The Hearth - Cafe & Bakery Web Application

**Developer:** Muhammad Taha Nadeem  
**Registration Number:** CX-INT-2026-GEN-0490  
**Restaurant Concept:** Cafe & Bakery  

![The Hearth Bakery](https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=400&fit=crop)

## 🌐 Live Demo
**URL:** [https://mtn-cloudexify-project-4.vercel.app/](https://mtn-cloudexify-project-4.vercel.app/)

## 🔑 Admin Credentials (For Testing)
- **Email:** tahanadeem478@gmail.com
- **Password:** Ta123@#

---

## 📖 Overview
The Hearth is a full-stack, responsive web application for a modern Cafe & Bakery. It provides a seamless experience for customers to browse the menu, manage their cart, place orders, and track order history. For administrators, it includes a secure, real-time dashboard to manage the menu inventory and update customer order statuses.

The application uses a serverless architecture, built entirely with vanilla HTML, CSS, JavaScript, and powered by **Supabase** as the Backend-as-a-Service (BaaS) for PostgreSQL database storage and secure authentication.

## ✨ Features

### Customer Experience
- **Dynamic Menu:** Browse available items filtered by category. Items dynamically update based on admin inventory changes.
- **Cart System:** Add items to a shopping cart, adjust quantities, and calculate totals instantly via an off-canvas drawer. Session storage keeps the cart persistent across page reloads.
- **Authentication:** Secure user registration and login handled by Supabase Auth.
- **Order Tracking:** Authenticated users have a personalized dashboard to track their past orders and current order statuses in real-time.

### Admin Dashboard
*Protected via Row Level Security (RLS) and routing logic.*
- **Live Order Management:** View all customer orders in a comprehensive dashboard. Easily update statuses (`Pending`, `Preparing`, `Ready`, `Completed`) with immediate database synchronization.
- **Menu Inventory CRUD:** Create, read, update, and delete menu items directly from the UI. Toggle availability to instantly show items as "Sold Out" on the customer frontend.
- **Real-Time Analytics:** Dashboard cards display "Total Orders Today," "Revenue Today," "Pending Orders," and "Total Menu Items" utilizing efficient SQL counts.

## 🛠️ Technology Stack
- **Frontend Core:** HTML5, CSS3, Vanilla JavaScript (ES6)
- **UI Framework:** Bootstrap 5 (Grid system, components, utility classes)
- **Backend & Database:** Supabase (PostgreSQL, Authentication, Row Level Security)
- **Deployment:** Vercel

## 🚀 Local Development Setup

If you wish to run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MTahaNadeem/CloudExify-Project-4.git
   cd CloudExify-Project-4/restaurant-app
   ```

2. **Run a local server:**
   Since the app uses ES6 Modules and Fetch API, it must be served over HTTP rather than `file://`. You can use VS Code Live Server, or Python's built-in HTTP server:
   ```bash
   python -m http.server 8000
   ```
   Navigate to `http://localhost:8000` in your browser.

3. **Supabase Connection:**
   The application is already configured to connect to the cloud Supabase instance via the public `anon` key inside `js/supabase.js`. Database security is enforced securely on the backend via Row Level Security (RLS) policies.

## 🔒 Security Measures
- **Row Level Security (RLS):** Policies are enforced at the database level to ensure customers can only view and insert their own orders, while only verified Administrators can view all orders, modify order statuses, and mutate the menu items table.
- **No Secret Leakage:** Only the safe publishable `anon` key is exposed to the client.

## 📄 License
This project is part of the CloudExify Internship Program (Project 4).
