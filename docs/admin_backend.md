# Admin Backend System Architecture

## Part 1: The Master Plan (System Architecture)
We will categorize the admin section into four primary "Control Hubs."

### 1. Product & Pricing Engine (The "Brain")
*   **Profile Management:** CRUD (Create, Read, Update, Delete) for PVC, Aluminum, and Timber profiles (e.g., Schüco, Veka, Alumil).
*   **Pricing Matrix:** Dynamic price adjustments based on glass type, hardware (MACO, Roto), dimensions, and color (RAL).
*   **Margin Control:** Ability to set global or partner-specific markups.

### 2. The Sales & Marketing Ecosystem
*   **Channel Management:** Toggle between Direct Sales, External Agents, and the Partner Network.
*   **Commission Tracking:** Automatic calculation for external sales reps.
*   **Marketing Suite:** Lead source tracking (Google Ads, Meta, Trade Shows) and ROI calculators.

### 3. Fulfillment & Operations (The "Pipeline")
*   **Order Lifecycle:** Tracking status from Deposit Paid → To Manufacturing → Quality Check.
*   **Logistics Hub:** Monitoring Loading, Transit, and Final Delivery (Site vs. Warehouse).
*   **Installation Management:** Schedule teams, track site photos, and sign-offs.

### 4. Financials & Analytics
*   **Payment Ledger:** Tracking deposits, interim payments, and final balances.
*   **Performance Metrics:** Conversion rates by sales person and most popular profile systems.

---

## Part 2: Dummy Order Data (20 Records)
Here are 20 fake orders utilizing real-world profile systems and product types to test system logic:

| Order ID | Customer Name | Product Type | Profile System | Sales Channel | Total Value | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| W-9001 | Apex Office Park | Curtain Wall | Schüco FWS 50 | Partner (Build-IT) | €45,200 | In Transit |
| W-9002 | John Smith | Tilt & Turn | Veka Softline 82 | Direct Sales | €8,400 | Manufacturing |
| W-9003 | Riviera Villas | Lift & Slide | Reynaers CP 130 | External Agent | €22,100 | Site Delivery |
| W-9004 | Sarah Jenkins | Casement | Rehau Geneo | Direct Sales | €5,600 | Deposit Paid |
| W-9005 | Metro Lofts | Bifold Doors | Alumil S67 | Partner (City-GLZ) | €31,000 | Ready for Loading |
| W-9006 | Green Tech HQ | Fixed Frames | Schüco AWS 75 | Direct Sales | €12,900 | Installation |
| W-9007 | Bob’s Reno | French Doors | Kömmerling 76 | External Agent | €4,200 | Warehouse |
| W-9008 | Luxury Heights | Sliding System | Cortizo Cor-Vision | Partner (Sky-High) | €58,000 | In Transit |
| W-9009 | Emily Davis | Entrance Door | Pirnar Optimum | Direct Sales | €3,800 | Manufacturing |
| W-9010 | Oak Residence | Tilt & Turn | Veka Softline 76 | External Agent | €11,200 | Quality Check |
| W-9011 | Marina Bay | Glass Balustrade | Alumil M8200 | Partner (Oceanic) | €15,500 | Loading |
| W-9012 | Tech Hub Inc | Fire Rated | Schüco ADS 80 | Direct Sales | €27,400 | Final Payment |
| W-9013 | Michael Ross | Bifold Doors | Reynaers CF 77 | Direct Sales | €9,100 | Installation |
| W-9014 | Urban Flats | Casement | Kömmerling 88 | Partner (Urban) | €18,300 | Manufacturing |
| W-9015 | Coastal Retreat | Sliding System | Schüco ASE 60 | External Agent | €14,000 | Site Delivery |
| W-9016 | David Miller | Tilt & Turn | Rehau Synego | Direct Sales | €7,200 | Order Placed |
| W-9017 | The Grand Hotel | Full Facade | Alumil S77 | Partner (Contract) | €112,000 | Manufacturing |
| W-9018 | Alice Wong | Sash Windows | Veka Heritage | Direct Sales | €6,400 | Ready for Loading |
| W-9019 | Smart Storage | Industrial Door | Hormann ProMatic | External Agent | €3,100 | Warehouse |
| W-9020 | Bella Vista | Lift & Slide | Reynaers CP 155 | Partner (Vista) | €42,600 | Installation |

---

## Part 3: Development Prompts

*   **Prompt 1: The Database Schema**
    "Generate a SQL database schema for a Window Configurator Admin System. Include tables for: Products (profile brand, material, U-value), Pricing (base cost, markup %, hardware cost), Sales Channels (Direct, External Agents, Partners), Orders (linking to logistics and installation tables), and Marketing (Lead source, ad spend per channel). Ensure relationships support tracking an order from deposit to final site installation."

*   **Prompt 2: The Logistics Pipeline UI**
    "Create a React-based Dashboard UI (using Tailwind CSS) that visualizes the 'Order-to-Delivery' pipeline. I need a Kanban-style board with columns: Order Placed, Manufacturing, Quality Control, Loading, Transit, and Delivered. Each card should show the Order ID, Profile System (e.g., Schüco, Veka), Sales Channel, and a progress bar for payment status."

*   **Prompt 3: Sales Network & Marketing Analytics**
    "Design a functional logic for a 'Partner Network' module. The system should allow me to assign different discount tiers to partners. Generate a report view that compares 'Direct Sales' vs 'Partner Sales' ROI, factoring in marketing spend for direct sales and commission payouts for external agents. Include a 'Marketing Performance' chart showing Lead Conversion Rates per platform (Google vs Meta)."

*   **Prompt 4: Installation & Field Tracking**
    "Generate a mobile-responsive interface for installation teams. It must include a daily schedule, a checklist for 'Site Readiness,' a photo upload button for completed installations, and a digital signature pad for customer sign-off. This data must sync back to the main Admin Order Tracking system."

---

## Part 4: The "Secret Sauce" Features
*   **Automated Load Optimization:** A tool that calculates how many frames can fit on a specific truck size (e.g., 3.5t vs 7.5t).
*   **Live Map Tracking:** Integrating GPS data from delivery trucks so customers get a "Your windows are 20 minutes away" notification.
*   **AI Profit Guard:** An alert system that flags orders where the margin drops below 15% due to custom requests or shipping distances.

---

## Architectural Analysis & Systems Comparison
*(Generated by Antigravity based on your Master Plan)*

Your Master Plan is exceptionally well-structured for a high-volume B2B/B2C hybrid window distribution business. It correctly identifies the complexity of managing different sales channels simultaneously (Direct vs. Agents vs. White-label Partners).

### What Matches Our Current Trajectory:
1. **Pricing Engine ("The Brain"):** This aligns perfectly with our ongoing work extracting Cantor SQL logic. Our `/debug-pricing` page is the precursor to this Admin module.
2. **Sales & Marketing Ecosystem:** We recently built the initial `PartnerLayout` and `PartnerDashboard` which handles lead tracking and QR-code routing. Your proposed tiering system directly augments this.

### Missing Elements / Recommended Additions:
To make this system truly bulletproof and tailored to your specific workflow with Drutex and Cantor, I recommend injecting the following functionality into the architecture:

1. **Cantor ERP Synchronization Hub:** 
   Because Drutex relies heavily on Cantor, your Admin system cannot exist as a disconnected island. The Admin needs a "Sync Hub" to schedule, monitor, and resolve conflicts when pulling updated pricing matrices, hardware lookup tables, and glass schemas from the local SQL server.

2. **User & Roles Permission Matrix (RBAC):** 
   You need strict boundaries. A partner should only see their orders, an agent sees their regional pipeline, and an internal admin sees the global overview. The database schema (Prompt 1) will need a highly robust `Users_Roles` mapping to facilitate this.

3. **Quotation-to-Order Conversion Pipeline:** 
   The pipeline actually starts *before* an order is placed. The Admin needs a "Quotation Hub" where complex, non-standard requests (e.g., custom arch angles) from the public configurator drop into a queue for manual admin review and pricing override *before* they are officially converted into an "Order".

4. **Partner White-label Management:** 
   Since we are offering partners customized landing pages, the Admin panel needs a "Brand Manager" module to configure partner sub-domains, upload their logos, and set their specific margin overrides across the configurator.

### Recommendation on How to Proceed
I recommend we start by executing **Prompt 2: The Logistics Pipeline UI**. 

Since we already have the basic scaffolding for `/admin` (via `AdminLayout.tsx` and `AdminDashboard.tsx`), we can inject your dummy data and build out the highly visual Kanban board. This will give us an immediate, functional overview of the pipeline that we can then wire up to the Pricing Engine and Database Schema in subsequent steps.
