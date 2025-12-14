-- Gemini AI Analysis Table
-- Stores DRAG analysis, SEO training results, and AI processing data

CREATE TABLE IF NOT EXISTS lead_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL, -- 'drag_analysis', 'seo_training', 'smart_sort'
    analysis_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lead_id, analysis_type)
);

CREATE INDEX IF NOT EXISTS idx_lead_analysis_lead_id ON lead_analysis(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_analysis_type ON lead_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_lead_analysis_created_at ON lead_analysis(created_at);
