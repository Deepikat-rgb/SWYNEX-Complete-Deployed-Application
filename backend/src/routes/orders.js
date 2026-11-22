const express = require("express");
const pool = require("../db");

const router = express.Router();
const STATUSES = ["Placed", "Preparing", "Ready", "Collected"];

async function getOrder(client, id) {
  const orderResult = await client.query("SELECT * FROM orders WHERE id=$1", [id]);
  if (!orderResult.rowCount) return null;
  const order = orderResult.rows[0];
  const itemsResult = await client.query(
    "SELECT menu_item_id AS id, name_snapshot AS name, unit_price_paise, quantity AS qty FROM order_items WHERE order_id=$1 ORDER BY id",
    [id]
  );
  return {
    id: order.id,
    token: order.token_no,
    name: order.customer_name,
    status: order.status,
    total: order.total_paise / 100,
    createdAt: order.created_at,
    items: itemsResult.rows.map(i => ({
      id: i.id, name: i.name, price: i.unit_price_paise / 100, qty: i.qty
    }))
  };
}

// POST /api/orders - create order and its items in one transaction
router.post("/", async (req, res, next) => {
  const { name, items } = req.body;
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({ error: "name must contain 2 to 100 characters" });
  }
  if (!Array.isArray(items) || items.length < 1 || items.length > 20) {
    return res.status(400).json({ error: "items must contain 1 to 20 menu entries" });
  }
  const seen = new Set();
  for (const item of items) {
    if (!Number.isInteger(Number(item.id)) || Number(item.id) < 1 ||
        !Number.isInteger(Number(item.qty)) || Number(item.qty) < 1 || Number(item.qty) > 50) {
      return res.status(400).json({ error: "Each item needs a valid id and quantity from 1 to 50" });
    }
    if (seen.has(Number(item.id))) return res.status(400).json({ error: "Do not repeat the same menu item; combine its quantity" });
    seen.add(Number(item.id));
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ids = items.map(i => Number(i.id));
    const menuResult = await client.query(
      "SELECT * FROM menu_items WHERE id = ANY($1::int[]) AND is_available = TRUE FOR SHARE",
      [ids]
    );
    if (menuResult.rowCount !== ids.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "One or more menu items do not exist or are unavailable" });
    }
    const menuById = new Map(menuResult.rows.map(m => [m.id, m]));
    const lines = items.map(i => {
      const m = menuById.get(Number(i.id));
      return { menu: m, qty: Number(i.qty) };
    });
    const totalPaise = lines.reduce((sum, line) => sum + line.menu.price_paise * line.qty, 0);

    const inserted = await client.query(
      "INSERT INTO orders (customer_name, total_paise) VALUES ($1, $2) RETURNING id",
      [name.trim(), totalPaise]
    );
    const orderId = inserted.rows[0].id;
    const token = orderId + 100;
    await client.query("UPDATE orders SET token_no=$1 WHERE id=$2", [token, orderId]);

    for (const line of lines) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, name_snapshot, unit_price_paise, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, line.menu.id, line.menu.name, line.menu.price_paise, line.qty]
      );
    }
    const order = await getOrder(client, orderId);
    await client.query("COMMIT");
    res.status(201).json(order);
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

// GET /api/orders - latest orders first
router.get("/", async (req, res, next) => {
  try {
    const ids = await pool.query("SELECT id FROM orders ORDER BY created_at DESC, id DESC");
    const orders = [];
    for (const row of ids.rows) orders.push(await getOrder(pool, row.id));
    res.json(orders);
  } catch (err) { next(err); }
});

// GET /api/orders/:token - get one order by token
router.get("/:token", async (req, res, next) => {
  const token = Number(req.params.token);
  if (!Number.isInteger(token) || token < 1) return res.status(400).json({ error: "Invalid order token" });
  try {
    const found = await pool.query("SELECT id FROM orders WHERE token_no=$1", [token]);
    if (!found.rowCount) return res.status(404).json({ error: "Order not found" });
    res.json(await getOrder(pool, found.rows[0].id));
  } catch (err) { next(err); }
});

// PATCH /api/orders/:token - update order status
router.patch("/:token", async (req, res, next) => {
  const token = Number(req.params.token);
  if (!Number.isInteger(token) || token < 1) return res.status(400).json({ error: "Invalid order token" });
  if (!STATUSES.includes(req.body.status)) {
    return res.status(400).json({ error: `status must be one of: ${STATUSES.join(", ")}` });
  }
  try {
    const result = await pool.query(
      "UPDATE orders SET status=$1 WHERE token_no=$2 RETURNING id",
      [req.body.status, token]
    );
    if (!result.rowCount) return res.status(404).json({ error: "Order not found" });
    res.json(await getOrder(pool, result.rows[0].id));
  } catch (err) { next(err); }
});

module.exports = router;
