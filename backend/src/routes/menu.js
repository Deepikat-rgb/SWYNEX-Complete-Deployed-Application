const express = require("express");
const pool = require("../db");

const router = express.Router();

function validMenuInput(body, partial = false) {
  const errors = [];
  if (!partial || body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.trim().length > 100) {
      errors.push("name must contain 2 to 100 characters");
    }
  }
  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0 || price > 100000 || Math.round(price * 100) !== price * 100) {
      errors.push("price must be a positive amount with at most 2 decimal places");
    }
  }
  if (body.category !== undefined &&
      (typeof body.category !== "string" || body.category.trim().length < 2 || body.category.trim().length > 50)) {
    errors.push("category must contain 2 to 50 characters");
  }
  if (body.available !== undefined && typeof body.available !== "boolean") {
    errors.push("available must be true or false");
  }
  return errors;
}

function mapItem(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price_paise / 100,
    available: row.is_available
  };
}

// GET /api/menu - list menu items
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM menu_items ORDER BY category, name");
    res.json(result.rows.map(mapItem));
  } catch (err) { next(err); }
});

// POST /api/menu - create a menu item (validated)
router.post("/", async (req, res, next) => {
  const errors = validMenuInput(req.body);
  if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

  try {
    const { name, price, category = "Other", available = true } = req.body;
    const result = await pool.query(
      `INSERT INTO menu_items (name, category, price_paise, is_available)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), category.trim(), Math.round(Number(price) * 100), available]
    );
    res.status(201).json(mapItem(result.rows[0]));
  } catch (err) { next(err); }
});

// PATCH /api/menu/:id - update selected fields
router.patch("/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid menu item id" });
  const allowed = ["name", "price", "category", "available"];
  if (!Object.keys(req.body).length || Object.keys(req.body).some(k => !allowed.includes(k))) {
    return res.status(400).json({ error: "Provide one or more allowed fields: name, price, category, available" });
  }
  const errors = validMenuInput(req.body, true);
  if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

  try {
    const current = await pool.query("SELECT * FROM menu_items WHERE id = $1", [id]);
    if (!current.rowCount) return res.status(404).json({ error: "Menu item not found" });
    const old = current.rows[0];
    const updated = {
      name: req.body.name === undefined ? old.name : req.body.name.trim(),
      category: req.body.category === undefined ? old.category : req.body.category.trim(),
      price_paise: req.body.price === undefined ? old.price_paise : Math.round(Number(req.body.price) * 100),
      is_available: req.body.available === undefined ? old.is_available : req.body.available
    };
    const result = await pool.query(
      `UPDATE menu_items SET name=$1, category=$2, price_paise=$3, is_available=$4
       WHERE id=$5 RETURNING *`,
      [updated.name, updated.category, updated.price_paise, updated.is_available, id]
    );
    res.json(mapItem(result.rows[0]));
  } catch (err) { next(err); }
});

// DELETE /api/menu/:id
router.delete("/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid menu item id" });
  try {
    const result = await pool.query("DELETE FROM menu_items WHERE id=$1 RETURNING id", [id]);
    if (!result.rowCount) return res.status(404).json({ error: "Menu item not found" });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
