-- Multi-Layer Data Model: Microfactory Integrations Layer
-- Manufacturing orders, production tracking, inventory

-- ============================================
-- MANUFACTURING ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS manufacturing_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number text UNIQUE NOT NULL,
    created_by uuid REFERENCES users(id),
    design_project_id uuid REFERENCES design_projects(id) ON DELETE SET NULL,
    order_type text NOT NULL, -- 'prototype', 'production', 'custom'
    status text DEFAULT 'pending', -- 'pending', 'quoted', 'approved', 'in_production', 'completed', 'shipped', 'cancelled'
    quantity integer NOT NULL,
    unit_price numeric(10,2),
    total_price numeric(10,2),
    currency text DEFAULT 'USD',
    specifications jsonb DEFAULT '{}'::jsonb, -- Material, finish, dimensions, etc
    shipping_address jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_manufacturing_orders_created_by ON manufacturing_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_manufacturing_orders_status ON manufacturing_orders(status);
CREATE INDEX IF NOT EXISTS idx_manufacturing_orders_order_number ON manufacturing_orders(order_number);

-- ============================================
-- PRODUCTION TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS production_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES manufacturing_orders(id) ON DELETE CASCADE,
    stage text NOT NULL, -- 'design_review', 'material_prep', 'manufacturing', 'quality_check', 'packaging', 'shipping'
    status text DEFAULT 'in_progress', -- 'in_progress', 'completed', 'blocked', 'failed'
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    operator_id uuid REFERENCES users(id),
    notes text,
    quality_metrics jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_production_tracking_order_id ON production_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_production_tracking_stage ON production_tracking(stage, status);

-- ============================================
-- INVENTORY ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sku text UNIQUE NOT NULL,
    name text NOT NULL,
    category text,
    description text,
    unit_cost numeric(10,2),
    quantity_on_hand integer DEFAULT 0,
    quantity_reserved integer DEFAULT 0,
    reorder_point integer DEFAULT 0,
    supplier_info jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);

-- ============================================
-- INVENTORY TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id uuid REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type text NOT NULL, -- 'receipt', 'issue', 'adjustment', 'return', 'transfer'
    quantity integer NOT NULL,
    unit_cost numeric(10,2),
    order_id uuid REFERENCES manufacturing_orders(id) ON DELETE SET NULL,
    performed_by uuid REFERENCES users(id),
    notes text,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_order_id ON inventory_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);

-- ============================================
-- MICROFACTORY CAPABILITIES
-- ============================================
CREATE TABLE IF NOT EXISTS microfactory_capabilities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    capability_name text NOT NULL UNIQUE,
    capability_type text NOT NULL, -- '3d_printing', 'cnc', 'laser_cutting', 'electronics', 'assembly'
    description text,
    specifications jsonb DEFAULT '{}'::jsonb, -- Max dimensions, materials, precision, etc
    is_available boolean DEFAULT true,
    hourly_rate numeric(10,2),
    setup_time_minutes integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_microfactory_capabilities_type ON microfactory_capabilities(capability_type);
CREATE INDEX IF NOT EXISTS idx_microfactory_capabilities_available ON microfactory_capabilities(is_available);

COMMENT ON TABLE manufacturing_orders IS 'Manufacturing order management';
COMMENT ON TABLE production_tracking IS 'Production stage tracking';
COMMENT ON TABLE inventory_items IS 'Inventory item master data';
COMMENT ON TABLE inventory_transactions IS 'Inventory movement transactions';
COMMENT ON TABLE microfactory_capabilities IS 'Available manufacturing capabilities';



