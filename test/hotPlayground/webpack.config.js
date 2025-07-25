"use strict";

const path = require("path");
const webpack = require("../../");

/** @type {import("../../").Configuration} */
module.exports = {
	entry: ["../../hot/dev-server", "./index.js"],
	output: {
		filename: "bundle.js",
		hotUpdateChunkFilename: "[id].[fullhash].bundle-update.js",
		hashDigestLength: 4
	},
	plugins: [new webpack.HotModuleReplacementPlugin()],
	recordsPath: path.resolve(__dirname, "./records.json") // this is not required for the webpack-dev-server, but when compiled.
};
