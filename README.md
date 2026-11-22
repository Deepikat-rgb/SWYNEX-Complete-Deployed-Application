# SWYNEX – Complete Deployed Application

**Internship Task 4: Complete Deployed Application**  
**Project:** Queueless Campus Canteen Management System

A full-stack canteen ordering application with a student ordering interface, staff order-management dashboard, REST API, and PostgreSQL database. The project is prepared to run locally and to be deployed as one web service with a hosted PostgreSQL database.

> **Deployment status:** This source package includes a Render deployment blueprint. The application is not live until you deploy it from your own GitHub account and complete the database setup. Add your actual public URL below after deployment; do not invent a live URL.

## Features

### Student portal
- Loads available menu items from the backend API.
- Supports cart and order placement.
- Displays order confirmation and token information.
- Shows backend connection and request errors.

### Staff dashboard
- Displays live orders and their current statuses.
- Updates order statuses: Placed, Preparing, Ready, and Collected.
- Loads menu items and supports add, availability update, and delete through the API.

### Backend and database
- Node.js and Express REST API.
- PostgreSQL data storage for menu items and orders.
- Health endpoint at `/api/health`.
- Environment-based database configuration; credentials are not committed.

## Technology stack

HTML, CSS, JavaScript, Node.js, Express.js, PostgreSQL, REST APIs, and Render deployment configuration.

## Project structure

```text
SWYNEX-Complete-Deployed-Application/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── config.js
│   ├── script.js
│   ├── admin.html
│   └── admin.js
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── db/schema.sql
│   └── src/
│       ├── db.js
│       ├── server.js
│       └── routes/
│           ├── menu.js
│           └── orders.js
├── docs/
│   ├── API-TESTING.md
│   └── screenshots/
├── render.yaml
├── .gitignore
└── README.md
```

## Run locally

### 1. Requirements

Install Node.js, PostgreSQL, and VS Code. Start PostgreSQL and create/use a database named `queueless_canteen`.

### 2. Database setup

In pgAdmin, select `queueless_canteen` and run `backend/db/schema.sql` only if the required tables do not already exist. Do not drop existing Task 2 tables or data. Ensure the `menu_items` table contains at least one available item.

### 3. Configure backend

Open a terminal in the project root and run:

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and enter your local PostgreSQL username and password. Keep `.env` private and never upload it.

Start the backend:

```bash
npm run dev
```

The API is available locally at `http://localhost:5000`.

### 4. Open the application

For the easiest local setup, open `http://localhost:5000` after starting the backend. The Node server serves the student portal and staff dashboard. The staff dashboard is at `http://localhost:5000/admin.html`.

Alternatively, use VS Code Live Server for `frontend/index.html`; `frontend/config.js` will direct local API requests to port 5000. Keep the backend terminal running.

### 5. Verify

Open `http://localhost:5000/api/health`. A successful response should show `status: ok` and `database: connected`.

Test the student menu, place a test order, then open the staff dashboard and update the order status. Use test data only.

## Deploy with Render

This repository includes `render.yaml` as a deployment blueprint. You must deploy it from your own GitHub account:

1. Push this project to a public GitHub repository, for example `SWYNEX-Complete-Deployed-Application`.
2. Sign in to Render and choose **New → Blueprint**.
3. Connect your GitHub repository and select the branch containing `render.yaml`.
4. Review the web service and PostgreSQL database resources described by the blueprint, then create them. Confirm the current plan, pricing, and database retention limits in Render before proceeding.
5. Wait for the database and web service to finish provisioning. Render supplies `DATABASE_URL` to the service through the blueprint.
6. If the database is newly created, run `backend/db/schema.sql` against that hosted database using a PostgreSQL client. Add at least one menu item for testing.
7. Open the service URL and verify `/api/health`, the student portal, and `/admin.html`.
8. Copy the actual public service URL and update the Live Application URL below.

The application uses the same origin for the frontend and API when deployed, so no separate frontend hosting configuration is needed.

### Deployment links

- **GitHub Repository:** `https://github.com/Deepikat-rgb/SWYNEX-Complete-Deployed-Application`
- **Live Application:** `https://deepikat-rgb.github.io/SWYNEX-Complete-Deployed-Application/`

Replace both placeholders with your real URLs before submission. Do not claim deployment is complete until the live URL opens successfully in a private/incognito browser window.

## Screenshots

Add screenshots captured from your own running application to `docs/screenshots/` and embed them here before submitting. Suggested screenshots:

- Student dashboard and menu.
- Order confirmation with token.
- Staff dashboard showing an order and its status.
- Successful API health response.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API and database health check |
| GET | `/api/menu` | List menu items |
| POST | `/api/menu` | Add a menu item |
| PATCH | `/api/menu/:id` | Update menu item fields or availability |
| DELETE | `/api/menu/:id` | Delete a menu item |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders` | List orders for staff |
| GET | `/api/orders/:token` | Retrieve an order by token |
| PATCH | `/api/orders/:token` | Update order status |

## Notes and limitations

- The staff PIN in the student prototype is a demonstration gate, not production authentication. Do not use this project to handle real customer data or payments without adding proper authentication, authorization, validation, and payment-provider integration.
- Any pickup-slot or payment interface that is only simulated in the frontend must be treated as a demo, not as a real booking or payment service.
- Free hosting services may sleep, have usage limits, or change their pricing and retention policies. Check the provider's current terms before deployment.

## Internship

**Organization:** SWYNEX Technologies  
**Task:** Task 4 – SWYNEX Complete Deployed Application
