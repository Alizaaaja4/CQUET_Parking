import type { Route } from "./+types/home";
import SlotPage from "~/pages/slot/slot";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CarCheese App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <SlotPage />;
}
