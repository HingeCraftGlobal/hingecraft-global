// HingeCraft Global, LLC - Legal Document
// Digital Asset Nft Ownership
// State of South Carolina | December 6, 2025

import wixSeo from 'wix-seo';

$w.onReady(function () {
    wixSeo.setTitle("Digital Asset Nft Ownership | HingeCraft Global");
    wixSeo.setMetaTags([
        { name: "description", content: "Digital Asset Nft Ownership - HingeCraft Global legal document" },
        { name: "robots", content: "index, follow" }
    ]);
    loadLegalContent();
});

function loadLegalContent() {
    const legalContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital Asset & NFT Ownership Terms - HingeCraft Global, LLC</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000; background: #fff; max-width: 8.5in; margin: 0 auto; padding: 1in; }
        h1 { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 24pt; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 12pt; }
        h2 { font-size: 14pt; font-weight: bold; margin-top: 24pt; margin-bottom: 12pt; text-transform: uppercase; }
        h3 { font-size: 12pt; font-weight: bold; margin-top: 18pt; margin-bottom: 9pt; }
        p { margin-bottom: 12pt; text-align: justify; }
        ul, ol { margin-left: 36pt; margin-bottom: 12pt; }
        li { margin-bottom: 6pt; }
        .header { text-align: center; margin-bottom: 36pt; }
        .company-name { font-size: 16pt; font-weight: bold; }
        .footer { margin-top: 48pt; padding-top: 12pt; border-top: 1px solid #000; font-size: 10pt; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">HINGECRAFT GLOBAL, LLC</div>
        <h1>DIGITAL ASSET & NFT OWNERSHIP TERMS</h1>
        <p>Effective Date: _________________, 20____<br>State of South Carolina</p>
    </div>

    <h2>1. INTRODUCTION</h2>
    <p>These Digital Asset & NFT Ownership Terms ("Terms") govern the purchase, ownership, and use of non-fungible tokens ("NFTs") and other digital assets offered by HingeCraft Global, LLC ("HingeCraft").</p>

    <h2>2. DEFINITIONS</h2>
    <p><strong>"Digital Asset"</strong> means any digital token, certificate, or record associated with HingeCraft products or services.</p>
    <p><strong>"NFT"</strong> means a non-fungible token on a blockchain that represents ownership of or rights to digital or physical content.</p>
    <p><strong>"Underlying Content"</strong> means the artwork, design, digital file, or other content associated with an NFT.</p>

    <h2>3. NFT PURCHASES</h2>
    
    <h3>3.1 Purchase</h3>
    <p>When you purchase an NFT: (a) You receive ownership of the NFT token; (b) Ownership is recorded on the applicable blockchain; (c) You receive a license to the Underlying Content as specified below.</p>
    
    <h3>3.2 Payment</h3>
    <p>NFTs may be purchased using: (a) Cryptocurrency (as specified); (b) Traditional payment methods (where available). All sales are final.</p>
    
    <h3>3.3 Gas Fees</h3>
    <p>You are responsible for blockchain transaction fees ("gas fees") associated with your transactions.</p>

    <h2>4. OWNERSHIP AND LICENSE</h2>
    
    <h3>4.1 NFT Ownership</h3>
    <p>When you own an NFT, you own the token itself, subject to these Terms. You may: (a) Display the NFT; (b) Transfer or sell the NFT; (c) Use the associated digital content for personal, non-commercial purposes.</p>
    
    <h3>4.2 Intellectual Property</h3>
    <p>HingeCraft retains all intellectual property rights in the Underlying Content. Your purchase does NOT include: (a) Copyright to the Underlying Content; (b) Rights to create derivative works; (c) Commercial use rights (unless specifically granted); (d) Trademark rights.</p>
    
    <h3>4.3 License Grant</h3>
    <p>Subject to these Terms, HingeCraft grants you a non-exclusive, non-transferable license to use, display, and enjoy the Underlying Content for personal, non-commercial purposes for as long as you own the NFT.</p>
    
    <h3>4.4 Restrictions</h3>
    <p>You may NOT: (a) Modify the Underlying Content; (b) Use for commercial purposes without permission; (c) Use in offensive or illegal contexts; (d) Claim authorship or ownership of the IP.</p>

    <h2>5. TRANSFERS</h2>
    <p>You may transfer your NFT to another party, subject to: (a) Applicable platform terms; (b) Smart contract restrictions; (c) Transfer of license rights with the NFT. HingeCraft may receive royalties on secondary sales as encoded in the smart contract.</p>

    <h2>6. RISKS</h2>
    <p>You acknowledge the following risks: (a) Blockchain technology is evolving and may have vulnerabilities; (b) NFT values are volatile and speculative; (c) Platforms and marketplaces may change or cease operations; (d) Regulatory treatment is uncertain; (e) Loss of wallet access results in loss of NFTs.</p>

    <h2>7. NO WARRANTIES</h2>
    <p>NFTs are provided "AS IS" without warranties. HingeCraft does not guarantee: (a) Value appreciation; (b) Resale opportunities; (c) Platform availability; (d) Blockchain functionality.</p>

    <h2>8. GOVERNING LAW</h2>
    <p>These Terms are governed by South Carolina law.</p>

    <h2>9. CONTACT</h2>
    <p>Questions: digital@hingecraft.com | (843) 555-0100</p>

    <div class="footer">
        <p>HingeCraft Global, LLC | 123 Innovation Drive, Suite 100, Charleston, SC 29401</p>
        <p>© 2025 HingeCraft Global, LLC. All Rights Reserved.</p>
    </div>
</body>
</html>

`;
    if ($w('#legalContent')) {
        try { $w('#legalContent').html = legalContent; } catch (e) {}
    }
}
