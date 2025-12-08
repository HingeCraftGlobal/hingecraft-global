#!/usr/bin/env python3
"""
Generate Complete Legal Documents for HingeCraft Global
State of South Carolina - Full Detail
Simple Black & White HTML Styling
"""

import os
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent
OUTPUT_DIR = BASE_DIR / "COMPLETE_LEGAL_DOCS_SC"

# Company Information
COMPANY = {
    "name": "HingeCraft Global, LLC",
    "dba": "HingeCraft",
    "state": "South Carolina",
    "address": "123 Innovation Drive, Suite 100, Charleston, SC 29401",
    "email": "legal@hingecraft.com",
    "phone": "(843) 555-0100",
    "website": "https://www.hingecraft.com",
    "ein": "XX-XXXXXXX",
    "date_formed": "2024",
    "registered_agent": "HingeCraft Registered Agent Services, LLC",
    "registered_agent_address": "123 Innovation Drive, Suite 100, Charleston, SC 29401"
}

# Simple black and white CSS
CSS_STYLE = """
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000000;
            background-color: #ffffff;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 1in;
        }
        h1 {
            font-size: 18pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 24pt;
            text-transform: uppercase;
            border-bottom: 2px solid #000000;
            padding-bottom: 12pt;
        }
        h2 {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 24pt;
            margin-bottom: 12pt;
            text-transform: uppercase;
        }
        h3 {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 18pt;
            margin-bottom: 9pt;
        }
        h4 {
            font-size: 12pt;
            font-weight: bold;
            font-style: italic;
            margin-top: 12pt;
            margin-bottom: 6pt;
        }
        p {
            margin-bottom: 12pt;
            text-align: justify;
        }
        ul, ol {
            margin-left: 36pt;
            margin-bottom: 12pt;
        }
        li {
            margin-bottom: 6pt;
        }
        .header {
            text-align: center;
            margin-bottom: 36pt;
        }
        .company-name {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 6pt;
        }
        .document-title {
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
        }
        .effective-date {
            font-size: 10pt;
            margin-top: 12pt;
        }
        .section {
            margin-bottom: 24pt;
        }
        .article {
            margin-bottom: 36pt;
        }
        .signature-block {
            margin-top: 48pt;
            page-break-inside: avoid;
        }
        .signature-line {
            border-top: 1px solid #000000;
            width: 300px;
            margin-top: 48pt;
            padding-top: 6pt;
        }
        .indent {
            margin-left: 36pt;
        }
        .indent-2 {
            margin-left: 72pt;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 12pt 0;
        }
        th, td {
            border: 1px solid #000000;
            padding: 8pt;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .footer {
            margin-top: 48pt;
            padding-top: 12pt;
            border-top: 1px solid #000000;
            font-size: 10pt;
            text-align: center;
        }
        .page-number {
            text-align: center;
            font-size: 10pt;
            margin-top: 24pt;
        }
        .definition {
            margin-left: 36pt;
            margin-bottom: 12pt;
        }
        .definition-term {
            font-weight: bold;
        }
        @media print {
            body {
                padding: 0;
            }
            .page-break {
                page-break-before: always;
            }
        }
    </style>
"""

def create_html_document(title, content, doc_type="Policy"):
    """Create HTML document with standard header and footer"""
    current_date = datetime.now().strftime("%B %d, %Y")
    
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - {COMPANY['name']}</title>
    {CSS_STYLE}
</head>
<body>
    <div class="header">
        <div class="company-name">{COMPANY['name']}</div>
        <div class="document-title">{title}</div>
        <div class="effective-date">Effective Date: {current_date}</div>
        <div class="effective-date">State of South Carolina</div>
    </div>

{content}

    <div class="footer">
        <p>{COMPANY['name']} | {COMPANY['address']}</p>
        <p>Email: {COMPANY['email']} | Phone: {COMPANY['phone']}</p>
        <p>This document is legally binding under the laws of the State of South Carolina.</p>
        <p>&copy; {datetime.now().year} {COMPANY['name']}. All Rights Reserved.</p>
    </div>
</body>
</html>
"""

# Document 1: Corporate Formation Charter / Articles of Organization
DOC_01_CONTENT = """
    <div class="article">
        <h2>ARTICLES OF ORGANIZATION</h2>
        <h3>OF</h3>
        <h2>HINGECRAFT GLOBAL, LLC</h2>
        <h3>A South Carolina Limited Liability Company</h3>
    </div>

    <div class="article">
        <h2>ARTICLE I - NAME</h2>
        <div class="section">
            <p>The name of the Limited Liability Company is <strong>HingeCraft Global, LLC</strong> (hereinafter referred to as the "Company"). The Company may conduct business under the trade name "HingeCraft" or such other names as the Members may from time to time determine.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE II - PURPOSE</h2>
        <div class="section">
            <p>2.1 <strong>General Purpose.</strong> The Company is organized for the purpose of engaging in any lawful business activity for which a limited liability company may be organized under the South Carolina Uniform Limited Liability Company Act of 1996 (S.C. Code Ann. § 33-44-101 et seq.), as amended from time to time (the "Act").</p>
            
            <p>2.2 <strong>Specific Purposes.</strong> Without limiting the generality of the foregoing, the specific purposes of the Company include:</p>
            <ul>
                <li>(a) The design, development, manufacturing, marketing, sale, and distribution of hinge mechanisms, hardware components, and related mechanical systems;</li>
                <li>(b) The creation and licensing of intellectual property, including patents, trademarks, trade secrets, and copyrights related to hinge technology;</li>
                <li>(c) The provision of consulting, engineering, and technical services related to mechanical systems and hardware;</li>
                <li>(d) The operation of e-commerce platforms and digital marketplaces for hardware components;</li>
                <li>(e) Research and development of innovative mechanical solutions and sustainable manufacturing processes;</li>
                <li>(f) The acquisition, holding, management, and disposition of real and personal property;</li>
                <li>(g) Any other lawful purpose that may be approved by the Members.</li>
            </ul>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE III - PRINCIPAL OFFICE AND REGISTERED AGENT</h2>
        <div class="section">
            <p>3.1 <strong>Principal Office.</strong> The principal office of the Company shall be located at:</p>
            <p class="indent">123 Innovation Drive, Suite 100<br>
            Charleston, South Carolina 29401</p>
            <p>The Company may have such other offices, either within or without the State of South Carolina, as the Members may designate or as the business of the Company may require from time to time.</p>
            
            <p>3.2 <strong>Registered Agent.</strong> The name and address of the registered agent of the Company in South Carolina is:</p>
            <p class="indent">HingeCraft Registered Agent Services, LLC<br>
            123 Innovation Drive, Suite 100<br>
            Charleston, South Carolina 29401</p>
            
            <p>3.3 <strong>Change of Registered Agent.</strong> The registered agent may be changed from time to time by filing the appropriate documents with the South Carolina Secretary of State in accordance with the Act.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE IV - DURATION</h2>
        <div class="section">
            <p>The Company shall have perpetual existence unless sooner dissolved in accordance with the provisions of the Act, the Operating Agreement, or by unanimous consent of the Members.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE V - MANAGEMENT</h2>
        <div class="section">
            <p>5.1 <strong>Management Structure.</strong> The Company shall be managed by its Members (a "Member-Managed" Company) unless otherwise provided in the Operating Agreement.</p>
            
            <p>5.2 <strong>Authority.</strong> Each Member shall have the authority to bind the Company in the ordinary course of business, subject to the limitations set forth in the Operating Agreement.</p>
            
            <p>5.3 <strong>Managers.</strong> The Members may, by written agreement, appoint one or more Managers to manage the business and affairs of the Company, in which case the Company shall be "Manager-Managed."</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE VI - MEMBERS</h2>
        <div class="section">
            <p>6.1 <strong>Initial Members.</strong> The names and addresses of the initial Members of the Company, together with their respective Membership Interests, are set forth in the Operating Agreement.</p>
            
            <p>6.2 <strong>Admission of Additional Members.</strong> Additional Members may be admitted to the Company upon such terms and conditions as may be determined by the existing Members in accordance with the Operating Agreement.</p>
            
            <p>6.3 <strong>Withdrawal.</strong> A Member may withdraw from the Company only in accordance with the provisions of the Operating Agreement and applicable law.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE VII - CAPITAL CONTRIBUTIONS</h2>
        <div class="section">
            <p>7.1 <strong>Initial Contributions.</strong> The initial capital contributions of the Members are set forth in the Operating Agreement.</p>
            
            <p>7.2 <strong>Additional Contributions.</strong> No Member shall be required to make any additional capital contributions to the Company except as may be provided in the Operating Agreement or as unanimously agreed by the Members.</p>
            
            <p>7.3 <strong>No Interest.</strong> No interest shall be paid on any capital contribution unless otherwise provided in the Operating Agreement.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE VIII - DISTRIBUTIONS</h2>
        <div class="section">
            <p>8.1 <strong>Distributions.</strong> Distributions of cash or other assets of the Company shall be made to the Members at such times and in such amounts as determined by the Members in accordance with the Operating Agreement.</p>
            
            <p>8.2 <strong>Allocation.</strong> Profits, losses, and distributions shall be allocated among the Members in proportion to their respective Membership Interests, unless otherwise provided in the Operating Agreement.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE IX - LIABILITY AND INDEMNIFICATION</h2>
        <div class="section">
            <p>9.1 <strong>Limited Liability.</strong> The Members and Managers of the Company shall not be personally liable for the debts, obligations, or liabilities of the Company, whether arising in contract, tort, or otherwise, solely by reason of being a Member or Manager of the Company.</p>
            
            <p>9.2 <strong>Indemnification.</strong> The Company shall indemnify any Member, Manager, officer, employee, or agent of the Company to the fullest extent permitted by the Act and the Operating Agreement.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE X - DISSOLUTION</h2>
        <div class="section">
            <p>10.1 <strong>Events of Dissolution.</strong> The Company shall be dissolved upon the occurrence of any of the following events:</p>
            <ul>
                <li>(a) The unanimous written consent of all Members;</li>
                <li>(b) The entry of a decree of judicial dissolution under the Act;</li>
                <li>(c) Any event specified in the Operating Agreement as causing dissolution;</li>
                <li>(d) Any other event causing dissolution under applicable law.</li>
            </ul>
            
            <p>10.2 <strong>Winding Up.</strong> Upon dissolution, the Company's affairs shall be wound up in accordance with the Act and the Operating Agreement.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE XI - AMENDMENT</h2>
        <div class="section">
            <p>These Articles of Organization may be amended only by filing Articles of Amendment with the South Carolina Secretary of State in accordance with the Act and upon the approval of the Members as required by the Operating Agreement.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE XII - OPERATING AGREEMENT</h2>
        <div class="section">
            <p>The rights, duties, and obligations of the Members and Managers, the management and operation of the Company, and other matters not addressed in these Articles of Organization shall be governed by a written Operating Agreement, which may be amended from time to time by the Members.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE XIII - GOVERNING LAW</h2>
        <div class="section">
            <p>These Articles of Organization and the internal affairs of the Company shall be governed by and construed in accordance with the laws of the State of South Carolina, including the South Carolina Uniform Limited Liability Company Act of 1996, as amended.</p>
        </div>
    </div>

    <div class="signature-block">
        <h2>ORGANIZER'S CERTIFICATION</h2>
        <p>The undersigned organizer, being a natural person of at least eighteen (18) years of age, hereby certifies that the facts stated in these Articles of Organization are true and correct, and hereby executes these Articles of Organization on behalf of HingeCraft Global, LLC.</p>
        
        <div class="signature-line">
            <p>Signature of Organizer</p>
        </div>
        <p>Name: _________________________________</p>
        <p>Date: _________________________________</p>
    </div>
"""

# Document 2: Corporate Bylaws / Operating Agreement
DOC_02_CONTENT = """
    <div class="article">
        <h2>OPERATING AGREEMENT</h2>
        <h3>OF</h3>
        <h2>HINGECRAFT GLOBAL, LLC</h2>
        <h3>A South Carolina Limited Liability Company</h3>
    </div>

    <div class="article">
        <h2>ARTICLE I - FORMATION AND NAME</h2>
        <div class="section">
            <p>1.1 <strong>Formation.</strong> HingeCraft Global, LLC (the "Company") was formed as a South Carolina limited liability company by filing Articles of Organization with the South Carolina Secretary of State pursuant to the South Carolina Uniform Limited Liability Company Act of 1996 (S.C. Code Ann. § 33-44-101 et seq.) (the "Act").</p>
            
            <p>1.2 <strong>Name.</strong> The name of the Company is "HingeCraft Global, LLC." The Company may conduct business under the trade name "HingeCraft" or such other names as the Members may approve.</p>
            
            <p>1.3 <strong>Purpose.</strong> The Company is formed for any lawful purpose permitted under the Act, including but not limited to the design, manufacture, and sale of hinge mechanisms and related hardware components.</p>
            
            <p>1.4 <strong>Principal Office.</strong> The principal office of the Company shall be at 123 Innovation Drive, Suite 100, Charleston, South Carolina 29401, or such other place as the Members may designate.</p>
            
            <p>1.5 <strong>Term.</strong> The Company shall have perpetual existence unless dissolved in accordance with this Agreement or the Act.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE II - DEFINITIONS</h2>
        <div class="section">
            <p>For purposes of this Operating Agreement, the following terms shall have the meanings set forth below:</p>
            
            <div class="definition">
                <p><span class="definition-term">"Act"</span> means the South Carolina Uniform Limited Liability Company Act of 1996, S.C. Code Ann. § 33-44-101 et seq., as amended from time to time.</p>
            </div>
            
            <div class="definition">
                <p><span class="definition-term">"Agreement"</span> means this Operating Agreement, as amended from time to time.</p>
            </div>
            
            <div class="definition">
                <p><span class="definition-term">"Capital Account"</span> means the account maintained for each Member in accordance with Article IV.</p>
            </div>
            
            <div class="definition">
                <p><span class="definition-term">"Capital Contribution"</span> means any cash, property, services, or promissory note contributed to the Company by a Member.</p>
            </div>
            
            <div class="definition">
                <p><span class="definition-term">"Distributable Cash"</span> means cash available for distribution after payment of all Company expenses and obligations and reserves.</p>
            </div>
            
            <div class="definition">
                <p><span class="definition-term">"Majority Vote"</span> means the affirmative vote of Members holding more than fifty percent (50%) of the Membership Interests.</p>
            </div>
            
            <div class="definition">
                <p><span class="definition-term">"Manager"</span> means any person appointed to manage the Company's affairs.</p>
            </div>
            
            <div class="definition">
                <p><span class="definition-term">"Member"</span> means any person who holds a Membership Interest in the Company.</p>
            </div>
            
            <div class="definition">
                <p><span class="definition-term">"Membership Interest"</span> means a Member's entire ownership interest in the Company, including economic and governance rights.</p>
            </div>
            
            <div class="definition">
                <p><span class="definition-term">"Percentage Interest"</span> means a Member's share of the Company expressed as a percentage.</p>
            </div>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE III - MEMBERS</h2>
        <div class="section">
            <p>3.1 <strong>Initial Members.</strong> The names, addresses, and Percentage Interests of the initial Members are set forth in Exhibit A attached hereto.</p>
            
            <p>3.2 <strong>Admission of New Members.</strong> New Members may be admitted to the Company only upon:</p>
            <ul>
                <li>(a) The unanimous written consent of all existing Members;</li>
                <li>(b) Execution of a written agreement to be bound by this Agreement;</li>
                <li>(c) Payment of any required Capital Contribution; and</li>
                <li>(d) Amendment of Exhibit A to reflect the new Member's Percentage Interest.</li>
            </ul>
            
            <p>3.3 <strong>Representations and Warranties.</strong> Each Member represents and warrants that:</p>
            <ul>
                <li>(a) The Member has full power and authority to enter into this Agreement;</li>
                <li>(b) The Member is acquiring a Membership Interest for investment purposes only;</li>
                <li>(c) The Member is an "accredited investor" as defined in Regulation D under the Securities Act of 1933, or has such knowledge and experience in financial matters as to evaluate the risks of investment;</li>
                <li>(d) The Member understands that Membership Interests have not been registered under securities laws and are subject to restrictions on transfer.</li>
            </ul>
            
            <p>3.4 <strong>No Personal Liability.</strong> No Member shall be personally liable for the debts, obligations, or liabilities of the Company solely by reason of being a Member.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE IV - CAPITAL CONTRIBUTIONS AND ACCOUNTS</h2>
        <div class="section">
            <p>4.1 <strong>Initial Capital Contributions.</strong> Each Member shall make the initial Capital Contribution set forth in Exhibit A.</p>
            
            <p>4.2 <strong>Additional Contributions.</strong> No Member shall be required to make additional Capital Contributions except as unanimously agreed by all Members. Any additional contributions shall be made proportionally unless otherwise agreed.</p>
            
            <p>4.3 <strong>Capital Accounts.</strong> A Capital Account shall be established and maintained for each Member. Each Member's Capital Account shall be:</p>
            <ul>
                <li>(a) Increased by: (i) the amount of cash contributed by the Member; (ii) the fair market value of property contributed by the Member; and (iii) the Member's share of Company profits;</li>
                <li>(b) Decreased by: (i) distributions to the Member; (ii) the fair market value of property distributed to the Member; and (iii) the Member's share of Company losses.</li>
            </ul>
            
            <p>4.4 <strong>No Interest.</strong> No interest shall be paid on Capital Contributions or Capital Account balances.</p>
            
            <p>4.5 <strong>Return of Contributions.</strong> No Member shall have the right to withdraw or receive a return of Capital Contributions except upon dissolution or as otherwise provided in this Agreement.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE V - ALLOCATIONS AND DISTRIBUTIONS</h2>
        <div class="section">
            <p>5.1 <strong>Allocation of Profits and Losses.</strong> Profits and losses of the Company shall be allocated among the Members in proportion to their respective Percentage Interests.</p>
            
            <p>5.2 <strong>Distributions.</strong> Distributions of Distributable Cash shall be made to the Members at such times and in such amounts as determined by a Majority Vote of the Members, in proportion to their respective Percentage Interests.</p>
            
            <p>5.3 <strong>Tax Distributions.</strong> The Company shall distribute to each Member, at least quarterly, an amount sufficient to enable each Member to pay federal and state income taxes on Company income allocated to such Member (calculated at the highest marginal individual tax rate).</p>
            
            <p>5.4 <strong>Limitations on Distributions.</strong> No distribution shall be made if, after giving effect to the distribution:</p>
            <ul>
                <li>(a) The Company would be unable to pay its debts as they become due in the ordinary course of business; or</li>
                <li>(b) The Company's total assets would be less than its total liabilities.</li>
            </ul>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE VI - MANAGEMENT</h2>
        <div class="section">
            <p>6.1 <strong>Member-Managed.</strong> The Company shall be member-managed. Each Member shall have the authority to participate in the management of the Company and to bind the Company in the ordinary course of business.</p>
            
            <p>6.2 <strong>Voting.</strong> Except as otherwise provided in this Agreement, all decisions regarding the management of the Company shall be made by a Majority Vote of the Members.</p>
            
            <p>6.3 <strong>Major Decisions.</strong> The following decisions shall require the unanimous consent of all Members:</p>
            <ul>
                <li>(a) Amendment of the Articles of Organization or this Agreement;</li>
                <li>(b) Admission of new Members;</li>
                <li>(c) Merger, consolidation, or sale of substantially all Company assets;</li>
                <li>(d) Voluntary dissolution of the Company;</li>
                <li>(e) Incurrence of debt exceeding $50,000;</li>
                <li>(f) Entry into contracts exceeding $100,000 in value;</li>
                <li>(g) Acquisition or disposition of real property;</li>
                <li>(h) Commencement of litigation;</li>
                <li>(i) Any change to a Member's Percentage Interest.</li>
            </ul>
            
            <p>6.4 <strong>Officers.</strong> The Members may appoint officers with such titles, duties, and authority as determined by a Majority Vote. Officers shall serve at the pleasure of the Members.</p>
            
            <p>6.5 <strong>Meetings.</strong> The Members shall meet at least quarterly, or more frequently as needed. Meetings may be held in person, by telephone, or by video conference. Written notice shall be given at least ten (10) days in advance.</p>
            
            <p>6.6 <strong>Action Without Meeting.</strong> Any action required or permitted to be taken at a meeting may be taken without a meeting if all Members consent in writing.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE VII - TRANSFER OF MEMBERSHIP INTERESTS</h2>
        <div class="section">
            <p>7.1 <strong>Restrictions on Transfer.</strong> No Member may transfer, sell, assign, pledge, or otherwise dispose of all or any portion of their Membership Interest without the prior unanimous written consent of all other Members.</p>
            
            <p>7.2 <strong>Right of First Refusal.</strong> Before any Member may transfer their Membership Interest to a third party, the transferring Member must first offer the interest to the remaining Members on the same terms.</p>
            
            <p>7.3 <strong>Permitted Transfers.</strong> Notwithstanding the foregoing, a Member may transfer their Membership Interest to:</p>
            <ul>
                <li>(a) A trust for the benefit of the Member or their immediate family;</li>
                <li>(b) The Member's spouse or lineal descendants;</li>
                <li>(c) An entity wholly owned by the Member.</li>
            </ul>
            
            <p>7.4 <strong>Conditions to Transfer.</strong> Any permitted transferee must:</p>
            <ul>
                <li>(a) Execute a written agreement to be bound by this Agreement;</li>
                <li>(b) Provide such information as the Company may reasonably request;</li>
                <li>(c) Pay all costs associated with the transfer.</li>
            </ul>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE VIII - WITHDRAWAL AND DISSOCIATION</h2>
        <div class="section">
            <p>8.1 <strong>Voluntary Withdrawal.</strong> A Member may withdraw from the Company only with the unanimous consent of all other Members and upon at least ninety (90) days' prior written notice.</p>
            
            <p>8.2 <strong>Events of Dissociation.</strong> A Member shall be dissociated from the Company upon:</p>
            <ul>
                <li>(a) The Member's death;</li>
                <li>(b) The Member's bankruptcy or insolvency;</li>
                <li>(c) The Member's expulsion by unanimous vote of the other Members;</li>
                <li>(d) The Member's voluntary withdrawal in accordance with Section 8.1.</li>
            </ul>
            
            <p>8.3 <strong>Purchase of Dissociated Member's Interest.</strong> Upon a Member's dissociation, the Company or the remaining Members shall have the option to purchase the dissociated Member's interest at fair market value.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE IX - DISSOLUTION AND WINDING UP</h2>
        <div class="section">
            <p>9.1 <strong>Events Causing Dissolution.</strong> The Company shall be dissolved upon:</p>
            <ul>
                <li>(a) The unanimous written consent of all Members;</li>
                <li>(b) The entry of a judicial decree of dissolution;</li>
                <li>(c) The occurrence of any event specified in the Articles of Organization;</li>
                <li>(d) Any event making it unlawful to continue Company business.</li>
            </ul>
            
            <p>9.2 <strong>Winding Up.</strong> Upon dissolution, the Company's affairs shall be wound up by the Members or a liquidating trustee appointed by the Members.</p>
            
            <p>9.3 <strong>Order of Distribution.</strong> Upon winding up, Company assets shall be distributed in the following order:</p>
            <ul>
                <li>(a) Payment of debts and liabilities to creditors;</li>
                <li>(b) Payment of expenses of winding up;</li>
                <li>(c) Establishment of reserves for contingent liabilities;</li>
                <li>(d) Distribution to Members in proportion to their positive Capital Account balances.</li>
            </ul>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE X - INDEMNIFICATION</h2>
        <div class="section">
            <p>10.1 <strong>Indemnification.</strong> The Company shall indemnify any Member, Manager, officer, employee, or agent who was or is a party to any proceeding by reason of their relationship with the Company, to the fullest extent permitted by the Act.</p>
            
            <p>10.2 <strong>Advancement of Expenses.</strong> The Company shall advance reasonable expenses incurred in defending any proceeding, subject to repayment if the person is ultimately determined not to be entitled to indemnification.</p>
            
            <p>10.3 <strong>Insurance.</strong> The Company may purchase and maintain insurance on behalf of any person entitled to indemnification.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE XI - RECORDS AND ACCOUNTING</h2>
        <div class="section">
            <p>11.1 <strong>Books and Records.</strong> The Company shall maintain complete and accurate books and records, including:</p>
            <ul>
                <li>(a) A current list of Members and their addresses;</li>
                <li>(b) Copies of tax returns for the last three years;</li>
                <li>(c) Copies of the Articles of Organization and this Agreement;</li>
                <li>(d) Financial statements;</li>
                <li>(e) Minutes of all Member meetings.</li>
            </ul>
            
            <p>11.2 <strong>Fiscal Year.</strong> The fiscal year of the Company shall be the calendar year.</p>
            
            <p>11.3 <strong>Tax Matters.</strong> The Company shall be treated as a partnership for federal income tax purposes. The Company shall file all required tax returns and provide each Member with Schedule K-1 or equivalent.</p>
            
            <p>11.4 <strong>Tax Matters Partner.</strong> The initial Tax Matters Partner shall be designated by a Majority Vote of the Members.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE XII - MISCELLANEOUS</h2>
        <div class="section">
            <p>12.1 <strong>Governing Law.</strong> This Agreement shall be governed by and construed in accordance with the laws of the State of South Carolina.</p>
            
            <p>12.2 <strong>Dispute Resolution.</strong> Any dispute arising under this Agreement shall be resolved by binding arbitration in Charleston, South Carolina, in accordance with the Commercial Arbitration Rules of the American Arbitration Association.</p>
            
            <p>12.3 <strong>Entire Agreement.</strong> This Agreement constitutes the entire agreement among the Members concerning the subject matter hereof and supersedes all prior agreements.</p>
            
            <p>12.4 <strong>Amendment.</strong> This Agreement may be amended only by a written instrument signed by all Members.</p>
            
            <p>12.5 <strong>Severability.</strong> If any provision of this Agreement is held invalid, the remaining provisions shall remain in full force and effect.</p>
            
            <p>12.6 <strong>Waiver.</strong> No waiver of any provision shall be effective unless in writing and signed by the waiving party.</p>
            
            <p>12.7 <strong>Notices.</strong> All notices shall be in writing and delivered personally, by certified mail, or by recognized overnight courier to the address on file with the Company.</p>
            
            <p>12.8 <strong>Counterparts.</strong> This Agreement may be executed in counterparts, each of which shall be an original.</p>
        </div>
    </div>

    <div class="signature-block">
        <h2>EXECUTION</h2>
        <p>IN WITNESS WHEREOF, the undersigned Members have executed this Operating Agreement as of the date first written above.</p>
        
        <div class="signature-line">
            <p>Member Signature</p>
        </div>
        <p>Print Name: _________________________________</p>
        <p>Date: _________________________________</p>
        
        <div class="signature-line">
            <p>Member Signature</p>
        </div>
        <p>Print Name: _________________________________</p>
        <p>Date: _________________________________</p>
    </div>

    <div class="page-break"></div>
    
    <div class="article">
        <h2>EXHIBIT A - MEMBERS</h2>
        <table>
            <tr>
                <th>Member Name</th>
                <th>Address</th>
                <th>Initial Capital Contribution</th>
                <th>Percentage Interest</th>
            </tr>
            <tr>
                <td>[Member 1 Name]</td>
                <td>[Address]</td>
                <td>$[Amount]</td>
                <td>[XX]%</td>
            </tr>
            <tr>
                <td>[Member 2 Name]</td>
                <td>[Address]</td>
                <td>$[Amount]</td>
                <td>[XX]%</td>
            </tr>
        </table>
    </div>
"""

# Document 3: Stakeholder Ethos & Ethics Charter
DOC_03_CONTENT = """
    <div class="article">
        <h2>PREAMBLE</h2>
        <div class="section">
            <p>HingeCraft Global, LLC ("HingeCraft" or the "Company") is committed to conducting its business with the highest standards of ethics, integrity, and social responsibility. This Stakeholder Ethos & Ethics Charter (the "Charter") establishes the foundational principles and values that guide all Company operations, relationships, and decisions.</p>
            
            <p>We recognize that our success depends not only on financial performance but also on our commitment to ethical conduct, environmental stewardship, and positive contributions to the communities in which we operate. This Charter reflects our dedication to these principles and serves as a guide for all stakeholders.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE I - CORE VALUES</h2>
        <div class="section">
            <h3>1.1 Integrity</h3>
            <p>We conduct all business with honesty, transparency, and adherence to the highest ethical standards. We do what we say, and we say what we mean. Our word is our bond, and we honor our commitments.</p>
            
            <h3>1.2 Excellence</h3>
            <p>We strive for excellence in all aspects of our work, from product design and manufacturing to customer service and community engagement. We continuously seek to improve and innovate.</p>
            
            <h3>1.3 Respect</h3>
            <p>We treat all individuals with dignity, respect, and fairness, regardless of their position, background, or circumstances. We value diversity and inclusion as essential elements of our culture.</p>
            
            <h3>1.4 Responsibility</h3>
            <p>We take responsibility for our actions and their impact on stakeholders, communities, and the environment. We are accountable to ourselves, each other, and society at large.</p>
            
            <h3>1.5 Innovation</h3>
            <p>We embrace creativity, curiosity, and the pursuit of new ideas. We encourage thoughtful risk-taking and learn from both successes and failures.</p>
            
            <h3>1.6 Sustainability</h3>
            <p>We are committed to environmental stewardship and sustainable business practices that preserve resources for future generations.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE II - ETHICAL BUSINESS CONDUCT</h2>
        <div class="section">
            <h3>2.1 Legal Compliance</h3>
            <p>The Company and all its representatives shall comply with all applicable federal, state, and local laws, regulations, and ordinances, including but not limited to:</p>
            <ul>
                <li>(a) South Carolina business laws and regulations;</li>
                <li>(b) Federal and state employment laws;</li>
                <li>(c) Environmental protection laws;</li>
                <li>(d) Consumer protection laws;</li>
                <li>(e) Intellectual property laws;</li>
                <li>(f) Tax laws and reporting requirements;</li>
                <li>(g) International trade and export control laws.</li>
            </ul>
            
            <h3>2.2 Anti-Corruption and Bribery</h3>
            <p>The Company maintains a zero-tolerance policy for corruption, bribery, and other improper payments. No employee, officer, or representative shall:</p>
            <ul>
                <li>(a) Offer, promise, or give anything of value to any person to influence their actions or decisions;</li>
                <li>(b) Accept or solicit anything of value that could influence business decisions;</li>
                <li>(c) Facilitate payments to expedite routine governmental actions;</li>
                <li>(d) Engage in kickbacks, payoffs, or other corrupt practices.</li>
            </ul>
            
            <h3>2.3 Conflicts of Interest</h3>
            <p>All stakeholders must avoid situations where personal interests conflict, or appear to conflict, with the interests of the Company. Conflicts of interest must be promptly disclosed to appropriate Company leadership.</p>
            
            <h3>2.4 Fair Competition</h3>
            <p>The Company competes fairly and ethically in all markets. We do not engage in:</p>
            <ul>
                <li>(a) Price fixing, bid rigging, or market allocation;</li>
                <li>(b) Misappropriation of competitors' trade secrets;</li>
                <li>(c) False or misleading advertising;</li>
                <li>(d) Unfair or deceptive trade practices.</li>
            </ul>
            
            <h3>2.5 Accurate Records and Reporting</h3>
            <p>The Company maintains accurate and complete business records. All financial reports, business documents, and other records must truthfully reflect the Company's activities and financial condition.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE III - STAKEHOLDER COMMITMENTS</h2>
        <div class="section">
            <h3>3.1 Commitment to Customers</h3>
            <p>We are committed to providing our customers with:</p>
            <ul>
                <li>(a) High-quality products that meet or exceed specifications;</li>
                <li>(b) Safe products that comply with all applicable safety standards;</li>
                <li>(c) Honest and accurate product information;</li>
                <li>(d) Responsive and respectful customer service;</li>
                <li>(e) Fair and transparent pricing;</li>
                <li>(f) Protection of customer privacy and data;</li>
                <li>(g) Prompt and fair resolution of complaints.</li>
            </ul>
            
            <h3>3.2 Commitment to Employees</h3>
            <p>We are committed to providing our employees with:</p>
            <ul>
                <li>(a) A safe, healthy, and harassment-free workplace;</li>
                <li>(b) Fair compensation and benefits;</li>
                <li>(c) Equal opportunity without discrimination;</li>
                <li>(d) Respect for privacy and personal dignity;</li>
                <li>(e) Opportunities for professional development and advancement;</li>
                <li>(f) Open communication and transparent decision-making;</li>
                <li>(g) Protection for whistleblowers who report concerns in good faith.</li>
            </ul>
            
            <h3>3.3 Commitment to Suppliers and Partners</h3>
            <p>We are committed to:</p>
            <ul>
                <li>(a) Fair and ethical treatment of all suppliers and business partners;</li>
                <li>(b) Timely payment in accordance with contract terms;</li>
                <li>(c) Open and honest communication;</li>
                <li>(d) Respect for confidential business information;</li>
                <li>(e) Selection of suppliers based on merit, quality, and ethical standards;</li>
                <li>(f) Encouraging suppliers to adopt sustainable and ethical practices.</li>
            </ul>
            
            <h3>3.4 Commitment to Investors and Owners</h3>
            <p>We are committed to:</p>
            <ul>
                <li>(a) Responsible stewardship of invested capital;</li>
                <li>(b) Transparent and accurate financial reporting;</li>
                <li>(c) Prudent risk management;</li>
                <li>(d) Long-term value creation;</li>
                <li>(e) Regular and open communication regarding Company performance.</li>
            </ul>
            
            <h3>3.5 Commitment to Communities</h3>
            <p>We are committed to:</p>
            <ul>
                <li>(a) Being a responsible corporate citizen in all communities where we operate;</li>
                <li>(b) Supporting local economic development;</li>
                <li>(c) Contributing to charitable and community organizations;</li>
                <li>(d) Encouraging employee volunteerism;</li>
                <li>(e) Engaging constructively with community stakeholders.</li>
            </ul>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE IV - ENVIRONMENTAL STEWARDSHIP</h2>
        <div class="section">
            <h3>4.1 Environmental Policy</h3>
            <p>The Company is committed to minimizing its environmental impact and promoting sustainable practices throughout its operations and supply chain.</p>
            
            <h3>4.2 Environmental Commitments</h3>
            <p>We commit to:</p>
            <ul>
                <li>(a) Compliance with all applicable environmental laws and regulations;</li>
                <li>(b) Continuous improvement in environmental performance;</li>
                <li>(c) Reduction of waste, emissions, and resource consumption;</li>
                <li>(d) Responsible use and disposal of hazardous materials;</li>
                <li>(e) Design of products with environmental considerations;</li>
                <li>(f) Promotion of recycling and circular economy principles;</li>
                <li>(g) Transparent reporting of environmental performance;</li>
                <li>(h) Engagement with stakeholders on environmental issues.</li>
            </ul>
            
            <h3>4.3 Climate Responsibility</h3>
            <p>The Company recognizes the importance of addressing climate change and commits to:</p>
            <ul>
                <li>(a) Measuring and reporting greenhouse gas emissions;</li>
                <li>(b) Setting and pursuing emission reduction targets;</li>
                <li>(c) Investing in energy efficiency and renewable energy;</li>
                <li>(d) Supporting climate-related research and innovation.</li>
            </ul>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE V - HUMAN RIGHTS</h2>
        <div class="section">
            <h3>5.1 Human Rights Policy</h3>
            <p>The Company respects and supports the protection of internationally recognized human rights and will not be complicit in human rights abuses.</p>
            
            <h3>5.2 Human Rights Commitments</h3>
            <p>We commit to:</p>
            <ul>
                <li>(a) Prohibition of forced labor, child labor, and human trafficking;</li>
                <li>(b) Fair wages and reasonable working hours;</li>
                <li>(c) Freedom of association and collective bargaining;</li>
                <li>(d) Non-discrimination and equal opportunity;</li>
                <li>(e) Safe and healthy working conditions;</li>
                <li>(f) Due diligence in supply chain human rights;</li>
                <li>(g) Remediation of adverse human rights impacts.</li>
            </ul>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE VI - GOVERNANCE AND ACCOUNTABILITY</h2>
        <div class="section">
            <h3>6.1 Leadership Responsibility</h3>
            <p>Company leadership is responsible for:</p>
            <ul>
                <li>(a) Establishing and maintaining a culture of ethics and integrity;</li>
                <li>(b) Ensuring adequate resources for ethics and compliance programs;</li>
                <li>(c) Leading by example in ethical conduct;</li>
                <li>(d) Reviewing and updating this Charter regularly.</li>
            </ul>
            
            <h3>6.2 Reporting Concerns</h3>
            <p>The Company maintains multiple channels for reporting ethical concerns:</p>
            <ul>
                <li>(a) Direct communication with supervisors or management;</li>
                <li>(b) Ethics hotline: (843) 555-0199;</li>
                <li>(c) Email: ethics@hingecraft.com;</li>
                <li>(d) Written reports to the Ethics Committee.</li>
            </ul>
            
            <h3>6.3 Non-Retaliation</h3>
            <p>The Company prohibits retaliation against any person who reports concerns in good faith. Reports may be made anonymously where permitted by law.</p>
            
            <h3>6.4 Investigation and Enforcement</h3>
            <p>All reported concerns will be promptly and thoroughly investigated. Violations of this Charter may result in disciplinary action, up to and including termination of employment or business relationships.</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE VII - IMPLEMENTATION</h2>
        <div class="section">
            <h3>7.1 Training and Communication</h3>
            <p>The Company will:</p>
            <ul>
                <li>(a) Provide regular ethics and compliance training to all employees;</li>
                <li>(b) Communicate this Charter to all stakeholders;</li>
                <li>(c) Integrate ethical considerations into decision-making processes;</li>
                <li>(d) Recognize and reward ethical behavior.</li>
            </ul>
            
            <h3>7.2 Monitoring and Review</h3>
            <p>The Company will:</p>
            <ul>
                <li>(a) Monitor compliance with this Charter;</li>
                <li>(b) Conduct periodic ethics audits;</li>
                <li>(c) Review and update this Charter at least annually;</li>
                <li>(d) Report on ethics and compliance performance to stakeholders.</li>
            </ul>
        </div>
    </div>

    <div class="signature-block">
        <h2>ADOPTION</h2>
        <p>This Stakeholder Ethos & Ethics Charter has been adopted by the Members of HingeCraft Global, LLC and is effective as of the date first written above.</p>
        
        <div class="signature-line">
            <p>Member/Manager Signature</p>
        </div>
        <p>Print Name: _________________________________</p>
        <p>Title: _________________________________</p>
        <p>Date: _________________________________</p>
    </div>
"""

# Continue with more documents... (will create all 34)

def generate_all_documents():
    """Generate all 34 legal documents"""
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    documents = [
        ("01-Corporate-Formation-Charter-Articles-of-Organization.html", "Articles of Organization / Corporate Formation Charter", DOC_01_CONTENT),
        ("02-Operating-Agreement-Corporate-Bylaws.html", "Operating Agreement / Corporate Bylaws", DOC_02_CONTENT),
        ("03-Stakeholder-Ethos-Ethics-Charter.html", "Stakeholder Ethos & Ethics Charter", DOC_03_CONTENT),
    ]
    
    created_count = 0
    
    for filename, title, content in documents:
        filepath = OUTPUT_DIR / filename
        html_content = create_html_document(title, content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"✅ Created: {filename}")
        created_count += 1
    
    return created_count

if __name__ == "__main__":
    print("=" * 80)
    print("GENERATING COMPLETE SOUTH CAROLINA LEGAL DOCUMENTS")
    print("=" * 80)
    print()
    
    # Generate first 3 documents to start
    count = generate_all_documents()
    
    print()
    print(f"✅ Created {count} documents (Part 1 of 12)")
    print(f"📁 Location: {OUTPUT_DIR}")
    print()
    print("Continuing with remaining documents...")



