"""
Cred Domain Support Agent - Policy Knowledge Base

Contains 12 comprehensive policy documents covering all mandatory banking & lending topics.
Each document strictly contains 2-5 well-structured, domain-accurate sentences.
"""

from typing import List, Dict

POLICY_DOCUMENTS: List[Dict[str, str]] = [
    {
        "doc_id": "DOC-LOAN-ELIGIBILITY",
        "topic": "loan eligibility criteria by loan type",
        "title": "Loan Eligibility Criteria by Loan Type",
        "content": (
            "Cred lending eligibility requires salaried applicants to be aged 21 to 58 with a minimum net monthly income of ₹35,000 for Personal Loans, whereas self-employed professionals require at least two consecutive profitable business assessment years. "
            "Home loan applicants must demonstrate a steady debt-to-income ratio below 50% alongside co-applicant collateral verification for properties located within approved municipal zones. "
            "Auto and education loans mandate a minimum credit score of 720, with education loans exceeding ₹750,000 requiring a parent or guardian as primary financial co-guarantor."
        ),
    },
    {
        "doc_id": "DOC-EMI-CALCULATION",
        "topic": "EMI calculation rules",
        "title": "Equated Monthly Installment (EMI) Calculation Rules",
        "content": (
            "All amortizing loans offered through Cred compute monthly dues via the standard monthly reducing balance method using the formula EMI = [P x R x (1+R)^N] / [(1+R)^N - 1], where P is principal, R is monthly interest rate, and N is tenure in months. "
            "Under this method, the principal repayment proportion progressively increases each billing cycle while the interest portion contracts in proportion to the outstanding balance. "
            "EMI repayments are debited automatically on the 5th of each calendar month via authorized National Automated Clearing House (NACH) e-mandates."
        ),
    },
    {
        "doc_id": "DOC-CREDIT-CARD-FEES",
        "topic": "credit-card fee structure",
        "title": "Credit Card Fee Structure and Billing Schedule",
        "content": (
            "Cred credit cards carry an annual membership charge of ₹1,500, which is fully waived for members who achieve annual retail spends exceeding ₹150,000 in the preceding anniversary year. "
            "Finance charges on rolling balances or revolving credit lines accrue at 3.50% per month (42.00% annualized percentage rate) calculated from the transaction posting date. "
            "Late payment fees follow a graded tier structure starting from ₹100 for balances below ₹1,000 up to ₹1,200 for outstanding balances exceeding ₹50,000, supplemented by mandatory 18% Goods and Services Tax (GST)."
        ),
    },
    {
        "doc_id": "DOC-KYC-REQUIREMENTS",
        "topic": "KYC document requirements",
        "title": "Know Your Customer (KYC) Document Requirements",
        "content": (
            "In compliance with Reserve Bank of India Master Directions, KYC onboarding mandates submission of a Permanent Account Number (PAN) card together with one Officially Valid Document (OVD) for proof of identity and current address. "
            "Acceptable OVD proofs comprise Aadhaar card with masked identity numbers, valid Indian Passport, Voter Identity Card, or Driving License. "
            "Salaried applicants must furnish the most recent three months' salary slips and six months' bank statements, while self-employed entities must provide audited Form 16 or ITR acknowledgments for the past two fiscal years."
        ),
    },
    {
        "doc_id": "DOC-FRAUD-DISPUTE",
        "topic": "fraud-dispute resolution process",
        "title": "Fraud Dispute Resolution and Chargeback Workflow",
        "content": (
            "Cardholders and loan borrowers must notify Cred fraud operations within 72 hours of detecting any unauthorized transaction or suspect account compromise to enjoy zero-liability protection under RBI customer protection directives. "
            "Upon notification, the affected instrument is immediately placed under freeze status and a dedicated dispute reference number (URN) is issued to the member within two business hours. "
            "The internal dispute investigation team reviews merchant logs, IP geolocations, and authentication payloads to complete formal chargeback arbitration within a maximum turnaround time of 30 calendar days."
        ),
    },
    {
        "doc_id": "DOC-ACCOUNT-CLOSURE",
        "topic": "account-closure process",
        "title": "Loan Account Closure and Lien Release Process",
        "content": (
            "A loan account closure request can only be finalized after the borrower clears all principal dues, accrued interest, pending insurance fees, and unbilled charges to achieve a certified zero outstanding ledger. "
            "Following successful settlement verification, Cred issues an automated digital No Objection Certificate (NOC) and loan closure certificate to the customer's registered email within 7 business days. "
            "Any physical property title deeds or vehicular hypothecation liens registered with regional transport offices are released within 30 days of closure in accordance with regulatory mandate."
        ),
    },
    {
        "doc_id": "DOC-INTEREST-SLABS",
        "topic": "interest-rate slabs",
        "title": "Interest Rate Slabs and Risk-Based Pricing Grid",
        "content": (
            "Cred lending utilizes risk-adjusted benchmark-linked pricing pegged to the RBI Repo Rate with defined credit risk spread margins ranging from 4.25% to 14.50%. "
            "Tier-1 prime borrowers boasting credit bureau scores of 780 and above qualify for preferential rates between 10.25% and 12.50% per annum for unsecured personal loans. "
            "Tier-2 applicants with credit scores between 700 and 779 receive rate quotes spanning 13.00% to 16.75%, whereas scores below 700 are routed to specialized secured programs or credit-builder terms."
        ),
    },
    {
        "doc_id": "DOC-PREPAYMENT-PENALTY",
        "topic": "prepayment-penalty rules",
        "title": "Prepayment and Foreclosure Penalty Guidelines",
        "content": (
            "In strict adherence to RBI circular guidelines, zero foreclosure charges or prepayment penalties are levied on floating-rate term loans sanctioned to individual retail borrowers for non-business purposes. "
            "For fixed-rate personal loans and commercial business borrowing facilities, a prepayment fee of up to 2.50% of the principal amount prepaid is applicable if liquidated within the first 12 EMI cycles. "
            "Partial prepayments require a minimum threshold of two monthly EMI sums and borrowers may elect either to curtail the remaining loan tenure or adjust the future monthly installment."
        ),
    },
    {
        "doc_id": "DOC-MIN-BALANCE",
        "topic": "minimum-balance requirements",
        "title": "Minimum Balance and Average Quarterly Balance (AQB) Rules",
        "content": (
            "Cred member savings accounts opened in metro branches require maintenance of an Average Monthly Balance (AMB) or Average Quarterly Balance (AQB) of ₹10,000, reduced to ₹5,000 in semi-urban centers. "
            "If the average balance slips below prescribed thresholds during the evaluation period, an automated non-maintenance penalty not exceeding ₹350 plus applicable taxes is assessed after prior SMS warning. "
            "Basic Savings Bank Deposit Accounts (BSBDA) and corporate salary payroll accounts are classified as zero-balance accounts and carry no minimum holding requirement whatsoever."
        ),
    },
    {
        "doc_id": "DOC-CREDIT-SCORE-IMPACT",
        "topic": "credit-score impact factors",
        "title": "Credit Score Determinants and Bureau Impact Factors",
        "content": (
            "A member's credit score is calculated across four major weighting pillars: on-time repayment history accounts for 35%, revolving credit utilization ratio represents 30%, credit history vintage accounts for 15%, and credit mix plus hard inquiries contribute the remaining 20%. "
            "Maintaining credit utilization consistently below 30% of authorized limits and preventing 30-day payment delinquencies are the most effective strategies to secure a bureau score above 750. "
            "Submitting multiple unsecured loan applications within a narrow window generates clustered hard inquiries that temporarily depress the borrower's score by 5 to 15 points."
        ),
    },
    {
        "doc_id": "DOC-JOINT-ACCOUNT",
        "topic": "joint-account rules",
        "title": "Joint Account Operations and Borrowing Mandates",
        "content": (
            "Joint accounts may be constituted with primary holders, spouses, immediate blood relatives, or authorized business partners under operating modes including Either or Survivor, Former or Survivor, or Jointly Operated. "
            "For co-borrowed credit facilities, all co-applicants assume joint and several liability for the entire repayment obligation irrespective of proportional loan equity shares. "
            "Closure of a joint account, addition or deletion of operational signatories, or pledging the account as loan collateral requires explicit written assent and biometric authentication from all registered holders."
        ),
    },
    {
        "doc_id": "DOC-NRI-ELIGIBILITY",
        "topic": "NRI-account eligibility",
        "title": "Non-Resident Indian (NRI) Account and Loan Eligibility",
        "content": (
            "Non-Resident Indians (NRIs) and Persons of Indian Origin (PIOs) residing overseas are eligible to maintain Non-Resident External (NRE) and Non-Resident Ordinary (NRO) deposit accounts governed by FEMA guidelines. "
            "NRE account balances and interest yields remain completely exempt from Indian income taxation and are freely repatriable into foreign currency accounts without regulatory ceiling. "
            "NRI borrowers can secure home loans for residential properties in India provided repayments originate from foreign inward remittances through NRE accounts or lawful local rupee earnings via NRO channels."
        ),
    },
]

DOCS_BY_ID = {doc["doc_id"]: doc for doc in POLICY_DOCUMENTS}
