"use strict";

module.exports = {
	findBundle(i) {
		return i === 0 ? "./web-0.js" : "./webworker-1.js";
	}
};
