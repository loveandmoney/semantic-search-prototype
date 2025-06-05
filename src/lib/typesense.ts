import Typesense from 'typesense';

export const client = new Typesense.Client({
  nodes: [
    {
      host: 'kqpc54h7t9a6vgrzp-1.a1.typesense.net',
      port: 443,
      protocol: 'https',
    },
  ],
  apiKey: 'aJsVY0QwjrcGSyoonwYKN0R4XbvTFWo6',
  connectionTimeoutSeconds: 10,
});
