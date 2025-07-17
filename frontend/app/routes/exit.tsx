import type { Route } from "./+types/home";
import ExitPage from "~/pages/exit/exit";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CarCheese App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <ExitPage />;
}
