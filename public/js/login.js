// @ts-check
// @ts-expect-error - Módulo servido vía CDN; TS no puede resolver la URL.
import Alpine from "https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/module.esm.js"
import { api, normalizeErrors, toast } from "./api.js"

/** @typedef {import("./api.js").ApiPayload} ApiPayload */

/**
 * Página a la que se vuelve después de entrar. Solo se aceptan rutas
 * internas ("/algo"), para no redirigir a otros sitios.
 *
 * @returns {string}
 */
function nextPage() {
	const next = new URLSearchParams(window.location.search).get("next") ?? ""
	return next.startsWith("/") && !next.startsWith("//") ? next : "/index.html"
}

function createLogin() {
	return {
		mode: "login",
		form: { name: "", email: "", password: "" },
		errors: {},
		busy: false,

		async init() {
			// Si ya hay una sesión activa, no tiene sentido mostrar el login.
			try {
				await api("/auth/me")
				window.location.href = nextPage()
			} catch {
				// Sin sesión: se queda en el login.
			}
		},

		toggleMode() {
			this.mode = this.mode === "login" ? "register" : "login"
			this.errors = {}
		},

		async submit() {
			this.busy = true
			this.errors = {}

			const isLogin = this.mode === "login"
			const body = isLogin
				? { email: this.form.email, password: this.form.password }
				: { name: this.form.name, email: this.form.email, password: this.form.password }

			try {
				await api(isLogin ? "/auth/login" : "/auth/register", {
					method: "POST",
					body: JSON.stringify(body),
				})
				window.location.href = nextPage()
			} catch (error) {
				const err = /** @type {ApiPayload} */ (error)

				if (err?.errors) {
					this.errors = normalizeErrors(err.errors)
				} else {
					toast(err?.message ?? err?.error ?? "Ocurrió un error inesperado")
				}
			} finally {
				this.busy = false
			}
		},
	}
}

Alpine.data("login", createLogin)
Alpine.start()
