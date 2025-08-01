"use strict";

const fs = require("fs");
const path = require("path");

module.exports = {
	findBundle() {
		return "./bundle.js";
	},
	afterExecute(options) {
		const workerCode = fs.readFileSync(
			path.resolve(options.output.path, "./worker_js.bundle.js"),
			"utf8"
		);

		if (!/require\(\) chunk loading for javascript/.test(workerCode)) {
			throw new Error(
				"require was not found in the worker code for loading async chunks"
			);
		}
	}
};
