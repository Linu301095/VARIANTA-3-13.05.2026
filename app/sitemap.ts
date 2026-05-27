import type { MetadataRoute } from "next";

const SITE_URL = "https://calyhub.ro";

const CITIES = ["bucuresti", "cluj", "timisoara", "iasi", "brasov"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/cum-functioneaza`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/preturi`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/despre-noi`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/suport-parteneri`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/login`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/register`, lastModified, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/termeni`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/confidentialitate`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  const cityRoutes: MetadataRoute.Sitemap = CITIES.map((slug) => ({
    url: `${SITE_URL}/saloane-grooming-${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...cityRoutes];
}
