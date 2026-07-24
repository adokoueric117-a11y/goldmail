import { redirect } from "next/navigation";

// Redirection directe vers le dashboard — plus de page d'accueil/login
export default function HomePage() {
  redirect("/dashboard");
}
