window.__ModuleLoader__.load({
	id: "dsh-shutdown",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/locales.ts
		const NS = "dsh-shutdown";
		const zh = {
			"header.action": "关闭",
			"header.tooltip": "关闭 dsh",
			"dialog.title": "关闭 dsh",
			"dialog.description": "确认要关闭 dsh 吗？dsh 进程将安全退出，当前标签页会尝试自动关闭。",
			"dialog.dontAsk": "不再显示提示（可在设置中重新开启）",
			"dialog.confirm": "确认关闭",
			"dialog.cancel": "取消",
			"dialog.error": "关闭请求未被 dsh 确认，请重试，或在启动 dsh 的终端中手动关闭。",
			"screen.closing": "正在关闭 dsh…",
			"screen.closed": "dsh 已安全关闭",
			"screen.hint": "浏览器标签页未能自动关闭，您可以手动关闭本标签页。",
			"settings.title": "关闭 dsh",
			"settings.description": "控制点击 Web 界面右上角「关闭」按钮时是否先弹出确认提示。关闭确认后，点击按钮将直接安全退出 dsh。",
			"settings.confirm": "点击「关闭」按钮时弹出确认提示"
		};
		const dictionaries = {
			zh,
			en: {
				"header.action": "Close",
				"header.tooltip": "Shut down dsh",
				"dialog.title": "Shut down dsh",
				"dialog.description": "Shut down dsh? The dsh process will exit safely and this tab will try to close itself.",
				"dialog.dontAsk": "Don't ask again (re-enable in Settings)",
				"dialog.confirm": "Shut down",
				"dialog.cancel": "Cancel",
				"dialog.error": "The shutdown request was not confirmed by dsh. Please retry, or stop dsh in its terminal.",
				"screen.closing": "Shutting down dsh…",
				"screen.closed": "dsh has been shut down",
				"screen.hint": "This tab could not close itself. You can close it manually.",
				"settings.title": "Shut down dsh",
				"settings.description": "Whether clicking the \"Close\" button in the top-right corner asks for confirmation first. When disabled, clicking the button shuts dsh down immediately.",
				"settings.confirm": "Ask for confirmation before shutting down"
			}
		};
		function detectLocale() {
			try {
				return ((typeof navigator !== "undefined" ? navigator.language : "") || "").toLowerCase().startsWith("zh") ? "zh" : "en";
			} catch {
				return "zh";
			}
		}
		/** 翻译函数兜底：槽位注入的 t 缺失或抛错时退回本地词典。 */
		function createFallbackT(locale = "zh") {
			const dict = dictionaries[locale] ?? zh;
			return (key) => dict[key] ?? zh[key] ?? key;
		}
		/** 组合槽位注入的 t 与本地兜底。 */
		function composeT(t, locale = "zh") {
			const fallback = createFallbackT(locale);
			return (key) => {
				try {
					return t?.(key) || fallback(key);
				} catch {
					return fallback(key);
				}
			};
		}
		//#endregion
		//#region src/client/styles.ts
		/**
		* 插件样式。以 JS 注入 <style> 的方式交付：
		* 不依赖打包器的 CSS module 产物形态，产物为纯 JS 工厂即可完整工作；
		* 类名统一使用 dsh-shutdown- 前缀避免与主界面/其他插件冲突。
		* 颜色优先使用 dsh 设计令牌（--dsw-*），并带中性回退值。
		*/
		const STYLE_ID = "dsh-shutdown-styles";
		const css = `
.dsh-shutdown-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  min-width: 64px; height: 32px; padding: 6px 12px;
  border: 0.5px solid var(--dsw-alias-border-l4, rgba(0, 0, 0, 0.12));
  border-radius: 18px;
  color: var(--dsw-alias-label-primary, #1f2329);
  background: transparent;
  font-family: var(--dsw-font-family, inherit);
  font-size: 13px; font-weight: 400; line-height: 20px;
  cursor: pointer;
}
.dsh-shutdown-btn:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.05));
}
.dsh-shutdown-overlay {
  position: fixed; inset: 0; z-index: 2147483000;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  font-family: var(--dsw-font-family, inherit);
}
.dsh-shutdown-card {
  width: 400px; max-width: calc(100vw - 48px); box-sizing: border-box;
  background: var(--dsw-alias-bg-primary, #fff);
  color: var(--dsw-alias-label-primary, #1f2329);
  border-radius: 12px; padding: 20px 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.24);
}
.dsh-shutdown-card-title { margin: 0 0 10px; font-size: 16px; font-weight: 600; line-height: 24px; }
.dsh-shutdown-card-desc { margin: 0 0 14px; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-secondary, #5b616b); }
.dsh-shutdown-card-error { margin: -4px 0 14px; font-size: 12px; line-height: 18px; color: #d03050; }
.dsh-shutdown-check-row {
  display: flex; align-items: center; gap: 8px; margin: 0 0 18px;
  font-size: 13px; line-height: 20px; cursor: pointer; user-select: none;
}
.dsh-shutdown-check-row input { width: 14px; height: 14px; margin: 0; cursor: pointer; accent-color: var(--dsw-alias-bg-brand, #4c6ef5); }
.dsh-shutdown-footer { display: flex; justify-content: flex-end; gap: 8px; }
.dsh-shutdown-btn-ghost {
  height: 32px; padding: 0 16px; border-radius: 8px;
  border: 0.5px solid var(--dsw-alias-border-l4, rgba(0, 0, 0, 0.12));
  background: transparent; color: inherit; font-family: inherit; font-size: 13px;
  cursor: pointer;
}
.dsh-shutdown-btn-ghost:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.05)); }
.dsh-shutdown-btn-primary {
  background: var(--dsw-alias-label-primary, #1f2329);
  color: var(--dsw-alias-bg-primary, #fff);
  border-color: transparent;
}
.dsh-shutdown-btn-primary:hover { opacity: 0.9; background: var(--dsw-alias-label-primary, #1f2329); }
.dsh-shutdown-screen {
  position: fixed; inset: 0; z-index: 2147483600;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  background: var(--dsw-alias-bg-primary, #fff);
  color: var(--dsw-alias-label-primary, #1f2329);
  font-family: var(--dsw-font-family, inherit);
  text-align: center;
}
.dsh-shutdown-spinner {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2.5px solid var(--dsw-alias-border-l4, rgba(0, 0, 0, 0.15));
  border-top-color: var(--dsw-alias-label-primary, #1f2329);
  animation: dsh-shutdown-spin 0.8s linear infinite;
}
@keyframes dsh-shutdown-spin { to { transform: rotate(360deg); } }
.dsh-shutdown-check {
  width: 44px; height: 44px; border-radius: 50%;
  background: #22a06b; color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.dsh-shutdown-screen-title { margin: 0; font-size: 20px; font-weight: 600; }
.dsh-shutdown-screen-hint { margin: 0; font-size: 13px; color: var(--dsw-alias-label-secondary, #5b616b); }
.dsh-shutdown-settings {
  padding: 12px 0;
  font-family: var(--dsw-font-family, inherit);
  color: var(--dsw-alias-label-primary, #1f2329);
}
.dsh-shutdown-settings-title { margin: 0 0 6px; font-size: 14px; font-weight: 600; }
.dsh-shutdown-settings-desc { margin: 0 0 10px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary, #5b616b); }
.dsh-shutdown-settings-row {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; cursor: pointer; user-select: none;
}
.dsh-shutdown-settings-row input { width: 14px; height: 14px; margin: 0; cursor: pointer; accent-color: var(--dsw-alias-bg-brand, #4c6ef5); }
`;
		const cls = {
			btn: "dsh-shutdown-btn",
			overlay: "dsh-shutdown-overlay",
			card: "dsh-shutdown-card",
			cardTitle: "dsh-shutdown-card-title",
			cardDesc: "dsh-shutdown-card-desc",
			cardError: "dsh-shutdown-card-error",
			checkRow: "dsh-shutdown-check-row",
			footer: "dsh-shutdown-footer",
			btnGhost: "dsh-shutdown-btn-ghost",
			btnPrimary: "dsh-shutdown-btn-primary",
			screen: "dsh-shutdown-screen",
			spinner: "dsh-shutdown-spinner",
			check: "dsh-shutdown-check",
			screenTitle: "dsh-shutdown-screen-title",
			screenHint: "dsh-shutdown-screen-hint",
			settings: "dsh-shutdown-settings",
			settingsTitle: "dsh-shutdown-settings-title",
			settingsDesc: "dsh-shutdown-settings-desc",
			settingsRow: "dsh-shutdown-settings-row"
		};
		function injectStyles() {
			if (typeof document === "undefined") return;
			if (document.getElementById(STYLE_ID)) return;
			const el = document.createElement("style");
			el.id = STYLE_ID;
			el.setAttribute("data-plugin", "dsh-shutdown");
			el.textContent = css;
			document.head.appendChild(el);
		}
		//#endregion
		//#region src/client/ConfirmDialog.tsx
		/** 确认弹窗：自绘遮罩 + 卡片，不依赖 primitives 的 Modal，规避未知 API 面。 */
		function ConfirmDialog({ t, error, onCancel, onConfirm }) {
			const [dontAsk, setDontAsk] = (0, react.useState)(false);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: cls.overlay,
				onClick: onCancel,
				role: "presentation",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: cls.card,
					role: "dialog",
					"aria-modal": "true",
					"aria-label": t("dialog.title"),
					onClick: (event) => event.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
							className: cls.cardTitle,
							children: t("dialog.title")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: cls.cardDesc,
							children: t("dialog.description")
						}),
						error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: cls.cardError,
							children: t("dialog.error")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: cls.checkRow,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: dontAsk,
								onChange: (event) => setDontAsk(event.currentTarget.checked)
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("dialog.dontAsk") })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: cls.footer,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: cls.btnGhost,
								onClick: onCancel,
								children: t("dialog.cancel")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `${cls.btnGhost} ${cls.btnPrimary}`,
								onClick: () => onConfirm(dontAsk),
								children: t("dialog.confirm")
							})]
						})
					]
				})
			});
		}
		//#endregion
		//#region src/client/ErrorBoundary.tsx
		/**
		* 隔离插件组件的渲染错误：出错时渲染 null（本插件功能缺席），
		* 避免异常冒泡影响 dsh 主界面其他部分。
		*/
		var ErrorBoundary = class extends react.Component {
			state = { error: null };
			static getDerivedStateFromError(error) {
				return { error };
			}
			componentDidCatch(error) {
				console.error("[dsh-shutdown] render error:", error);
			}
			render() {
				if (this.state.error) return null;
				return this.props.children;
			}
		};
		//#endregion
		//#region src/client/shutdown.ts
		/** 与 Host 半 src/index.ts 中的路由保持一致 */
		const EXIT_ROUTE = "/api/dsh-shutdown.exit";
		function exitUrl() {
			const origin = globalThis.location?.origin ?? "";
			return new URL(EXIT_ROUTE, origin && origin !== "null" ? origin : "http://dsh.internal").toString();
		}
		/**
		* 请求安全结束 dsh 进程，返回 Host 是否确认受理（2xx）。
		*
		* keepalive：确认后页面可能立刻关闭，保证请求在页面卸载后仍送达。
		* 请求本身发不出去（连接被拒）通常意味着服务已不可达——按已受理处理，
		* 由「dsh 已安全关闭」兜底画面接管展示。
		*/
		async function requestAppExit() {
			try {
				return (await fetch(exitUrl(), {
					method: "POST",
					keepalive: true,
					headers: { "content-type": "application/json" },
					body: "{}"
				})).ok;
			} catch {
				return true;
			}
		}
		//#endregion
		//#region src/client/ShutdownScreen.tsx
		/**
		* 关闭兜底画面：window.close() 未能关闭标签页时接管整页展示。
		* Host 侧从「回包 → dispose 完成」有最长数秒的收尾时间，先显示进行中再切换终态。
		*/
		function ShutdownScreen({ t }) {
			const [done, setDone] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				const timer = setTimeout(() => setDone(true), 2500);
				return () => clearTimeout(timer);
			}, []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: cls.screen,
				children: done ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: cls.check,
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
							width: "22",
							height: "22",
							viewBox: "0 0 24 24",
							fill: "none",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
								d: "M5 12.5l4.5 4.5L19 7.5",
								stroke: "currentColor",
								strokeWidth: "2.5",
								strokeLinecap: "round",
								strokeLinejoin: "round"
							})
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: cls.screenTitle,
						children: t("screen.closed")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: cls.screenHint,
						children: t("screen.hint")
					})
				] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: cls.spinner,
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: cls.screenTitle,
					children: t("screen.closing")
				})] })
			});
		}
		//#endregion
		//#region src/client/storage.ts
		/**
		* 「不再显示确认提示」偏好。
		*
		* 存储在浏览器 localStorage：与确认弹窗同源同浏览器，设置页卡片读写同一份，
		* 行为见 README。存储不可用（隐私模式等）时静默退化为每次都确认。
		*/
		const STORAGE_KEY = "dsh-shutdown.skipConfirm";
		function isConfirmSkipped() {
			try {
				return globalThis.localStorage?.getItem(STORAGE_KEY) === "1";
			} catch {
				return false;
			}
		}
		function setConfirmSkipped(skipped) {
			try {
				const storage = globalThis.localStorage;
				if (!storage) return;
				if (skipped) storage.setItem(STORAGE_KEY, "1");
				else storage.removeItem(STORAGE_KEY);
			} catch {}
		}
		//#endregion
		//#region src/client/HeaderAction.tsx
		/** 叉号图标：与「Session 日志」按钮的图标尺寸一致（12px）。 */
		function CloseIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "12",
				height: "12",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M4 4l8 8M12 4l-8 8",
					stroke: "currentColor",
					strokeWidth: "1.5",
					strokeLinecap: "round"
				})
			});
		}
		function HeaderActionInner(props) {
			const tr = composeT(props.t, detectLocale());
			const [phase, setPhase] = (0, react.useState)("idle");
			const [screen, setScreen] = (0, react.useState)(false);
			const runShutdown = (0, react.useCallback)(async () => {
				if (!await requestAppExit()) {
					setPhase("error");
					return;
				}
				window.close();
				setTimeout(() => setScreen(true), 500);
			}, []);
			const onButtonClick = (0, react.useCallback)(() => {
				if (isConfirmSkipped()) {
					runShutdown();
					return;
				}
				setPhase("confirm");
			}, [runShutdown]);
			const onConfirm = (0, react.useCallback)((dontAskAgain) => {
				if (dontAskAgain) setConfirmSkipped(true);
				setPhase("idle");
				runShutdown();
			}, [runShutdown]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: cls.btn,
					title: tr("header.tooltip"),
					"aria-label": tr("header.tooltip"),
					onClick: onButtonClick,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("header.action") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, {})]
				}),
				(phase === "confirm" || phase === "error") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConfirmDialog, {
					t: tr,
					error: phase === "error",
					onCancel: () => setPhase("idle"),
					onConfirm
				}),
				screen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ShutdownScreen, { t: tr })
			] });
		}
		/** 顶栏「关闭 dsh」按钮：注册在 conversation.session.header.utilities 槽位。 */
		function ShutdownHeaderAction(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorBoundary, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HeaderActionInner, { ...props }) });
		}
		//#endregion
		//#region src/client/SettingsCard.tsx
		/**
		* 设置页插件卡片（settings.general.item 槽位）：重新开启「关闭前确认提示」。
		* 与确认弹窗读写同一份 localStorage 偏好。
		*/
		function SettingsCardInner({ t }) {
			const tr = composeT(t);
			const [confirmOn, setConfirmOn] = (0, react.useState)(() => !isConfirmSkipped());
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: cls.settings,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
						className: cls.settingsTitle,
						children: tr("settings.title")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: cls.settingsDesc,
						children: tr("settings.description")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: cls.settingsRow,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: confirmOn,
							onChange: (event) => {
								const on = event.currentTarget.checked;
								setConfirmOn(on);
								setConfirmSkipped(!on);
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("settings.confirm") })]
					})
				]
			});
		}
		function ShutdownSettingsCard(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorBoundary, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingsCardInner, { ...props }) });
		}
		//#endregion
		//#region src/client/index.tsx
		/** 依赖的浏览器端服务：slots（槽位注册表）与 locale（词典注册） */
		const inject = ["slots", "locale"];
		function apply(ctx) {
			injectStyles();
			ctx.effect(() => {
				ctx.locale.register(NS, dictionaries);
			}, "dsh-shutdown: locale dictionaries");
			ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
				name: "conversation.session.header.utilities",
				id: "dsh-shutdown",
				order: 1e4,
				locale: NS
			}, ShutdownHeaderAction));
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "dsh-shutdown",
				order: 120,
				key: NS,
				locale: NS
			}, ShutdownSettingsCard));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
