/**
 * HingeCraft Payment Page Integration (Donation Page)
 * 
 * GOAL: Capture "other" custom donation amount and transfer to charter page
 * 
 * Flow: Payment Page (Donation) → User enters "other" amount → Submits payment → 
 *       Amount stored → Redirects to Charter Page → Charter displays amount
 * 
 * This code should be added to the payment/donation page (/payment) in Wix
 */

import wixStorage from 'wix-storage';
import wixLocation from 'wix-location';
import wixData from 'wix-data';

$w.onReady(function () {
    // Setup donation amount capture
    setupDonationAmountCapture();
    
    // Monitor payment success to redirect to charter
    setupPaymentSuccessHandler();
});

/**
 * Setup donation amount capture
 * Monitors for "other" amount selection and custom amount input
 */
function setupDonationAmountCapture() {
    // Find donation form elements - UPDATE THESE SELECTORS TO MATCH YOUR FORM
    const otherAmountButton = $w('#otherAmountButton') || 
                             $w('button[data-amount="other"]') ||
                             $w('button:contains("Other")');
    
    const customAmountInput = $w('#customAmountInput') || 
                              $w('#otherAmount') ||
                              $w('input[type="number"][placeholder*="amount" i]') ||
                              $w('input[name="customAmount"]');
    
    const donationForm = $w('#donationForm') || 
                         $w('form') ||
                         $w('#paymentForm');
    
    // Show custom input when "other" is clicked
    if (otherAmountButton) {
        otherAmountButton.onClick(() => {
            if (customAmountInput) {
                customAmountInput.show();
                customAmountInput.focus();
            }
        });
    }
    
    // Monitor custom amount input changes
    if (customAmountInput) {
        customAmountInput.onChange(() => {
            const amount = parseFloat(customAmountInput.value) || 0;
            if (amount > 0) {
                // Store amount as user types (optional)
                storeDonationAmount(amount, true);
            }
        });
    }
    
    // Monitor form submission
    if (donationForm) {
        donationForm.onSubmit(handleDonationSubmission);
    }
    
    // Monitor payment/submit button
    const submitButton = $w('#submitDonation') || 
                         $w('#submitPayment') ||
                         $w('button[type="submit"]') ||
                         $w('button:contains("Donate")') ||
                         $w('button:contains("Pay")');
    
    if (submitButton) {
        submitButton.onClick(() => {
            // Capture amount before submission
            setTimeout(() => {
                captureDonationAmount();
            }, 100);
        });
    }
}

/**
 * Capture donation amount when payment is submitted
 */
function captureDonationAmount() {
    let donationAmount = 0;
    let isOtherAmount = false;
    
    // Method 1: Get from custom "other" amount input
    const customAmountInput = $w('#customAmountInput') || 
                              $w('#otherAmount') ||
                              $w('input[name="customAmount"]') ||
                              $w('input[type="number"].custom-amount');
    
    if (customAmountInput && customAmountInput.value) {
        donationAmount = parseFloat(customAmountInput.value) || 0;
        isOtherAmount = true;
    }
    
    // Method 2: Check if "other" amount button is selected
    if (!donationAmount) {
        const otherAmountButton = $w('#otherAmountButton') || 
                                  $w('button[data-amount="other"]');
        if (otherAmountButton && (otherAmountButton.hasClass('selected') || 
                                  otherAmountButton.checked ||
                                  otherAmountButton.pressed)) {
            isOtherAmount = true;
            if (customAmountInput) {
                donationAmount = parseFloat(customAmountInput.value) || 0;
            }
        }
    }
    
    // Method 3: Get from selected preset amount button
    if (!donationAmount) {
        const selectedButton = $w('button.selected[data-amount]') ||
                               $w('button.pressed[data-amount]');
        if (selectedButton) {
            const amountValue = selectedButton.getAttribute('data-amount');
            if (amountValue && amountValue !== 'other') {
                donationAmount = parseFloat(amountValue) || 0;
            }
        }
    }
    
    // Method 4: Get from form field directly
    if (!donationAmount) {
        const amountField = $w('#donationAmount') || 
                            $w('input[name="amount"]') ||
                            $w('#amount');
        if (amountField && amountField.value) {
            donationAmount = parseFloat(amountField.value) || 0;
        }
    }
    
    // If we have a donation amount, store it
    if (donationAmount > 0) {
        storeDonationAmount(donationAmount, isOtherAmount);
        return donationAmount;
    }
    
    return 0;
}

/**
 * Handle donation form submission
 */
async function handleDonationSubmission(event) {
    // Capture the donation amount before form submits
    const amount = captureDonationAmount();
    
    // Store amount for transfer to charter page
    if (amount > 0) {
        await storeDonationAmount(amount, true);
    }
    
    // Allow form to submit normally (your existing payment processing)
    return true;
}

/**
 * Setup payment success handler
 * Call this after payment is successfully processed
 */
function setupPaymentSuccessHandler() {
    // If your payment system has a success callback, hook into it here
    // Example: wixPayments.onPaymentSuccess(handlePaymentSuccess);
    
    // Alternative: Monitor for success message/page
    const successIndicator = $w('#paymentSuccess') || 
                             $w('.payment-success') ||
                             $w('text:contains("Thank you")');
    
    if (successIndicator) {
        // When payment succeeds, redirect to charter
        const amount = captureDonationAmount();
        if (amount > 0) {
            setTimeout(() => {
                redirectToCharterWithAmount(amount);
            }, 2000); // Wait 2 seconds to show success message
        }
    }
}

/**
 * Handle payment success - redirect to charter with amount
 */
export async function handlePaymentSuccess(paymentResult) {
    // Get the donation amount
    let amount = 0;
    
    // Try to get from stored data
    try {
        const stored = wixStorage.getItem('hingecraft_donation');
        if (stored) {
            const data = JSON.parse(stored);
            amount = parseFloat(data.amount) || 0;
        }
    } catch (error) {
        console.log("Could not retrieve stored amount:", error);
    }
    
    // If not found, try to capture from form
    if (!amount) {
        amount = captureDonationAmount();
    }
    
    // If we have an amount, redirect to charter
    if (amount > 0) {
        await redirectToCharterWithAmount(amount);
    } else {
        // Still redirect to charter even without amount
        wixLocation.to('/charter?fromPayment=true');
    }
}

/**
 * Store donation amount for transfer to charter page
 */
async function storeDonationAmount(amount, isOtherAmount = false) {
    const donationData = {
        amount: amount,
        isOtherAmount: isOtherAmount,
        timestamp: new Date().toISOString(),
        source: 'payment_page'
    };
    
    // Store in Wix Storage
    try {
        await wixStorage.setItem('hingecraft_donation', JSON.stringify(donationData));
    } catch (error) {
        console.log("Wix Storage not available:", error);
    }
    
    // Store in sessionStorage as backup
    try {
        sessionStorage.setItem('hingecraft_donation', JSON.stringify(donationData));
    } catch (error) {
        console.log("SessionStorage not available:", error);
    }
    
    // Save to database
    try {
        await saveDonationToDatabase(donationData);
    } catch (error) {
        console.log("Could not save to database:", error);
    }
    
    console.log('Donation amount stored:', donationData);
}

/**
 * Save donation to Wix database
 */
async function saveDonationToDatabase(donationData) {
    try {
        const donationRecord = {
            amount: parseFloat(donationData.amount),
            currency: 'USD',
            isOtherAmount: donationData.isOtherAmount,
            source: donationData.source,
            paymentStatus: 'completed',
            createdAt: new Date()
        };
        
        // Save to Donations collection (create this in Wix Database if needed)
        const result = await wixData.save('Donations', donationRecord);
        console.log('Donation saved to database:', result);
        return result;
    } catch (error) {
        console.error('Error saving donation to database:', error);
        // Don't throw - this is optional
        return null;
    }
}

/**
 * Redirect to charter page with donation amount
 */
export async function redirectToCharterWithAmount(amount) {
    // Store amount one more time to ensure it's available
    await storeDonationAmount(amount, true);
    
    // Redirect to charter page with amount in URL
    const params = new URLSearchParams({
        donationAmount: String(amount),
        fromPayment: 'true'
    });
    
    wixLocation.to('/charter?' + params.toString());
}

/**
 * Clear donation data after successful transfer
 */
export function clearDonationData() {
    try {
        wixStorage.removeItem('hingecraft_donation');
    } catch (error) {
        console.log("Error clearing Wix storage:", error);
    }
    
    if (typeof sessionStorage !== 'undefined') {
        try {
            sessionStorage.removeItem('hingecraft_donation');
        } catch (error) {
            console.log("Error clearing session storage:", error);
        }
    }
}
