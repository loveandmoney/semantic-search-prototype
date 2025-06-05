import Typesense from 'typesense';

export const client = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || '',
      port: 443,
      protocol: 'https',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || '',
  connectionTimeoutSeconds: 10,
});
