//#region src/index.ts
const name = "dsh-shutdown";
/** 与浏览器半 src/client/shutdown.ts 中的 EXIT_ROUTE 保持一致 */
const EXIT_ROUTE = "/api/dsh-shutdown.exit";
const inject = ["connection"];
function apply(ctx) {
	ctx.connection.fetch.register({
		path: EXIT_ROUTE,
		methods: ["POST"],
		requestBody: "buffered",
		fetch: async () => {
			setTimeout(() => requestExit(ctx), 50);
			return new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { "content-type": "application/json" }
			});
		}
	});
}
/**
* 安全结束 dsh：
* - 首选 launcher 提供的 appExit —— 由 shutdown controller 接线，
*   在 cordis 根 fiber dispose（所有插件逆序清理、webServer close）后自然退出；
* - 非 launcher 宿主没有 appExit 时退回 SIGTERM（launcher 已注册信号处理，同样走优雅退出），
*   并保留一个不被等待的硬退出兜底，避免信号不可用（如部分 Windows 环境）时进程残留。
*/
function requestExit(ctx) {
	let exit;
	try {
		exit = ctx.get("appExit");
	} catch {
		exit = void 0;
	}
	if (typeof exit === "function") {
		exit(0);
		return;
	}
	try {
		process.kill(process.pid, "SIGTERM");
	} catch {}
	setTimeout(() => {
		process.exit(0);
	}, 4500).unref?.();
}
//#endregion
export { apply, inject, name };
