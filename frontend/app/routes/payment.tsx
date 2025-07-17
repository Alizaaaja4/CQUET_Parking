import type { Route } from "./+types/home";
import PaymentPage from "~/pages/payment/payment";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CarCheese App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <PaymentPage />;
}
