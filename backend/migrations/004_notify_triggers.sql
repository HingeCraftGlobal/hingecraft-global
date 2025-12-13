-- Create trigger function to notify on route-relevant changes
CREATE OR REPLACE FUNCTION notify_hc_routes() RETURNS trigger 
LANGUAGE plpgsql AS $$
DECLARE
  payload json;
BEGIN
  IF TG_OP = 'DELETE' THEN
    payload = json_build_object('op', TG_OP, 'table', TG_TABLE_NAME, 'id', OLD.id);
  ELSE
    payload = json_build_object('op', TG_OP, 'table', TG_TABLE_NAME, 'id', NEW.id);
  END IF;
  
  PERFORM pg_notify('hc_routes_changed', payload::text);
  RETURN NEW;
END;
$$;

-- Add triggers to relevant tables
DROP TRIGGER IF EXISTS notify_payments ON payments;
CREATE TRIGGER notify_payments 
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION notify_hc_routes();

DROP TRIGGER IF EXISTS notify_external_payments ON external_payments;
CREATE TRIGGER notify_external_payments 
  AFTER INSERT OR UPDATE OR DELETE ON external_payments
  FOR EACH ROW EXECUTE FUNCTION notify_hc_routes();

DROP TRIGGER IF EXISTS notify_wallets ON wallets;
CREATE TRIGGER notify_wallets 
  AFTER INSERT OR UPDATE OR DELETE ON wallets
  FOR EACH ROW EXECUTE FUNCTION notify_hc_routes();
