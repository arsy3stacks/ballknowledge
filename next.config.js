/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false, // true for development
	output: "export",
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: { unoptimized: true },
};

module.exports = nextConfig;
