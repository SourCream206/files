/** @type {import('next').NextConfig} */
const nextConfig = {
  // Leaflet map components misbehave when React Strict Mode mounts/unmounts
  // them twice in development.  Turning off strict mode removes the error
  // without affecting production behaviour.
  reactStrictMode: false,
};

export default nextConfig;
