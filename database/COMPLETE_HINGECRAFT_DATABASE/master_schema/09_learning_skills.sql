-- Multi-Layer Data Model: Learning & Skill Progression Metrics Layer
-- Courses, skills, certifications, learning paths

-- ============================================
-- LEARNING COURSES
-- ============================================
CREATE TABLE IF NOT EXISTS learning_courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code text UNIQUE,
    title text NOT NULL,
    description text,
    category text, -- 'design', 'engineering', 'business', 'sustainability', 'community'
    difficulty_level text DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced', 'expert'
    estimated_hours integer,
    instructor_id uuid REFERENCES users(id),
    status text DEFAULT 'draft', -- 'draft', 'published', 'archived'
    enrollment_count integer DEFAULT 0,
    rating_average numeric(3,2) DEFAULT 0,
    rating_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    published_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_learning_courses_category ON learning_courses(category);
CREATE INDEX IF NOT EXISTS idx_learning_courses_status ON learning_courses(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_courses_code ON learning_courses(course_code);

-- ============================================
-- COURSE MODULES
-- ============================================
CREATE TABLE IF NOT EXISTS course_modules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES learning_courses(id) ON DELETE CASCADE,
    module_number integer NOT NULL,
    title text NOT NULL,
    description text,
    content_type text, -- 'video', 'reading', 'quiz', 'assignment', 'project'
    content_url text,
    estimated_minutes integer,
    display_order integer DEFAULT 0,
    is_required boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(course_id, module_number)
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id, display_order);

-- ============================================
-- COURSE ENROLLMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS course_enrollments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES learning_courses(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    enrollment_status text DEFAULT 'enrolled', -- 'enrolled', 'in_progress', 'completed', 'dropped'
    progress_percentage integer DEFAULT 0,
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    certificate_issued boolean DEFAULT false,
    certificate_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(enrollment_status);

-- ============================================
-- SKILLS CATALOG
-- ============================================
CREATE TABLE IF NOT EXISTS skills_catalog (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name text UNIQUE NOT NULL,
    skill_category text, -- 'technical', 'soft', 'domain', 'tool'
    description text,
    proficiency_levels text[] DEFAULT ARRAY['beginner', 'intermediate', 'advanced', 'expert'],
    related_skills uuid[], -- Array of skill IDs
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_skills_catalog_category ON skills_catalog(skill_category);
CREATE INDEX IF NOT EXISTS idx_skills_catalog_name ON skills_catalog(skill_name);

-- ============================================
-- USER SKILLS (Progression Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS user_skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    skill_id uuid REFERENCES skills_catalog(id) ON DELETE CASCADE,
    proficiency_level text NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'expert'
    verified boolean DEFAULT false,
    verified_by uuid REFERENCES users(id),
    verified_at timestamptz,
    acquired_from text, -- 'course', 'project', 'certification', 'peer_review', 'self_assessment'
    acquired_from_id uuid, -- References course, project, etc
    evidence_urls text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_proficiency ON user_skills(proficiency_level);

-- ============================================
-- CERTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS certifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    certification_code text UNIQUE NOT NULL,
    name text NOT NULL,
    issuing_organization text,
    description text,
    requirements jsonb DEFAULT '{}'::jsonb, -- Skills, courses, projects required
    validity_period_months integer, -- NULL for lifetime
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_certifications_code ON certifications(certification_code);

-- ============================================
-- USER CERTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS user_certifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    certification_id uuid REFERENCES certifications(id) ON DELETE CASCADE,
    issued_at timestamptz DEFAULT now(),
    expires_at timestamptz,
    certificate_url text,
    verification_code text UNIQUE,
    issued_by uuid REFERENCES users(id),
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(user_id, certification_id, issued_at)
);

CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_certification_id ON user_certifications(certification_id);

-- ============================================
-- LEARNING PATHS
-- ============================================
CREATE TABLE IF NOT EXISTS learning_paths (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    path_name text NOT NULL,
    description text,
    target_skill_id uuid REFERENCES skills_catalog(id),
    course_ids uuid[] DEFAULT '{}', -- Ordered array of course IDs
    estimated_total_hours integer,
    difficulty_level text,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_learning_paths_target_skill ON learning_paths(target_skill_id);

COMMENT ON TABLE learning_courses IS 'Educational courses and training';
COMMENT ON TABLE course_modules IS 'Modules within courses';
COMMENT ON TABLE course_enrollments IS 'User course enrollments and progress';
COMMENT ON TABLE skills_catalog IS 'Master catalog of skills';
COMMENT ON TABLE user_skills IS 'User skill progression and verification';
COMMENT ON TABLE certifications IS 'Available certifications';
COMMENT ON TABLE user_certifications IS 'User earned certifications';
COMMENT ON TABLE learning_paths IS 'Structured learning paths to skills';








-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp for learning_courses
CREATE TRIGGER trigger_learning_courses_updated_at
    BEFORE UPDATE ON learning_courses
    FOR EACH ROW
    WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at OR OLD."_updatedDate" IS DISTINCT FROM NEW."_updatedDate")
    EXECUTE FUNCTION update_updated_at_column();

-- Audit logging trigger for learning_courses
CREATE TRIGGER trigger_learning_courses_audit
    AFTER INSERT OR UPDATE OR DELETE ON learning_courses
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

-- Auto-update updated_at timestamp for course_modules
CREATE TRIGGER trigger_course_modules_updated_at
    BEFORE UPDATE ON course_modules
    FOR EACH ROW
    WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at OR OLD."_updatedDate" IS DISTINCT FROM NEW."_updatedDate")
    EXECUTE FUNCTION update_updated_at_column();

-- Audit logging trigger for course_modules
CREATE TRIGGER trigger_course_modules_audit
    AFTER INSERT OR UPDATE OR DELETE ON course_modules
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

-- Auto-update updated_at timestamp for course_enrollments
CREATE TRIGGER trigger_course_enrollments_updated_at
    BEFORE UPDATE ON course_enrollments
    FOR EACH ROW
    WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at OR OLD."_updatedDate" IS DISTINCT FROM NEW."_updatedDate")
    EXECUTE FUNCTION update_updated_at_column();

-- Audit logging trigger for course_enrollments
CREATE TRIGGER trigger_course_enrollments_audit
    AFTER INSERT OR UPDATE OR DELETE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

-- Auto-update updated_at timestamp for skills_catalog
CREATE TRIGGER trigger_skills_catalog_updated_at
    BEFORE UPDATE ON skills_catalog
    FOR EACH ROW
    WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at OR OLD."_updatedDate" IS DISTINCT FROM NEW."_updatedDate")
    EXECUTE FUNCTION update_updated_at_column();

-- Audit logging trigger for skills_catalog
CREATE TRIGGER trigger_skills_catalog_audit
    AFTER INSERT OR UPDATE OR DELETE ON skills_catalog
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

-- Auto-update updated_at timestamp for user_skills
CREATE TRIGGER trigger_user_skills_updated_at
    BEFORE UPDATE ON user_skills
    FOR EACH ROW
    WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at OR OLD."_updatedDate" IS DISTINCT FROM NEW."_updatedDate")
    EXECUTE FUNCTION update_updated_at_column();

-- Audit logging trigger for user_skills
CREATE TRIGGER trigger_user_skills_audit
    AFTER INSERT OR UPDATE OR DELETE ON user_skills
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

-- Auto-update updated_at timestamp for certifications
CREATE TRIGGER trigger_certifications_updated_at
    BEFORE UPDATE ON certifications
    FOR EACH ROW
    WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at OR OLD."_updatedDate" IS DISTINCT FROM NEW."_updatedDate")
    EXECUTE FUNCTION update_updated_at_column();

-- Audit logging trigger for certifications
CREATE TRIGGER trigger_certifications_audit
    AFTER INSERT OR UPDATE OR DELETE ON certifications
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

-- Auto-update updated_at timestamp for user_certifications
CREATE TRIGGER trigger_user_certifications_updated_at
    BEFORE UPDATE ON user_certifications
    FOR EACH ROW
    WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at OR OLD."_updatedDate" IS DISTINCT FROM NEW."_updatedDate")
    EXECUTE FUNCTION update_updated_at_column();

-- Audit logging trigger for user_certifications
CREATE TRIGGER trigger_user_certifications_audit
    AFTER INSERT OR UPDATE OR DELETE ON user_certifications
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

-- Auto-update updated_at timestamp for learning_paths
CREATE TRIGGER trigger_learning_paths_updated_at
    BEFORE UPDATE ON learning_paths
    FOR EACH ROW
    WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at OR OLD."_updatedDate" IS DISTINCT FROM NEW."_updatedDate")
    EXECUTE FUNCTION update_updated_at_column();

-- Audit logging trigger for learning_paths
CREATE TRIGGER trigger_learning_paths_audit
    AFTER INSERT OR UPDATE OR DELETE ON learning_paths
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

