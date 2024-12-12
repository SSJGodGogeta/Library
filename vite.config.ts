import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['./**/*.test.ts'], // only *.test.ts files
        environment: 'jsdom',
    },
})