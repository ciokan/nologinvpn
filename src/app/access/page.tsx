import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AccessForm } from "./AccessForm";

export default async function AccessPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return <AccessForm />;
}
