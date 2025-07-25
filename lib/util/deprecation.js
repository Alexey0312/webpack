/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

const util = require("util");

/** @type {Map<string, () => void>} */
const deprecationCache = new Map();

/**
 * @typedef {object} FakeHookMarker
 * @property {true} _fakeHook it's a fake hook
 */

/**
 * @template T
 * @typedef {T & FakeHookMarker} FakeHook<T>
 */

/**
 * @param {string} message deprecation message
 * @param {string} code deprecation code
 * @returns {() => void} function to trigger deprecation
 */
const createDeprecation = (message, code) => {
	const cached = deprecationCache.get(message);
	if (cached !== undefined) return cached;
	const fn = util.deprecate(
		() => {},
		message,
		`DEP_WEBPACK_DEPRECATION_${code}`
	);
	deprecationCache.set(message, fn);
	return fn;
};

/** @typedef {"concat" | "entry" | "filter" | "find" | "findIndex" | "includes" | "indexOf" | "join" | "lastIndexOf" | "map" | "reduce" | "reduceRight" | "slice" | "some"} COPY_METHODS_NAMES */

/** @type {COPY_METHODS_NAMES[]} */
const COPY_METHODS = [
	"concat",
	"entry",
	"filter",
	"find",
	"findIndex",
	"includes",
	"indexOf",
	"join",
	"lastIndexOf",
	"map",
	"reduce",
	"reduceRight",
	"slice",
	"some"
];

/** @typedef {"copyWithin" | "entries" | "fill" | "keys" | "pop" | "reverse" | "shift" | "splice" | "sort" | "unshift"} DISABLED_METHODS_NAMES */

/** @type {DISABLED_METHODS_NAMES[]} */
const DISABLED_METHODS = [
	"copyWithin",
	"entries",
	"fill",
	"keys",
	"pop",
	"reverse",
	"shift",
	"splice",
	"sort",
	"unshift"
];

/**
 * @template T
 * @typedef {Set<T> & {[Symbol.isConcatSpreadable]?: boolean} & { push?: (...items: T[]) => void } & { [P in DISABLED_METHODS_NAMES]?: () => void } & { [P in COPY_METHODS_NAMES]?: () => TODO }} SetWithDeprecatedArrayMethods
 */

/**
 * @template T
 * @param {SetWithDeprecatedArrayMethods<T>} set new set
 * @param {string} name property name
 * @returns {void}
 */
module.exports.arrayToSetDeprecation = (set, name) => {
	for (const method of COPY_METHODS) {
		if (set[method]) continue;
		const d = createDeprecation(
			`${name} was changed from Array to Set (using Array method '${method}' is deprecated)`,
			"ARRAY_TO_SET"
		);
		/**
		 * @deprecated
		 * @this {Set<T>}
		 * @returns {number} count
		 */
		// eslint-disable-next-line func-names
		set[method] = function () {
			d();
			// eslint-disable-next-line unicorn/prefer-spread
			const array = Array.from(this);
			return Array.prototype[/** @type {keyof COPY_METHODS} */ (method)].apply(
				array,
				// eslint-disable-next-line prefer-rest-params
				arguments
			);
		};
	}
	const dPush = createDeprecation(
		`${name} was changed from Array to Set (using Array method 'push' is deprecated)`,
		"ARRAY_TO_SET_PUSH"
	);
	const dLength = createDeprecation(
		`${name} was changed from Array to Set (using Array property 'length' is deprecated)`,
		"ARRAY_TO_SET_LENGTH"
	);
	const dIndexer = createDeprecation(
		`${name} was changed from Array to Set (indexing Array is deprecated)`,
		"ARRAY_TO_SET_INDEXER"
	);
	/**
	 * @deprecated
	 * @this {Set<T>}
	 * @returns {number} count
	 */
	set.push = function push() {
		dPush();
		// eslint-disable-next-line prefer-rest-params, unicorn/prefer-spread
		for (const item of Array.from(arguments)) {
			this.add(item);
		}
		return this.size;
	};
	for (const method of DISABLED_METHODS) {
		if (set[method]) continue;

		set[method] = () => {
			throw new Error(
				`${name} was changed from Array to Set (using Array method '${method}' is not possible)`
			);
		};
	}
	/**
	 * @param {number} index index
	 * @returns {() => T | undefined} value
	 */
	const createIndexGetter = (index) => {
		/**
		 * @this {Set<T>} a Set
		 * @returns {T | undefined} the value at this location
		 */
		// eslint-disable-next-line func-style
		const fn = function () {
			dIndexer();
			let i = 0;
			for (const item of this) {
				if (i++ === index) return item;
			}
		};
		return fn;
	};
	/**
	 * @param {number} index index
	 */
	const defineIndexGetter = (index) => {
		Object.defineProperty(set, index, {
			get: createIndexGetter(index),
			set(value) {
				throw new Error(
					`${name} was changed from Array to Set (indexing Array with write is not possible)`
				);
			}
		});
	};
	defineIndexGetter(0);
	let indexerDefined = 1;
	Object.defineProperty(set, "length", {
		get() {
			dLength();
			const length = this.size;
			for (indexerDefined; indexerDefined < length + 1; indexerDefined++) {
				defineIndexGetter(indexerDefined);
			}
			return length;
		},
		set(value) {
			throw new Error(
				`${name} was changed from Array to Set (writing to Array property 'length' is not possible)`
			);
		}
	});
	set[Symbol.isConcatSpreadable] = true;
};

/**
 * @template T
 * @param {string} name name
 * @returns {{ new <T = any>(values?: readonly T[] | null): SetDeprecatedArray<T> }} SetDeprecatedArray
 */
module.exports.createArrayToSetDeprecationSet = (name) => {
	let initialized = false;

	/**
	 * @template T
	 */
	class SetDeprecatedArray extends Set {
		/**
		 * @param {readonly T[] | null=} items items
		 */
		constructor(items) {
			super(items);
			if (!initialized) {
				initialized = true;
				module.exports.arrayToSetDeprecation(
					SetDeprecatedArray.prototype,
					name
				);
			}
		}
	}
	return SetDeprecatedArray;
};

/**
 * @template {object} T
 * @param {T} fakeHook fake hook implementation
 * @param {string=} message deprecation message (not deprecated when unset)
 * @param {string=} code deprecation code (not deprecated when unset)
 * @returns {FakeHook<T>} fake hook which redirects
 */
module.exports.createFakeHook = (fakeHook, message, code) => {
	if (message && code) {
		fakeHook = deprecateAllProperties(fakeHook, message, code);
	}
	return Object.freeze(
		Object.assign(fakeHook, { _fakeHook: /** @type {true} */ (true) })
	);
};

/**
 * @template T
 * @param {T} obj object
 * @param {string} message deprecation message
 * @param {string} code deprecation code
 * @returns {T} object with property access deprecated
 */
const deprecateAllProperties = (obj, message, code) => {
	const newObj = {};
	const descriptors = Object.getOwnPropertyDescriptors(obj);
	for (const name of Object.keys(descriptors)) {
		const descriptor = descriptors[name];
		if (typeof descriptor.value === "function") {
			Object.defineProperty(newObj, name, {
				...descriptor,
				value: util.deprecate(descriptor.value, message, code)
			});
		} else if (descriptor.get || descriptor.set) {
			Object.defineProperty(newObj, name, {
				...descriptor,
				get: descriptor.get && util.deprecate(descriptor.get, message, code),
				set: descriptor.set && util.deprecate(descriptor.set, message, code)
			});
		} else {
			let value = descriptor.value;
			Object.defineProperty(newObj, name, {
				configurable: descriptor.configurable,
				enumerable: descriptor.enumerable,
				get: util.deprecate(() => value, message, code),
				set: descriptor.writable
					? util.deprecate(
							/**
							 * @template T
							 * @param {T} v value
							 * @returns {T} result
							 */
							(v) => (value = v),
							message,
							code
						)
					: undefined
			});
		}
	}
	return /** @type {T} */ (newObj);
};

module.exports.deprecateAllProperties = deprecateAllProperties;

/**
 * @template {object} T
 * @param {T} obj object
 * @param {string} name property name
 * @param {string} code deprecation code
 * @param {string} note additional note
 * @returns {T} frozen object with deprecation when modifying
 */
module.exports.soonFrozenObjectDeprecation = (obj, name, code, note = "") => {
	const message = `${name} will be frozen in future, all modifications are deprecated.${
		note && `\n${note}`
	}`;
	return /** @type {T} */ (
		new Proxy(obj, {
			set: util.deprecate(
				/**
				 * @param {object} target target
				 * @param {string | symbol} property property
				 * @param {EXPECTED_ANY} value value
				 * @param {EXPECTED_ANY} receiver receiver
				 * @returns {boolean} result
				 */
				(target, property, value, receiver) =>
					Reflect.set(target, property, value, receiver),
				message,
				code
			),
			defineProperty: util.deprecate(
				/**
				 * @param {object} target target
				 * @param {string | symbol} property property
				 * @param {PropertyDescriptor} descriptor descriptor
				 * @returns {boolean} result
				 */
				(target, property, descriptor) =>
					Reflect.defineProperty(target, property, descriptor),
				message,
				code
			),
			deleteProperty: util.deprecate(
				/**
				 * @param {object} target target
				 * @param {string | symbol} property property
				 * @returns {boolean} result
				 */
				(target, property) => Reflect.deleteProperty(target, property),
				message,
				code
			),
			setPrototypeOf: util.deprecate(
				/**
				 * @param {object} target target
				 * @param {EXPECTED_OBJECT | null} proto proto
				 * @returns {boolean} result
				 */
				(target, proto) => Reflect.setPrototypeOf(target, proto),
				message,
				code
			)
		})
	);
};
