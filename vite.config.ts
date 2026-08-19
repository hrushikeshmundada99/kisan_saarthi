import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// Static import of serverless handlers for instant zero-latency dev execution
// @ts-ignore
import signupHandler from './api/auth/signup.js';
// @ts-ignore
import loginHandler from './api/auth/login.js';
// @ts-ignore
import meHandler from './api/auth/me.js';
// @ts-ignore
import logoutHandler from './api/auth/logout.js';
// @ts-ignore
import profileHandler from './api/auth/profile.js';
// @ts-ignore
import changePasswordHandler from './api/auth/change-password.js';
// @ts-ignore
import cedaHandler from './api/ceda.js';
// @ts-ignore
import trainHandler from './api/forecast/train.js';
// @ts-ignore
import recommendationsIndexHandler from './api/recommendations/index.js';
// @ts-ignore
import recommendationsFeedbackHandler from './api/recommendations/feedback.js';
// @ts-ignore
import recommendationsStatsHandler from './api/recommendations/stats.js';

const serverlessRoutes: Record<string, any> = {
  '/api/auth/signup': signupHandler,
  '/api/auth/login': loginHandler,
  '/api/auth/me': meHandler,
  '/api/auth/logout': logoutHandler,
  '/api/auth/profile': profileHandler,
  '/api/auth/change-password': changePasswordHandler,
  '/api/ceda': cedaHandler,
  '/api/forecast/train': trainHandler,
  '/api/recommendations': recommendationsIndexHandler,
  '/api/recommendations/feedback': recommendationsFeedbackHandler,
  '/api/recommendations/stats': recommendationsStatsHandler,
};

/**
 * Robust Vite Dev Server middleware plugin to execute Vercel Serverless Functions locally
 */
function vercelApiDevPlugin() {
  return {
    name: 'vercel-api-dev-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const urlPath = req.url ? req.url.split('?')[0].replace(/\/$/, '') : '';
        const handler = serverlessRoutes[urlPath];

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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env for serverless functions running in dev
  Object.assign(process.env, env);

  return {
    plugins: [react(), tailwindcss(), vercelApiDevPlugin()],
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
        '/api/fast2sms': {
          target: 'https://www.fast2sms.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/fast2sms/, '/dev/bulkV2'),
          secure: false,
        },
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
