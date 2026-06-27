import { Role } from "@/lib/constants/roles";

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",
  
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_UPDATE: "products.update",
  PRODUCTS_DELETE: "products.delete",
  
  STOCK_VIEW: "stock.view",
  STOCK_CREATE: "stock.create",
  STOCK_UPDATE: "stock.update",
  STOCK_DELETE: "stock.delete",
  STOCK_TAKE: "stock.take",
  STOCK_MANUAL_TAKE: "stock.manual_take",
  STOCK_RESERVE: "stock.reserve",
  STOCK_RELEASE: "stock.release",
  STOCK_REVEAL: "stock.reveal_sensitive",
  STOCK_COPY_SENSITIVE: "stock.copy_sensitive",
  STOCK_ASSIGN_TO_ORDER: "stock.assign_to_order",
  STOCK_REPLACE: "stock.replace",
  STOCK_IMPORT: "stock.import",
  STOCK_EXPORT: "stock.export",
  
  ORDERS_VIEW: "orders.view",
  ORDERS_UPDATE: "orders.update",
  ORDERS_FULFILL: "orders.fulfill",
  ORDERS_REFUND: "orders.refund",
  
  PAYMENTS_VERIFY: "payments.verify",
  
  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_UPDATE: "customers.update",
  
  REPORTS_VIEW: "reports.view",
  FINANCE_VIEW: "finance.view",
  
  REFUND_PROCESS: "refund.process",
  
  TICKETS_MANAGE: "tickets.manage",
  
  SETTINGS_UPDATE: "settings.update",
  
  ADMINS_MANAGE: "admins.manage",
  
  AUDIT_LOGS_VIEW: "audit_logs.view",
};

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ADMIN: Object.values(PERMISSIONS), // Legacy, full access
  SUPER_ADMIN: Object.values(PERMISSIONS),
  ADMIN_PRODUK: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_UPDATE, PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.STOCK_VIEW, PERMISSIONS.STOCK_CREATE, PERMISSIONS.STOCK_UPDATE, PERMISSIONS.STOCK_DELETE,
    PERMISSIONS.STOCK_TAKE, PERMISSIONS.STOCK_MANUAL_TAKE, PERMISSIONS.STOCK_RESERVE, PERMISSIONS.STOCK_RELEASE,
    PERMISSIONS.STOCK_REPLACE, PERMISSIONS.STOCK_IMPORT, PERMISSIONS.STOCK_EXPORT
  ],
  ADMIN_PESANAN: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_UPDATE, PERMISSIONS.ORDERS_FULFILL,
    PERMISSIONS.CUSTOMERS_VIEW, PERMISSIONS.CUSTOMERS_UPDATE
  ],
  ADMIN_KEUANGAN: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.FINANCE_VIEW, PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.PAYMENTS_VERIFY, PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_REFUND, PERMISSIONS.REFUND_PROCESS
  ],
  CUSTOMER_SERVICE: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.TICKETS_MANAGE, PERMISSIONS.ORDERS_VIEW, PERMISSIONS.CUSTOMERS_VIEW
  ],
  USER: [],
};

export function hasPermission(
  user: { role: Role | string; permissions?: string[] | null },
  permission: string
): boolean {
  if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
    return true;
  }
  
  // Check custom permission overrides first
  if (user.permissions && user.permissions.includes(permission)) {
    return true;
  }
  
  // Check default role permissions
  const defaults = ROLE_PERMISSIONS[user.role as Role] || [];
  return defaults.includes(permission);
}
