import { defineConfig, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react-swc";
import postcssImport from 'postcss-import';
import postcssNested from 'postcss-nested';
import postcssCustomProperties from 'postcss-custom-properties';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
    assetsInclude: ['**/*.wasm'],
    worker: {
        format: "es",
    },
    plugins: [react()],
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    build: {
        target: "esnext",
        sourcemap: true,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'aleo-wasm': ['@provablehq/sdk'],
                    'vendor': ['react', 'react-dom', 'react-router-dom'],
                }
            }
        }
    },
    optimizeDeps: {
        exclude: ["@provablehq/wasm"],
        include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@mui/icons-material']
    },
    server: {
        fs: {
            allow: [searchForWorkspaceRoot(process.cwd()), "../sdk"],
        },
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
        hmr: {
            overlay: true
        },
        watch: {
            usePolling: true
        }
    },
    css: {
        postcss: {
            plugins: [
                postcssImport,
                postcssNested,
                postcssCustomProperties,
                autoprefixer
            ]
        }
    }
});
