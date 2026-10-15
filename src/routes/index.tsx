import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lamesa Bekele | SWE & Full-Stack Developer" },
      { name: "description", content: "Portfolio of Lamesa Bekele: projects, certificates and contact." },
      { property: "og:title", content: "Lamesa Bekele | Portfolio" },
      { property: "og:description", content: "Projects, certificates and contact for Lamesa Bekele." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// The portfolio is a static site served from public/portfolio.
function Index() {
  useEffect(() => {
    window.location.replace("/portfolio/index.html");
  }, []);
  return <a href="/portfolio/index.html">Open portfolio</a>;
}
