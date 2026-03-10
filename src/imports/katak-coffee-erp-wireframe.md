FIGMA AI MASTER PROMPT: KATAK COFFEE ERP (SUPPLY & PRODUCTION MODULE)
Role: Expert Systems Architect & UI/UX Designer.
Project Goal: Create a Low-Fidelity (Lo-Fi) Black & White Wireframe for the Back-end Supply Chain and Production Workflow.
Visual Constraint: Strictly use B&W/Grayscale. No colors, no shadows, no gradients. Use 1px solid borders. 8pt grid system. Typography: Sans-serif (Bold for headers, Regular for body).

🏛️ GLOBAL LAYOUT STRUCTURE

Left Sidebar: Navigation menu including: "Suppliers", "Raw Materials", "BOM Management", "Production Orders", "Stock Ledger", "Traceability".
+3

Top Bar: Breadcrumbs, User Profile (Role: Admin/Inventory), and Global Search.

Main Canvas: 12-column grid, 1440px width, 24px gutter.

📦 MODULE 1: SUPPLIER & MATERIAL PROCUREMENT (UC35, UC37, UC44)
Screen 1: Material Inbound (GRN Form)

Header: Title "Import Material & Sensory Audit" + Buttons "Save as Draft", "Confirm Inbound".


Supplier Info Block: - Searchable Dropdown: "Select Supplier".

Read-only fields: "Supplier Code" (3 chars), "Tax Code".
+2


Line Items Table: - Columns: Material Name, Unit (Kg), Import Qty, Unit Price (VNĐ), Batch Code (MAT-...), Expiry Date.
+3

Sensory Audit Component (Micro-interaction): - Trigger: Click row to open Side Drawer.

Inputs: Numeric sliders (1-10) for: Aroma, Body, Aftertaste, Acidity, Sweetness.
+2

Result: Auto-calculate and display "Batch Integrity Score".

🧪 MODULE 2: PRODUCTION SETUP - BOM & MASTER DATA (UC36)
Screen 2: Product Master & Bill of Materials (BOM)


Product Details Block: SKU (Read-only), Barcode, Category (Dropdown), Sale Price (VNĐ).

BOM Management Table (The Recipe): - Requirement: Define ingredients for 1 unit (e.g., 1 bag of 500g).

Columns: Raw Material (Select), Required Amount (g), Standard Waste (%), Total Weight.


Logical Constraint: Do NOT include "Cost Price" field; this is auto-calculated during production.

☕ MODULE 3: PRODUCTION EXECUTION (UC39)
Screen 3: Roasting & Packaging Workflow


Step-by-Step Layout: 1. Input Selection: Searchable list of available Material Batches showing "Available Stock".
2. Process Settings: Dropdown for "Roast Profile" (Light, Medium, Dark) + Date/Time.
3. Output & Yield: - Field: "Select Output SKU" (linked to BOM).
- Field: "Finished Goods Qty" (Bags).
- Field: "Loss Quantity (Kg)" (Manual entry).
+3


Finance Summary Box: Display calculated COGS (Cost of Goods Sold): (Total Input Batch Value) / (Output Qty).


Batch Linking: Display auto-generated Roast Batch (BAT-...) and Final Lot (LOT-...) codes.
+1

🔍 MODULE 4: INVENTORY TRACKING & RECALL (UC24, UC42, UC43)
Screen 4: Stock Ledger (The Audit Trail)

Header: Date filters + Type filter (Import, Production, Export, Adjustment).


Audit Table: - Columns: Timestamp, Action, Reference ID (Clickable), Qty Change (+/-), Running Balance.

Micro-interaction: Click "Reference ID" to open overlay with source document (GRN or Production Log).

Screen 5: Traceability Recall Scope (UC42)

Search: Input field for "Defective Batch ID".

Tree Visualization: - Root: Material Batch ID.

Level 2: Roast Batch(es) linked.

Level 3: Product Lots (SKUs) produced.

Level 4: Customer Order IDs affected.
+1


Action Button: "Execute Recall" (UC45) to send notifications and lock stock.
+1

🛠️ SYSTEM LOGIC & CONSTRAINTS (FOR FIGMA AI AGENT)

Validation: If "Loss Quantity" > 20%, display "High Loss Warning" label.


Immutability: All Batch Codes (MAT, BAT, LOT) and SKU fields are Read-only once the record is confirmed.
+2


Specific Identification: Ensure every production log maps back to a specific Material Batch ID to maintain pricing accuracy.
+1