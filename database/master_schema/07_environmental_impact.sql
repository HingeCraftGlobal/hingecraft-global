-- Multi-Layer Data Model: Environmental Impact Reporting Layer
-- Carbon footprint, sustainability metrics, impact tracking

-- ============================================
-- ENVIRONMENTAL IMPACT RECORDS
-- ============================================
CREATE TABLE IF NOT EXISTS environmental_impact_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    record_type text NOT NULL, -- 'project', 'order', 'event', 'user', 'organization'
    record_id uuid NOT NULL, -- References the related record
    impact_category text NOT NULL, -- 'carbon', 'water', 'waste', 'energy', 'biodiversity'
    metric_name text NOT NULL, -- 'co2_equivalent', 'water_liters', 'waste_kg', 'energy_kwh'
    metric_value numeric(12,4) NOT NULL,
    unit text NOT NULL, -- 'kg', 'liters', 'kwh', 'trees'
    calculation_method text, -- 'lca', 'estimated', 'measured', 'offset'
    calculation_details jsonb DEFAULT '{}'::jsonb,
    period_start timestamptz,
    period_end timestamptz,
    recorded_by uuid REFERENCES users(id),
    verified boolean DEFAULT false,
    verified_by uuid REFERENCES users(id),
    verified_at timestamptz,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_env_impact_record_type_id ON environmental_impact_records(record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_env_impact_category ON environmental_impact_records(impact_category);
CREATE INDEX IF NOT EXISTS idx_env_impact_period ON environmental_impact_records(period_start, period_end);

-- ============================================
-- CARBON OFFSETS
-- ============================================
CREATE TABLE IF NOT EXISTS carbon_offsets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    offset_type text NOT NULL, -- 'renewable_energy', 'reforestation', 'carbon_capture', 'conservation'
    project_name text NOT NULL,
    project_location jsonb DEFAULT '{}'::jsonb, -- {country, region, coordinates}
    co2_equivalent_tons numeric(10,4) NOT NULL,
    certificate_number text UNIQUE,
    verification_standard text, -- 'VCS', 'Gold Standard', 'CAR', etc
    purchase_date date,
    purchase_price numeric(10,2),
    purchased_by uuid REFERENCES users(id),
    applied_to_record_type text,
    applied_to_record_id uuid,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_carbon_offsets_purchased_by ON carbon_offsets(purchased_by);
CREATE INDEX IF NOT EXISTS idx_carbon_offsets_applied ON carbon_offsets(applied_to_record_type, applied_to_record_id);

-- ============================================
-- SUSTAINABILITY GOALS
-- ============================================
CREATE TABLE IF NOT EXISTS sustainability_goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_name text NOT NULL,
    goal_type text NOT NULL, -- 'carbon_neutral', 'zero_waste', 'water_positive', 'biodiversity_net_positive'
    target_value numeric(12,4),
    target_unit text,
    target_date date,
    current_value numeric(12,4) DEFAULT 0,
    scope text, -- 'organization', 'project', 'user', 'product'
    scope_id uuid,
    status text DEFAULT 'active', -- 'active', 'achieved', 'cancelled'
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    achieved_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_sustainability_goals_type ON sustainability_goals(goal_type, status);
CREATE INDEX IF NOT EXISTS idx_sustainability_goals_scope ON sustainability_goals(scope, scope_id);

-- ============================================
-- IMPACT REPORTING PERIODS
-- ============================================
CREATE TABLE IF NOT EXISTS impact_reporting_periods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name text NOT NULL,
    period_type text NOT NULL, -- 'monthly', 'quarterly', 'annual', 'custom'
    start_date date NOT NULL,
    end_date date NOT NULL,
    report_status text DEFAULT 'draft', -- 'draft', 'in_review', 'published', 'archived'
    total_carbon_tons numeric(12,4) DEFAULT 0,
    total_water_liters numeric(12,4) DEFAULT 0,
    total_waste_kg numeric(12,4) DEFAULT 0,
    total_energy_kwh numeric(12,4) DEFAULT 0,
    offsets_applied_tons numeric(12,4) DEFAULT 0,
    net_impact_tons numeric(12,4) DEFAULT 0,
    generated_by uuid REFERENCES users(id),
    generated_at timestamptz,
    published_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_impact_reporting_periods_dates ON impact_reporting_periods(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_impact_reporting_periods_status ON impact_reporting_periods(report_status);

COMMENT ON TABLE environmental_impact_records IS 'Environmental impact measurements';
COMMENT ON TABLE carbon_offsets IS 'Carbon offset purchases and applications';
COMMENT ON TABLE sustainability_goals IS 'Sustainability targets and goals';
COMMENT ON TABLE impact_reporting_periods IS 'Aggregated impact reports by period';

