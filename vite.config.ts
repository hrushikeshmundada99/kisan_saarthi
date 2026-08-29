import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
/**
 * Robust Vite Dev Server middleware plugin to execute Vercel Serverless Functions locally via dynamic imports
 */
function vercelApiDevPlugin() {
  return {
    name: 'vercel-api-dev-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const urlPath = req.url ? req.url.split('?')[0].replace(/\/$/, '') : '';
        if (!urlPath.startsWith('/api/')) return next();

        let handler: any = null;
        try {
          // @ts-ignore
          if (urlPath === '/api/auth/signup') handler = (await import('./api/auth/signup.js')).default;
          // @ts-ignore
          else if (urlPath === '/api/auth/login') handler = (await import('./api/auth/login.js')).default;
          // @ts-ignore
          else if (urlPath === '/api/auth/me') handler = (await import('./api/auth/me.js')).default;
          // @ts-ignore
          else if (urlPath === '/api/auth/logout') handler = (await import('./api/auth/logout.js')).default;
          // @ts-ignore
          else if (urlPath === '/api/auth/profile') handler = (await import('./api/auth/profile.js')).default;
          // @ts-ignore
          else if (urlPath === '/api/auth/change-password') handler = (await import('./api/auth/change-password.js')).default;
          // @ts-ignore
          else if (urlPath === '/api/ceda') handler = (await import('./api/ceda.js')).default;
          // @ts-ignore
          else if (urlPath === '/api/forecast/train') handler = (await import('./api/forecast/train.js')).default;
          // @ts-ignore
          else if (urlPath === '/api/recommendations') handler = (await import('./api/recommendations/index.js')).default;
          // @ts-ignore
          else if (urlPath === '/api/recommendations/feedback') handler = (await import('./api/recommendations/feedback.js')).default;
          // @ts-ignore
          else if (urlPath === '/api/recommendations/stats') handler = (await import('./api/recommendations/stats.js')).default;
          // @ts-ignore
          else if (urlPath === '/api/alerts/send-email') handler = (await import('./api/alerts/send-email.js')).default;
          // @ts-ignore
          else if (urlPath === '/api/cron/check-alerts') handler = (await import('./api/cron/check-alerts.js')).default;
          // @ts-ignore
          else if (urlPath === '/api/assistant/ask') handler = (await import('./api/assistant/ask.js')).default;
          // @ts-ignore
          else if (urlPath === '/api/tts') handler = (await import('./api/tts.js')).default;

        } catch (e) {
          console.warn(`[Vercel Dev API Plugin] Dynamic handler import warning for ${urlPath}:`, e);
        }

        if (!handler) {
          return next();
        }

        // Decorate res with standard Express/Vercel helpers
        res.status = function (statusCode: number) {
          res.statusCode = statusCode;
          return this;
        };

        res.json = function (data: any) {
          if (!res.headersSent) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          }
        };

        // Buffer request body immediately before any async gap
        let rawBody = '';
        req.on('data', (chunk: any) => {
          rawBody += chunk;
        });

        const executeHandler = async () => {
          if (rawBody) {
            try {
              req.body = JSON.parse(rawBody);
            } catch {
              req.body = rawBody;
            }
          } else if (!req.body) {
            req.body = {};
          }

          // Parse URL search params into req.query
          if (req.url && req.url.includes('?')) {
            const searchParams = new URLSearchParams(req.url.split('?')[1]);
            req.query = Object.fromEntries(searchParams.entries());
          } else {
            req.query = {};
          }

          try {
            await handler(req, res);
          } catch (handlerErr: any) {
            console.error(`[API ${urlPath} Error]:`, handlerErr);
            if (!res.headersSent) {
              res.status(500).json({
                success: false,
                error: handlerErr?.message || 'Internal Server Error'
              });
            }
          }
        };

        if (req.method === 'GET' || req.method === 'HEAD' || req.readableEnded) {
          executeHandler();
        } else {
          req.on('end', executeHandler);
          req.on('error', () => {
            if (!res.headersSent) {
              res.status(400).json({ success: false, error: 'Request stream error' });
            }
          });
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env for serverless functions running in dev
  Object.assign(process.env, env);

  const plugins: any[] = [react(), tailwindcss()];
  if (command === 'serve') {
    plugins.push(vercelApiDevPlugin());
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      watch: {
        ignored: ['**/data/**', '**/supabase/**', '**/*.json'],
      },
      proxy: {
        '/api/agmarknet': {
          target: 'https://api.data.gov.in',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/agmarknet/, '/resource/9ef84268-d588-465a-a308-a864a43d0070'),
          secure: false,
        },
      },
    },
  };
});
