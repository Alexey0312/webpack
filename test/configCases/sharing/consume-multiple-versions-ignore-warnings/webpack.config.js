"use strict";

const { ConsumeSharedPlugin } = require("../../../../").sharing;

/** @type {import("../../../../").Configuration} */
module.exports = {
	output: {
		ignoreBrowserWarnings: true
	},
	plugins: [
		new ConsumeSharedPlugin({
			consumes: {
				shared: {
					import: false,
					strictVersion: true
				},
				shared2: {
					import: false
				}
			}
		})
	]
};
