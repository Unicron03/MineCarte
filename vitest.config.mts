import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        environment: 'jsdom',
        // Configuration de la couverture de code
        coverage: {
            provider: 'v8',                          // Moteur de coverage (rapide)
            reporter: ['text', 'json', 'html', 'lcov'], // Formats de rapport
            exclude: [                               // Fichiers à ignorer
                'node_modules/',
                'generated/',
                '*.config.ts',
                '*.config.js',
                '.next/',
                'coverage/',
                'prisma/',
                'public/',
            ],
        },
    },
})