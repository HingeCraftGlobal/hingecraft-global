/**
 * Apply Database Schema to Wix
 * 
 * This script creates all required Wix Database collections
 * based on the PostgreSQL schema
 */

// Wix Database Collections Required:
const COLLECTIONS = {
  Donations: {
    fields: {
      _id: 'text',
      _createdDate: 'dateTime',
      _updatedDate: 'dateTime',
      _owner: 'text',
      amount: 'number',
      currency: 'text',
      is_other_amount: 'boolean',
      source: 'text',
      payment_status: 'text',
      payment_method: 'text',
      transaction_id: 'text',
      member_email: 'text',
      member_name: 'text',
      created_at: 'dateTime',
      updated_at: 'dateTime',
      metadata: 'object'
    }
  },
  CryptoPayments: {
    fields: {
      _id: 'text',
      _createdDate: 'dateTime',
      _updatedDate: 'dateTime',
      _owner: 'text',
      invoice_id: 'text',
      order_id: 'text',
      price_amount: 'number',
      price_currency: 'text',
      pay_amount: 'number',
      pay_currency: 'text',
      pay_address: 'text',
      payment_url: 'text',
      status: 'text',
      email: 'text',
      first_name: 'text',
      last_name: 'text',
      mission_support_name: 'text',
      session_id: 'text',
      created_at: 'dateTime',
      updated_at: 'dateTime',
      metadata: 'object'
    }
  },
  StripePayments: {
    fields: {
      _id: 'text',
      _createdDate: 'dateTime',
      _updatedDate: 'dateTime',
      _owner: 'text',
      invoice_id: 'text',
      customer_id: 'text',
      amount: 'number',
      currency: 'text',
      status: 'text',
      payment_method: 'text',
      email: 'text',
      name: 'text',
      created_at: 'dateTime',
      updated_at: 'dateTime',
      metadata: 'object'
    }
  },
  ContributionIntent: {
    fields: {
      _id: 'text',
      _createdDate: 'dateTime',
      _updatedDate: 'dateTime',
      _owner: 'text',
      amount_entered: 'number',
      status: 'text',
      source: 'text',
      first_name: 'text',
      last_name: 'text',
      email: 'text',
      address: 'text',
      mission_support_name: 'text',
      session_id: 'text',
      anonymous_fingerprint: 'text',
      timestamp: 'dateTime',
      metadata: 'object'
    }
  },
  Members: {
    fields: {
      _id: 'text',
      _createdDate: 'dateTime',
      _updatedDate: 'dateTime',
      _owner: 'text',
      email: 'text',
      first_name: 'text',
      last_name: 'text',
      membership_tier: 'text',
      membership_years: 'number',
      total_contributed: 'number',
      status: 'text',
      created_at: 'dateTime',
      updated_at: 'dateTime',
      metadata: 'object'
    }
  },
  PaymentRoutes: {
    fields: {
      _id: 'text',
      _createdDate: 'dateTime',
      _updatedDate: 'dateTime',
      _owner: 'text',
      route_key: 'text',
      payment_method: 'text',
      enabled: 'boolean',
      min_amount: 'number',
      max_amount: 'number',
      config: 'object',
      created_at: 'dateTime',
      updated_at: 'dateTime'
    }
  },
  PageContent: {
    fields: {
      _id: 'text',
      _createdDate: 'dateTime',
      _updatedDate: 'dateTime',
      _owner: 'text',
      page_url: 'text',
      page_title: 'text',
      content: 'text',
      content_type: 'text',
      indexed_at: 'dateTime',
      metadata: 'object'
    }
  }
};

/**
 * Instructions for manual collection creation in Wix:
 * 
 * 1. Go to Wix Editor → Database → Collections
 * 2. For each collection above:
 *    - Click "Add Collection"
 *    - Name it exactly as shown (e.g., "Donations")
 *    - Add each field with the correct type
 *    - Set permissions (usually "Anyone can read, Only site members can write")
 * 
 * OR use Wix CLI:
 * wix data collections create --name "Donations" --fields "amount:number,currency:text,..."
 */

console.log('📋 Database Collections Required:');
console.log(JSON.stringify(COLLECTIONS, null, 2));

console.log('\n📝 To apply:');
console.log('1. Go to Wix Editor → Database → Collections');
console.log('2. Create each collection manually with the fields listed above');
console.log('3. Or use Wix CLI to create collections programmatically');

module.exports = { COLLECTIONS };
