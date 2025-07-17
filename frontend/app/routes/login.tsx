import type { Route } from "./+types/home";
import LoginPage from "~/pages/login/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CarCheese App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <LoginPage />;
}
