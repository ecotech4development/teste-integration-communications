import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/getToken',  // Rota do frontend para autenticação
        destination: `https://api.instagram.com/oauth/access_token`,
      },
      {
        source: '/api/createImage/:userId',  // Rota do frontend para autenticação
        destination: `https://graph.instagram.com/v21.0/:userId/media`,
      },
      {
        source: '/api/mediaPublish/:userId',  // Rota do frontend para autenticação
        destination: `https://graph.instagram.com/v21.0/:userId/media_publish`,
      },
      {
        source: '/api/get-domains',  // Rota do frontend para autenticação
        destination: `https://api.resend.com/domains`,
      },
      {
        source: '/api/sendEmail',  // Rota do frontend para autenticação
        destination: `https://api.resend.com/emails`,
      }
    ];
  },
};

export default nextConfig;
