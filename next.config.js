/** @type {import('next').NextConfig} */
const CITIES = ["bucuresti", "cluj", "timisoara", "iasi", "brasov"];
const DOMENII = ["infrumusetare", "grooming"];

const nextConfig = {
  images: {
    domains: [],
  },
  async rewrites() {
    // URL-uri keyword-rich: /saloane-infrumusetare-bucuresti -> /saloane/infrumusetare/bucuresti
    return DOMENII.flatMap((d) =>
      CITIES.map((c) => ({
        source: `/saloane-${d}-${c}`,
        destination: `/saloane/${d}/${c}`,
      }))
    );
  },
};

module.exports = nextConfig;
