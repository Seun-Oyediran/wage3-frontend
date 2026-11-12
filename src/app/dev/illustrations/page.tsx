import { notFound } from "next/navigation";

import { IllustrationsDemo } from "./demo";

/** Dev-only trial page for the empty-state illustrations. */
export default function IllustrationsPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <IllustrationsDemo />;
}
