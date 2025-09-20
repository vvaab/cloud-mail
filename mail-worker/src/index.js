import app from './hono/webs';
import { email } from './email/email';
import userService from './service/user-service';
import verifyRecordService from './service/verify-record-service';
export default {
	 async fetch(req, env, ctx) {
		const url = new URL(req.url)

        if (url.pathname === '/api/clear-all') {
			try {
            // 查询删除前数量
            const before = await env.db.prepare(`SELECT COUNT(*) AS c FROM email`).first();
      
            // 执行删除
            await env.db.prepare(`DELETE FROM email`).run();
      
            // 查询删除后数量
            const after = await env.db.prepare(`SELECT COUNT(*) AS c FROM email`).first();
      
            return new Response(JSON.stringify({ success: true, before: before.c, after: after.c }), {
              headers: { "Content-Type": "application/json" }
            });
          } catch (e) {
            return new Response(JSON.stringify({ success: false, error: e.message }), {
              headers: { "Content-Type": "application/json" }
            });
          }
        }

		if (url.pathname.startsWith('/api/')) {
			url.pathname = url.pathname.replace('/api', '')
			req = new Request(url.toString(), req)
			return app.fetch(req, env, ctx);
		}


		return env.assets.fetch(req);
	},
	email: email,
	async scheduled(c, env, ctx) {
		await verifyRecordService.clearRecord({env})
		await userService.resetDaySendCount({ env })
	},
};
