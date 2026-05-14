/** @type {import('next').NextConfig} */
const CITIES = ["bucuresti", "cluj", "timisoara", "iasi", "brasov"];

const nextConfig = {
  images: {
    domains: [],
  },
  async rewrites() {
    return CITIES.map((c) => ({
      source: `/saloane-grooming-${c}`,
      destination: `/saloane-grooming/${c}`,
    }));
  },
};

module.exports = nextConfig;
