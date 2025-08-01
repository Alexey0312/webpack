"use strict";

const fs = require("fs");
const join = require("path").join;
const webpack = require("../../../");

/**
 * @param {string} path path
 * @returns {string} JSON content of a file
 */
function read(path) {
	return JSON.stringify(
		fs.readFileSync(join(__dirname, path), "utf8").replace(/\r\n?/g, "\n")
	);
}

/** @type {import("../../../").Configuration[]} */
module.exports = [
	{
		mode: "production",
		entry: "./index",
		output: {
			filename: "123.js"
		},
		plugins: [
			new webpack.DefinePlugin({
				VALUE: "123"
			})
		]
	},

	{
		mode: "production",
		entry: "./index",
		output: {
			filename: "321.js"
		},
		plugins: [
			new webpack.DefinePlugin({
				VALUE: "321"
			})
		]
	},

	{
		mode: "production",
		entry: "./index",
		output: {
			filename: "both.js"
		},
		plugins: [
			new webpack.DefinePlugin({
				VALUE: webpack.DefinePlugin.runtimeValue(
					() => read("123.txt"),
					[join(__dirname, "./123.txt")]
				)
			}),
			new webpack.DefinePlugin({
				VALUE: webpack.DefinePlugin.runtimeValue(
					() => read("321.txt"),
					[join(__dirname, "./321.txt")]
				)
			})
		]
	},

	{
		mode: "production",
		entry: "./index",
		output: {
			filename: "log.js"
		},
		infrastructureLogging: {
			debug: /DefinePlugin/,
			level: "none"
		},
		stats: {
			loggingDebug: /DefinePlugin/,
			logging: "none"
		},
		plugins: [
			new webpack.DefinePlugin({
				VALUE: "123"
			})
		]
	}
];
