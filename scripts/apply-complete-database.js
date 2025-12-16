/**
 * Apply Complete Database Schema to Wix
 * 
 * This script creates all required Wix Database collections
 * with exact field types and structure as specified.
 * 
 * Run this in Wix Velo backend or use as reference for manual creation.
 */

// ============================================
// COLLECTION 1: ContributionIntent
// ============================================
const CONTRIBUTION_INTENT_SCHEMA = {
    name: 'ContributionIntent',
    fields: {
        // Wix Required
        '_id': 'text',
        '_createdDate': 'dateTime',
        '_updatedDate': 'dateTime',
        '_owner': 'text',
        
        // Form Data
        'name': 'text',
        'email': 'text',
        'phone': 'text',
        'donationAmount': 'number', // Decimal
        'paymentMethod': 'text', // 'card' or 'crypto'
        'isSubscription': 'boolean',
        'intentStatus': 'text', // 'pending', 'paid', 'cancelled'
        
        // Mission Support Specific
        'first_name': 'text',
        'last_name': 'text',
        'address': 'text',
        'mission_support_name': 'text',
        
        // Tracking
        'session_id': 'text',
        'anonymous_fingerprint': 'text',
        'referrer_source': 'text',
        'page_url': 'text',
        'user_agent': 'text',
        'source': 'text', // 'missionSupportForm' or 'charter_page'
        'timestamp': 'dateTime',
        
        // User Link (if logged in)
        'wix_user_id': 'text',
        
        // Metadata
        'metadata': 'object'
    },
    permissions: {
        read: 'Anyone',
        write: 'Site Members'
    }
};

// ============================================
// COLLECTION 2: StripePayments
// ============================================
const STRIPE_PAYMENTS_SCHEMA = {
    name: 'StripePayments',
    fields: {
        // Wix Required
        '_id': 'text',
        '_createdDate': 'dateTime',
        '_updatedDate': 'dateTime',
        '_owner': 'text',
        
        // Links
        'intentId': 'text', // Reference to ContributionIntent._id
        'invoice_id': 'text', // Stripe session_id (CUSTOM INVOICE ID)
        'session_id': 'text', // Stripe session_id
        'customer_id': 'text', // Stripe customer ID
        
        // Payment Details
        'amount': 'number',
        'currency': 'text', // 'usd'
        'status': 'text', // 'pending', 'complete', 'expired'
        'payment_method': 'text', // 'card', 'ach'
        
        // User Info
        'email': 'text',
        'name': 'text',
        
        // Subscription
        'is_subscription': 'boolean',
        
        // Metadata
        'metadata': 'object'
    },
    permissions: {
        read: 'Anyone',
        write: 'Site Members'
    }
};

// ============================================
// COLLECTION 3: CryptoPayments
// ============================================
const CRYPTO_PAYMENTS_SCHEMA = {
    name: 'CryptoPayments',
    fields: {
        // Wix Required
        '_id': 'text',
        '_createdDate': 'dateTime',
        '_updatedDate': 'dateTime',
        '_owner': 'text',
        
        // Links
        'intent_id': 'text', // Reference to ContributionIntent._id
        'order_id': 'text', // CUSTOM INVOICE ID (same as intentId)
        'invoice_id': 'text', // NOWPayments invoice ID
        'payment_id': 'text', // NOWPayments payment ID
        
        // Payment Details
        'price_amount': 'number', // USD amount
        'price_currency': 'text', // 'usd'
        'pay_amount': 'number', // Crypto amount
        'pay_currency': 'text', // 'BTC', 'ETH', 'SOL', etc.
        'pay_address': 'text', // Crypto address
        'payment_url': 'text', // NOWPayments payment page URL
        
        // Status
        'status': 'text', // 'waiting', 'confirming', 'confirmed', 'finished', 'failed'
        'nowpayments_status': 'text', // Raw NOWPayments status
        
        // User Info
        'email': 'text',
        'first_name': 'text',
        'last_name': 'text',
        'mission_support_name': 'text',
        'session_id': 'text',
        
        // Timestamps
        'invoice_created_at': 'dateTime',
        'invoice_expires_at': 'dateTime',
        
        // Metadata
        'metadata': 'object',
        'raw_response': 'object'
    },
    permissions: {
        read: 'Anyone',
        write: 'Site Members'
    }
};

// ============================================
// COLLECTION 4: Donations
// ============================================
const DONATIONS_SCHEMA = {
    name: 'Donations',
    fields: {
        // Wix Required
        '_id': 'text',
        '_createdDate': 'dateTime',
        '_updatedDate': 'dateTime',
        '_owner': 'text',
        
        // Links
        'intentId': 'text', // Reference to ContributionIntent._id
        'paymentType': 'text', // 'card' or 'crypto'
        
        // Payment Details
        'amount': 'number', // Final confirmed amount
        'currency': 'text', // 'USD'
        'datePaid': 'dateTime', // Payment completion timestamp
        'isSubscription': 'boolean', // Critical split: true for membership, false for donation
        
        // Transaction Info
        'transaction_id': 'text', // Stripe session_id or NOWPayments invoice_id
        'payment_status': 'text', // 'completed', 'pending', 'failed'
        'payment_method': 'text', // 'card', 'ach', 'crypto'
        
        // Source
        'source': 'text', // 'missionSupportForm', 'charter_page'
        'is_other_amount': 'boolean',
        
        // User Info
        'member_email': 'text',
        'member_name': 'text',
        
        // User Link (if logged in)
        'wix_user_id': 'text',
        
        // Metadata
        'metadata': 'object'
    },
    permissions: {
        read: 'Anyone',
        write: 'Site Members'
    }
};

// ============================================
// COLLECTION 5: Members
// ============================================
const MEMBERS_SCHEMA = {
    name: 'Members',
    fields: {
        // Wix Required
        '_id': 'text',
        '_createdDate': 'dateTime',
        '_updatedDate': 'dateTime',
        '_owner': 'text',
        
        // Member Info
        'email': 'text',
        'first_name': 'text',
        'last_name': 'text',
        'membership_tier': 'text', // 'BASIC', 'PREMIER', 'VIP'
        'membership_years': 'number',
        'total_contributed': 'number',
        'status': 'text', // 'active', 'inactive', 'cancelled'
        
        // User Link
        'wix_user_id': 'text',
        
        // Metadata
        'metadata': 'object'
    },
    permissions: {
        read: 'Site Members',
        write: 'Site Members'
    }
};

// ============================================
// COLLECTION 6: PaymentRoutes
// ============================================
const PAYMENT_ROUTES_SCHEMA = {
    name: 'PaymentRoutes',
    fields: {
        // Wix Required
        '_id': 'text',
        '_createdDate': 'dateTime',
        '_updatedDate': 'dateTime',
        '_owner': 'text',
        
        // Route Config
        'route_key': 'text', // 'USD_CARD', 'USD_ACH', 'CRYPTO'
        'payment_method': 'text',
        'enabled': 'boolean',
        'min_amount': 'number',
        'max_amount': 'number',
        'config': 'object'
    },
    permissions: {
        read: 'Anyone',
        write: 'Site Members'
    }
};

// ============================================
// COLLECTION 7: PageContent
// ============================================
const PAGE_CONTENT_SCHEMA = {
    name: 'PageContent',
    fields: {
        // Wix Required
        '_id': 'text',
        '_createdDate': 'dateTime',
        '_updatedDate': 'dateTime',
        '_owner': 'text',
        
        // Content
        'page_url': 'text',
        'page_title': 'text',
        'content': 'text',
        'content_type': 'text',
        'indexed_at': 'dateTime',
        'metadata': 'object'
    },
    permissions: {
        read: 'Anyone',
        write: 'Site Members'
    }
};

// ============================================
// EXPORT SCHEMAS
// ============================================
const ALL_COLLECTIONS = {
    ContributionIntent: CONTRIBUTION_INTENT_SCHEMA,
    StripePayments: STRIPE_PAYMENTS_SCHEMA,
    CryptoPayments: CRYPTO_PAYMENTS_SCHEMA,
    Donations: DONATIONS_SCHEMA,
    Members: MEMBERS_SCHEMA,
    PaymentRoutes: PAYMENT_ROUTES_SCHEMA,
    PageContent: PAGE_CONTENT_SCHEMA
};

console.log('📋 Database Collections Schema:');
console.log(JSON.stringify(ALL_COLLECTIONS, null, 2));

/**
 * MANUAL CREATION INSTRUCTIONS:
 * 
 * 1. Go to Wix Editor → Database → Collections
 * 2. For each collection above:
 *    - Click "Add Collection"
 *    - Name it exactly as shown
 *    - Add each field with the correct type
 *    - Set permissions as specified
 * 
 * OR use Wix CLI:
 * wix data collections create --name "ContributionIntent" --fields "name:text,email:text,..."
 */

module.exports = { ALL_COLLECTIONS };
