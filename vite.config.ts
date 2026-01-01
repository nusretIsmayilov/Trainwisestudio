import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // No proxy needed - using Supabase Edge Functions directly
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
    react(),
    // Removed splitVendorChunkPlugin - we're using custom manualChunks instead
    mode === 'development' && (async () => {
      try {
        const { componentTagger } = await import("lovable-tagger");
        return componentTagger();
      } catch {
        return null;
      }
    })(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'chart.js', 'react-chartjs-2', 'react-circular-progressbar']
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Keep React together to prevent multiple instances
            'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
            'router': ['react-router-dom'],
            'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
            'supabase': ['@supabase/supabase-js'],
            'charts': ['recharts', 'chart.js', 'react-chartjs-2'],
            'motion': ['framer-motion']
          }
        },
        onwarn(warning, warn) {
          if ((warning as any).code === 'MODULE_LEVEL_DIRECTIVE') {
            return
          }
          warn(warning as any)
        }
      },
      minify: true,
      chunkSizeWarningLimit: 1000,
    }
  };
});
