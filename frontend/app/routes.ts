import {
  type RouteConfig,
  index,
  route,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),

  route("entry", "routes/entry.tsx"), // New Entry Page
  route("slot", "routes/slot.tsx"), // New Slot Page
  route("exit", "routes/exit.tsx"), // New Exit Page
  route("payment", "routes/payment.tsx"),

  route("dashboard", "routes/dashboard.tsx", [
    // child routes
    index("pages/dashboard/monitoring.tsx"),
    route("payments", "pages/dashboard/payments.tsx"),
    route("slot-management", "pages/dashboard/management.tsx"),
    route("accounts", "pages/dashboard/admin-management.tsx"),
  ]),
] satisfies RouteConfig;
