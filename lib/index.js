//#region src/index.ts
const name = "dsh-shutdown";
/** 与浏览器半 src/client/storage.ts 中的 SETTINGS_NAMESPACE 保持一致 */
const SETTINGS_NAMESPACE = "dsh-shutdown";
/** 与浏览器半 src/client/shutdown.ts 中的 EXIT_ROUTE 保持一致 */
const EXIT_ROUTE = "/api/dsh-shutdown.exit";
/** 请求退出后等待进程自行结束的上限，超过则强制退出 */
const FORCE_EXIT_GRACE_MS = 8e3;
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
/** 仅登记一次退出兜底，重复的退出请求不再叠加监听器与定时器 */
let exitRequested = false;
/**
* 结束 dsh 进程：请求优雅退出（launcher 的 appExit，缺席时退回 SIGTERM），
* 并在事件循环排空时或超过 FORCE_EXIT_GRACE_MS 后退出进程。
*/
function requestExit(ctx) {
	let exit;
	try {
		exit = ctx.get("appExit");
	} catch {
		exit = void 0;
	}
	if (!exitRequested) {
		exitRequested = true;
		process.on("beforeExit", () => {
			process.exit(0);
		});
		setTimeout(() => {
			process.exit(0);
		}, FORCE_EXIT_GRACE_MS).unref?.();
	}
	if (typeof exit === "function") {
		exit(0);
		return;
	}
	try {
		process.kill(process.pid, "SIGTERM");
	} catch {}
}
//#endregion
export { apply, inject, name };
