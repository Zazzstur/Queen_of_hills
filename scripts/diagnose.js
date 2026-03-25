import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 Starting Deployment Diagnostic Check...\n');

const checks = {
  nodeVersion: () => {
    console.log(`✅ Node Version: ${process.version}`);
    const major = parseInt(process.version.slice(1).split('.')[0], 10);
    if (major < 18) {
      console.warn('⚠️  Warning: Node.js version is older than v18. Cloudflare Pages recommends v18 or later.');
    }
  },

  configFile: () => {
    const wranglerPath = path.join(rootDir, 'wrangler.toml');
    if (fs.existsSync(wranglerPath)) {
      console.log('✅ wrangler.toml found');
      // Simple check for content
      const content = fs.readFileSync(wranglerPath, 'utf-8');
      if (!content.includes('pages_build_output_dir')) {
        console.warn('⚠️  Warning: "pages_build_output_dir" not found in wrangler.toml. Ensure it is set to "dist".');
      }
      if (!content.includes('compatibility_date')) {
        console.warn('⚠️  Warning: "compatibility_date" not found in wrangler.toml.');
      }
    } else {
      console.error('❌ Error: wrangler.toml not found! This is required for Cloudflare Pages deployment.');
    }
  },

  envVars: () => {
    // Check local .env files
    const envPath = path.join(rootDir, '.env');
    const envProdPath = path.join(rootDir, '.env.production');
    
    if (fs.existsSync(envPath) || fs.existsSync(envProdPath)) {
      console.log('✅ Local .env file(s) found');
    } else {
      console.warn('⚠️  Warning: No local .env files found. Ensure environment variables are set in Cloudflare Dashboard.');
    }

    console.log('ℹ️  Note: Ensure VITE_CONVEX_URL is set for Convex.');
  },

  buildOutput: () => {
    const distPath = path.join(rootDir, 'dist');
    if (fs.existsSync(distPath)) {
      console.log('✅ Build output directory "dist" exists.');
      if (fs.existsSync(path.join(distPath, 'index.html'))) {
        console.log('✅ index.html found in dist.');
      } else {
        console.error('❌ Error: index.html not found in dist. Build might have failed or output is incorrect.');
      }
    } else {
      console.warn('⚠️  Warning: "dist" directory not found. Run "npm run build" to verify build locally.');
    }
  }
};

try {
  checks.nodeVersion();
  checks.configFile();
  checks.envVars();
  checks.buildOutput();
  console.log('\n✅ Diagnostic check complete.');
} catch (error) {
  console.error('\n❌ Diagnostic check failed with error:', error);
}
