/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

const WebpackError = require("./WebpackError");

/** @typedef {import("./Module")} Module */

class ModuleRestoreError extends WebpackError {
	/**
	 * @param {Module} module module tied to dependency
	 * @param {string | Error} err error thrown
	 */
	constructor(module, err) {
		let message = "Module restore failed: ";
		/** @type {string | undefined} */
		const details = undefined;
		if (err !== null && typeof err === "object") {
			if (typeof err.stack === "string" && err.stack) {
				const stack = err.stack;
				message += stack;
			} else if (typeof err.message === "string" && err.message) {
				message += err.message;
			} else {
				message += err;
			}
		} else {
			message += String(err);
		}

		super(message);

		this.name = "ModuleRestoreError";
		/** @type {string | undefined} */
		this.details = details;
		this.module = module;
		this.error = err;
	}
}

module.exports = ModuleRestoreError;
