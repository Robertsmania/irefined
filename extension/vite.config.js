import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: 'src/main.js',
            formats: ['es'],
        },
        rollupOptions: {
            output: {
                entryFileNames: `[name].js`,
                chunkFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`,
                preserveModules: true,
                preserveModulesRoot: 'src'
            }
        }
    }
})
