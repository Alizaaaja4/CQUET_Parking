import type { Route } from "./+types/home";
import EntryPage from "~/pages/entry/entry";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <EntryPage />;
}
