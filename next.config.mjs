/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    redirects: async () => {
        return [
            {
                source: "/api/sso/logout",
                destination: `https://accounts.google.com/Logout`,
                permanent: false,
            },
        ];
    },
};

export default nextConfig;