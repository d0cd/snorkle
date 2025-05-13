import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
    assetsInclude: ['**/*.wasm'],
    worker: {
        format: 'es',
        plugins: []
    },
    plugins: [
        react({
            jsxRuntime: 'automatic',
            jsxImportSource: 'react',
            babel: {
                plugins: [
                    ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
                ]
            }
        }),
        nodePolyfills(),
        viteStaticCopy({
            targets: [
                {
                    src: 'node_modules/@provablehq/sdk/dist/worker.js',
                    dest: 'public'
                }
            ]
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            'process': 'process/browser',
            'stream': 'stream-browserify',
            'zlib': 'browserify-zlib',
            'util': 'util'
        },
        extensions: ['.js', '.jsx', '.json', '.mjs']
    },
    server: {
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Resource-Policy': 'cross-origin',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
        },
        proxy: {
            '/api': {
                target: 'https://api.explorer.provable.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                }
            }
        },
        fs: {
            allow: ['..']
        },
        hmr: {
            overlay: false
        }
    },
    css: {
        postcss: {
            plugins: [
                {
                    postcssPlugin: 'internal:charset-removal',
                    AtRule: {
                        charset: (atRule) => {
                            if (atRule.name === 'charset') {
                                atRule.remove();
                            }
                        }
                    }
                }
            ]
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'worker': ['src/workers/worker.js']
                }
            }
        }
    }
});
