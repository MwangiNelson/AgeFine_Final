import { SITE, SITE_URL, socialLinks, absoluteUrl } from "@/lib/site";

/** Renders a JSON-LD <script> with the given object. Server component. */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline; no user HTML.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Site-wide LocalBusiness (a beauty salon / health-and-beauty business). */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": `${SITE_URL}/#business`,
    name: SITE.name,
    legalName: SITE.legalName,
    description: SITE.description,
    url: SITE_URL,
    telephone: SITE.phone,
    email: SITE.email,
    image: absoluteUrl("/opengraph-image"),
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.streetAddress,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode || undefined,
      addressCountry: SITE.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    openingHoursSpecification: SITE.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: "Nairobi",
    priceRange: "KES",
    sameAs: socialLinks(),
  };
  return <JsonLd data={data} />;
}

/** Product structured data for a product detail page. */
export function ProductJsonLd({
  name,
  description,
  image,
  priceKes,
  slug,
  inStock,
}: {
  name: string;
  description?: string | null;
  image?: string;
  priceKes: number;
  slug: string;
  inStock: boolean;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || undefined,
    image: image ? [image] : undefined,
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/shop/${slug}`),
      priceCurrency: "KES",
      price: priceKes,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE.name },
    },
  };
  return <JsonLd data={data} />;
}

/** Breadcrumb trail for richer search results. */
export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
  return <JsonLd data={data} />;
}
