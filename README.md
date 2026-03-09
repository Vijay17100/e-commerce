# Simple E-Commerce Web Application

A full-stack e-commerce application built with React, TypeScript, Tailwind CSS, Flask, and PostgreSQL.

## Folder Structure

```text
ecommerce/
├── backend/                  # Flask Backend
│   ├── app.py                # Main Flask application and routes
│   ├── models.py             # SQLAlchemy models
│   ├── requirements.txt      # Python dependencies
│   └── schema.sql            # PostgreSQL schema and seed data
└── frontend/                 # React Frontend
    ├── index.html            # Entry HTML
    ├── package.json          # Node dependencies
    ├── tailwind.config.js    # Tailwind configuration
    ├── postcss.config.js     # PostCSS configuration
    └── src/
        ├── App.tsx           # React router and app shell
        ├── index.css         # Tailwind directives
        ├── api/
        │   └── axios.ts      # Axios instance with JWT interceptor
        ├── components/
        │   └── Navbar.tsx    # Navigation bar component
        ├── context/
        │   └── AuthContext.tsx # JWT Authentication context
        └── pages/
            ├── Login.tsx     # Login page
            ├── Signup.tsx    # Signup page
            ├── Products.tsx  # Product listing page
            └── MyOrders.tsx  # User orders history page
```

## Prerequisites
- Node.js (v20+)
- Python (v3.10+)
- PostgreSQL installed and running locally

## Database Setup

1. Open `pgAdmin` or your terminal and create a database named `ecommerce_db`.
    ```sql
    CREATE DATABASE ecommerce_db;
    ```
2. (Optional) You can run the sql commands in `backend/schema.sql` to manually create the tables and seed mock products, OR you can let SQLAlchemy create the tables automatically when the Flask app starts.

## Backend Setup (Flask)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables. You can edit the top of `app.py` or export them in your terminal depending on your local PostgreSQL credentials:
   ```bash
   export POSTGRES_USER=postgres
   export POSTGRES_PASSWORD=postgres
   export POSTGRES_HOST=localhost
   export POSTGRES_DB=ecommerce_db
   ```
   *(On Windows PowerShell use `$env:POSTGRES_USER="postgres"`)*
5. Run the Flask application:
   ```bash
   python app.py
   ```
   The backend will start at `http://localhost:5000`. It will automatically create missing tables.

## Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL provided by Vite (typically `http://localhost:5173`).

## Usage Guide
1. Create a user account on the `/signup` page.
2. Log in using your credentials at `/login`.
3. Browse products and click "Buy Now" to simulate placing an order.
4. Navigate to the "My Orders" tab to view your past purchases.
