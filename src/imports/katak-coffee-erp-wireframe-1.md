FIGMA AI MASTER PROMPT: KATAK COFFEE ERP (ADMIN & CONTROL MODULE)
Role: Expert Systems Architect & UI/UX Designer.
Project Goal: Generate a Low-Fidelity (Lo-Fi) Black & White Wireframe for the Administrative, Management, and Quality Control Workflow.
Visual Constraint: Strictly B&W/Grayscale. No colors. Use 1px solid borders. 8pt grid system. Hierarchy: Bold for headers, Regular for body.

🏛️ GLOBAL NAVIGATION & LAYOUT
Sidebar (Admin/CEO View): Dashboard, Order Management, Customer CRM, Staff Management, Quality Control (Reviews/Lock Product), System Settings.


Top Bar: Search, Notification Bell (UC18) with red dot indicator (gray in B&W), and User Profile .

📊 MODULE 1: BUSINESS INTELLIGENCE & DASHBOARD (UC19)
Screen 1: Executive Dashboard


KPI Cards (4-column grid): - Total Revenue (VNĐ), New Orders (Count), Low Stock Alerts (Count), Pending Approvals (Count).
+1


Analytics Area: - A placeholder for a Line Chart: "Revenue over last 30 days".
+1

A placeholder for a Bar Chart: "Top 5 Best-selling Products".

Real-time Feed: A list of "Recent System Activities" (e.g., Staff X confirmed Order Y).

⚖️ MODULE 2: ORDER CONTROL & APPROVAL (UC32, UC34)
Screen 2: Order Management & Status Workflow


Filter Bar: Status (New, Confirmed, Packing, Shipping, Completed, Cancelled) .


Table: Order ID, Customer Name, Total Value, Payment Method, Status.


Wholesale Approval (CEO Only): - Orders > 20,000,000 VNĐ must highlight a "Waiting for Approval" status.
+1


Interaction: Click "Approve" or "Reject" with a mandatory "Reason" text box.
+1

👥 MODULE 3: CRM & STAFF HIERARCHY (UC08 - UC12)
Screen 3: Customer 360 & Interaction Log

Layout: Searchable list on left, Detail view on right.


Customer Detail Profile: Name, Contact, Total Spend, Sở thích Cảm quan (Sensory Preferences: Bitter, Sweet, etc.).

Interaction Timeline (UC11): - A vertical list of "Customer Notes".

Fields: Note Content, Author (Staff ID), Timestamp.


Action: Toggle switch for "Account Status" (Active/Locked) with a "Reason for Locking" popup.
+1

Screen 4: Staff Management (UC12)


Table: Staff ID, Full Name, Role (Admin, CEO, Sale, Inventory), Status.
+1


Constraint: Admin/CEO cannot lock their own account.

🛡️ MODULE 4: QUALITY & SYSTEM CONTROL (UC41, UC47, UC48)
Screen 5: Product Quality Lock (UC41)

Search: Find SKU or Batch ID.

Action: "Emergency Lock" button.


Logic: Once clicked, display a system warning: "5 pending orders contain this item. Cancel them?".

Screen 6: Review Moderation (UC48)

Table: Customer, Star Rating (1-5), Comment, Image Link.


Actions: "Approve" (Show on Web) or "Reject" (Hide).
+1


Reply Box: Admin/Marketing reply field.

Screen 7: System Config (UC47)


Fields: Global Min Stock Threshold (Input), Alert Email List (Text area).
+1

🖱️ MICRO-INTERACTIONS & SYSTEM LOGIC

Audit Trail: Hovering over any "Status Tag" shows a tooltip: "Changed by [Staff ID] on [Date]".
+1


Specific Identification: In Order Detail, show exactly which Mã Lô (Lot Code) was picked for each item.
+1


Feedback: When an order is "Rejected", the status tag must change to "Cancelled" and release the Reserved Stock.
+1