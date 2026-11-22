# API testing checklist

Use Postman or a browser to verify the API while the backend is running.

1. `GET http://localhost:5000/api/health` – expected: JSON status `ok` and database `connected`.
2. `GET http://localhost:5000/api/menu` – expected: an array of menu items with `id`, `name`, `category`, `price`, and `available`.
3. `GET http://localhost:5000/api/orders` – expected: an array of saved orders (possibly empty at first).
4. Place a test order from the Student dashboard. Verify it appears in `GET /api/orders`.
5. From the Kitchen dashboard, advance the order. Verify its status changes to `Preparing`, `Ready`, and `Collected` in the API response.

Do not use a menu item ID that does not exist or is unavailable.
