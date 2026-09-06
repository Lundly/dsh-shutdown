//#region src/index.ts
const name = "dsh-shutdown";
/** 与浏览器半 src/client/storage.ts 中的 SETTINGS_NAMESPACE 保持一致 */
const SETTINGS_NAMESPACE = "dsh-shutdown";
/** 与浏览器半 src/client/shutdown.ts 中的 EXIT_ROUTE 保持一致 */
const EXIT_ROUTE = "/api/dsh-shutdown.exit";
const inject = ["connection"];
/**
* 构造「不再显示确认提示」命名空间的 settings schema（duck-typed，约定见 types.ts
* 的 SettingsSchemaLike）。纯函数构造，不引入 schemastery 依赖。
*/
function createShutdownSettingsSchema() {
	const schema = (data) => {
		const raw = (typeof data === "object" && data !== null && !Array.isArray(data) ? data : {})["skipConfirm"];
		if (raw !== void 0 && raw !== null && typeof raw !== "boolean") throw new TypeError(`settings "${SETTINGS_NAMESPACE}.skipConfirm" must be a boolean`);
		return { skipConfirm: raw === true };
	};
	schema.toJSON = () => ({
		uid: 0,
		refs: {
			0: {
				type: "object",
				dict: { skipConfirm: 1 },
				meta: {}
			},
			1: {
				type: "boolean",
				meta: { default: false }
			}
		}
	});
	return schema;
}
function apply(ctx) {
	ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.settings?.register(SETTINGS_NAMESPACE, createShutdownSettingsSchema());
	});
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
