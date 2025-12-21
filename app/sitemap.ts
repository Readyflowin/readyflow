import { MetadataRoute } from "next";
import { cities } from "@/lib/cityData";

const baseUrl = "https://readyflow.in";

export default function sitemap(): MetadataRoute.Sitemap {
  // 1. Core Pages - Typed as MetadataRoute.Sitemap
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/locations`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/portfolio`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/refund`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // 2. Service Routes - Fixed Type
  const serviceRoutes: MetadataRoute.Sitemap = [
    "/services/shopify-store-setup",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // 3. City-based SEO - Fixed Type
  const cityRoutes: MetadataRoute.Sitemap = Object.keys(cities || {}).map((city) => ({
    url: `${baseUrl}/locations/${city.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // 4. Content / Guides - Fixed Type
  const guideRoutes: MetadataRoute.Sitemap = [
    "/guides/how-to-start-selling-online-india",
    "/guides/shopify-vs-woocommerce-india-cost",
    "/guides/rto-reduction-strategy-india",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // 5. Tools - Fixed Type
  const toolRoutes: MetadataRoute.Sitemap = [
    "/tools/rto-shield",
    "/tools/policy-generator",
    "/tools/profit-calculator",
    "/tools/smart-chatbot",
    "/tools/popup-builder",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...toolRoutes,
    ...guideRoutes,
    ...cityRoutes,
  ];
}