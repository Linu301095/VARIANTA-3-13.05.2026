import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://calyhub.ro";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CalyHub — Programări grooming online pentru animalele tale",
    template: "%s | CalyHub",
  },
  description:
    "Găsește cel mai potrivit salon de grooming din orașul tău și programează-ți animalul online în 10 secunde. Gratuit pentru stăpâni, fără apeluri telefonice.",
  keywords: [
    "grooming caini",
    "grooming pisici",
    "salon grooming",
    "programare grooming online",
    "tuns caine",
    "tuns pisica",
    "frizerie animale",
    "salon animale Romania",
    "CalyHub",
  ],
  authors: [{ name: "CalyHub" }],
  creator: "CalyHub",
  publisher: "CalyHub",
  applicationName: "CalyHub",
  category: "Pets & Animals",
  alternates: {
    canonical: "/",
    languages: { "ro-RO": "/" },
  },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: SITE_URL,
    siteName: "CalyHub",
    title: "CalyHub — Programări grooming online pentru animalele tale",
    description:
      "Găsește cel mai potrivit salon de grooming din orașul tău și programează-ți animalul online în 10 secunde.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CalyHub — Programări grooming online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CalyHub — Programări grooming online",
    description:
      "Găsește cel mai potrivit salon de grooming și programează-ți animalul online în 10 secunde.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    // Adaugă codul când îl ai din Google Search Console:
    // google: "xxxxxxxxxxxxxxx",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#FF6B00",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CalyHub",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Platformă online de programări la saloane de grooming pentru animale de companie în România.",
    sameAs: [
      "https://www.facebook.com/calyhub",
      "https://www.instagram.com/calyhub",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "contact@calyhub.ro",
      availableLanguage: ["Romanian"],
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CalyHub",
    url: SITE_URL,
    inLanguage: "ro-RO",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/dashboard/client?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="ro">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
