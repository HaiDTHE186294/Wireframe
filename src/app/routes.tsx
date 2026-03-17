import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { OrderManagement } from "./pages/OrderManagement";
import { CustomerCRM } from "./pages/CustomerCRM";
import { StaffManagement } from "./pages/StaffManagement";
import { Reviews } from "./pages/Reviews";
import { SystemSettings } from "./pages/SystemSettings";
import { Suppliers } from "./pages/Suppliers";
import { Materials } from "./pages/Materials";
import { ProductCatalog } from "./pages/ProductCatalog";
import { ProductionExecution } from "./pages/ProductionExecution";
import { StockLedger } from "./pages/StockLedger";
import { ExportProduct } from "./pages/ExportProduct";
import { Traceability } from "./pages/Traceability";
import { PromotionManagement } from "./pages/Promotion";
import { CategoryManagement } from "./pages/category";
import { BlogManagement } from "./pages/Blogs";
import { HomepageManagement } from "./pages/HomepageManagement";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "suppliers", Component: Suppliers },
      { path: "materials", Component: Materials },
      { path: "product-catalog", Component: ProductCatalog },
      { path: "production-execution", Component: ProductionExecution },
      { path: "stock-ledger", Component: StockLedger },
      { path: "export-management", Component: ExportProduct },
      { path: "traceability", Component: Traceability },
      { path: "order-management", Component: OrderManagement },
      { path: "customer-crm", Component: CustomerCRM },
      { path: "promotions", Component: PromotionManagement },
      { path: "categories", Component: CategoryManagement },
      { path: "staff-management", Component: StaffManagement },
      { path: "reviews", Component: Reviews },
      { path: "system-settings", Component: SystemSettings },
      { path: "blogs", Component: BlogManagement },
      { path: "homepage-management", Component: HomepageManagement },
      { path: "*", Component: NotFound },
    ],
  },
]);