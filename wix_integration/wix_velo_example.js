// Wix Velo Code Example - Frontend Integration
// Use this code in Wix Editor > Dev Mode > Page Code

import {fetch} from 'wix-fetch';

// Configuration
const API_BASE_URL = 'https://staging.hingecraft-global.ai'; // Use ngrok URL in dev
const API_KEY = '<<API_KEY>>'; // Set in Wix Secrets Manager

/**
 * Handle donation button click
 * Creates donation invoice and displays payment details
 */
export function donateButton_click(event) {
    const chain = $w('#chainSelect').value; // 'solana', 'stellar', 'bitcoin'
    const amountUsd = Number($w('#amountInput').value);
    const donorName = $w('#nameInput').value || null;
    const donorEmail = $w('#emailInput').value || null;
    const project = $w('#projectSelect').value || 'general';
    
    // Validate input
    if (!chain || !amountUsd || amountUsd <= 0) {
        $w('#errorMessage').text = 'Please fill in all required fields';
        return;
    }
    
    // Show loading state
    $w('#loadingIndicator').show();
    $w('#errorMessage').text = '';
    
    // Call FastAPI backend
    fetch(`${API_BASE_URL}/api/v1/donations/create`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        },
        body: JSON.stringify({
            chain: chain,
            amountUsd: amountUsd,
            source: 'wix:homepage',
            donorInfo: {
                name: donorName,
                email: donorEmail
            },
            earmark: project
        })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
    })
    .then(json => {
        // Hide loading, show payment details
        $w('#loadingIndicator').hide();
        $w('#paymentDetails').show();
        
        // Display address and QR code
        $w('#addressText').text = json.address;
        $w('#memoText').text = json.memo || 'No memo';
        $w('#qrImage').src = json.qr_url;
        $w('#amountDisplay').text = `$${json.amount_usd} ${json.token}`;
        
        // Show copy buttons
        $w('#copyAddressButton').show();
        $w('#copyMemoButton').show();
        
        // Store invoice ID for tracking
        $w('#invoiceId').text = json.invoice_id;
    })
    .catch(err => {
        console.error('Donation error:', err);
        $w('#loadingIndicator').hide();
        $w('#errorMessage').text = `Error: ${err.message}`;
    });
}

/**
 * Copy address to clipboard
 */
export function copyAddressButton_click(event) {
    const address = $w('#addressText').text;
    copyToClipboard(address);
    $w('#copyAddressButton').text = 'Copied!';
    setTimeout(() => {
        $w('#copyAddressButton').text = 'Copy Address';
    }, 2000);
}

/**
 * Copy memo to clipboard
 */
export function copyMemoButton_click(event) {
    const memo = $w('#memoText').text;
    copyToClipboard(memo);
    $w('#copyMemoButton').text = 'Copied!';
    setTimeout(() => {
        $w('#copyMemoButton').text = 'Copy Memo';
    }, 2000);
}

/**
 * Check donation status
 */
export function checkStatusButton_click(event) {
    const invoiceId = $w('#invoiceId').text;
    if (!invoiceId) {
        $w('#statusMessage').text = 'No invoice ID found';
        return;
    }
    
    fetch(`${API_BASE_URL}/v1/donations/${invoiceId}`, {
        method: 'get',
        headers: {
            'x-api-key': API_KEY
        }
    })
    .then(res => res.json())
    .then(data => {
        $w('#statusMessage').text = `Status: ${data.status}`;
        if (data.status === 'confirmed') {
            $w('#successMessage').show();
        }
    })
    .catch(err => {
        $w('#statusMessage').text = `Error: ${err.message}`;
    });
}

/**
 * Helper: Copy to clipboard
 */
function copyToClipboard(text) {
    // Wix doesn't have direct clipboard API, use workaround
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

/**
 * Initialize page
 */
$w.onReady(function () {
    // Set default values
    $w('#chainSelect').value = 'solana';
    $w('#amountInput').value = '25';
    
    // Hide payment details initially
    $w('#paymentDetails').hide();
    $w('#loadingIndicator').hide();
    $w('#errorMessage').text = '';
});

