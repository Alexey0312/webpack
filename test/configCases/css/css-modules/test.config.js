"use strict";

module.exports = {
	findBundle(i) {
		return i === 0
			? ["./use-style_js.bundle0.js", "./bundle0.js"]
			: ["./142.bundle1.js", "./bundle1.js"];
	}
};
