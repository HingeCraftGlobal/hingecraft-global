/**
 * HingeCraft Frontend Code - FIXED FOR WDE0116
 * 
 * Use this in your Wix page code
 * 
 * FIXES:
 * 1. ✅ Uses correct field names (snake_case)
 * 2. ✅ No wixData.aggregate() calls
 * 3. ✅ Direct API calls only
 */

import { getLatestDonation, saveDonation, getAllDonations } from 'backend/hingecraft-api';

$w.onReady(async function () {
    try {
        // ✅ CORRECT: Get latest donation
        const donation = await getLatestDonation();
        
        if (donation) {
            // ✅ Use correct field names
            console.log('ID:', donation.id);  // ✅ Correct
            console.log('Amount:', donation.amount);  // ✅ Correct
            console.log('Currency:', donation.currency);  // ✅ Correct
            console.log('Is Other Amount:', donation.is_other_amount);  // ✅ Correct
            console.log('Created At:', donation.created_at);  // ✅ Correct
            
            // Display in UI
            $w('#donationAmount').text = `$${donation.amount}`;
            $w('#donationDate').text = new Date(donation.created_at).toLocaleDateString();
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// ✅ CORRECT: Save donation
export async function saveNewDonation(amount) {
    try {
        const donation = await saveDonation(amount, {
            isOtherAmount: true,
            paymentMethod: 'card',
            memberEmail: 'user@example.com'
        });
        
        // ✅ Use correct field names
        console.log('Saved donation ID:', donation.id);
        console.log('Saved amount:', donation.amount);
        
        return donation;
    } catch (error) {
        console.error('Error saving donation:', error);
        throw error;
    }
}

// ✅ CORRECT: Get donation stats (no aggregate)
export async function getDonationStats() {
    try {
        // ✅ Use direct API call, not wixData.aggregate()
        const result = await getAllDonations(1000, 0);
        
        // Process in code
        const total = result.donations.reduce((sum, d) => sum + d.amount, 0);
        const count = result.donations.length;
        const avg = count > 0 ? total / count : 0;
        
        return {
            total: total,
            count: count,
            average: avg,
            donations: result.donations
        };
    } catch (error) {
        console.error('Error getting stats:', error);
        throw error;
    }
}

// ❌ DON'T USE THIS (causes WDE0116):
// import wixData from 'wix-data';
// const result = await wixData.aggregate("HingeCraftDonationsDB/Donations", {...});
