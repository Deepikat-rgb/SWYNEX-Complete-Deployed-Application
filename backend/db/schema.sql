-- Run this in the queueless_canteen database if these tables do not already exist.
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Other',
  price_paise INTEGER NOT NULL CHECK (price_paise > 0),
  is_available BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  token_no INTEGER UNIQUE,
  customer_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Placed'
    CHECK (status IN ('Placed', 'Preparing', 'Ready', 'Collected')),
  total_paise INTEGER NOT NULL CHECK (total_paise >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  name_snapshot VARCHAR(100) NOT NULL,
  unit_price_paise INTEGER NOT NULL CHECK (unit_price_paise > 0),
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 50)
);
