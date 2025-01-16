import { defineConfig } from 'orval'

export default defineConfig({
    api: {
        input: './swagger.json',
        output: {
            target: './src/api/generate',
            mode: 'tags-split',
            httpClient: 'axios',
            client: 'react-query',
            clean: true,
            baseUrl: process.env.NEXT_PUBLIC_API_URL,
            override: {
                mutator: {
                    path: './src/api/api.ts',
                    name: 'customInstance',
                },
            },
        }
    },
    apiwithzod: {
        input: './swagger.json',
        output: {
            target: './src/api/generate',
            mode: 'tags-split',
            client: 'zod',
            fileExtension: '.zod.ts',
        }
    }
})