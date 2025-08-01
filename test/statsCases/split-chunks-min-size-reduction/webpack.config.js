"use strict";

const stats = {
	hash: false,
	timings: false,
	builtAt: false,
	assets: false,
	chunks: true,
	chunkRelations: true,
	chunkModules: true,
	dependentModules: true,
	chunkOrigins: true,
	entrypoints: true,
	modules: false
};

/** @type {import("../../../").Configuration} */
module.exports = {
	mode: "production",
	entry: {
		main: "./"
	},
	output: {
		filename: "default/[name].js"
	},
	optimization: {
		splitChunks: {
			minSize: 0,
			minSizeReduction: 300
		}
	},
	stats
};
