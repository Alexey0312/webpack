// This config need to be set on initial evaluation to be effective
__webpack_nonce__ = "nonce";
__webpack_public_path__ = "https://example.com/public/path/";

it("should prefetch and preload child chunks on chunk load", () => {
	let link, script;

	expect(document.head._children).toHaveLength(3);

	// Test prefetch from entry chunk
	link = document.head._children[0];
	expect(link._type).toBe("link");
	expect(link.rel).toBe("prefetch");
	expect(link.as).toBe("script");
	expect(link.charset).toBe("utf-8");
	expect(link.href).toBe("https://example.com/public/path/chunk1.js");

	link = document.head._children[1];
	expect(link._type).toBe("link");
	expect(link.rel).toBe("prefetch");
	expect(link.as).toBe("style");
	expect(link.href).toBe("https://example.com/public/path/chunk2-css.css");

	link = document.head._children[2];
	expect(link._type).toBe("link");
	expect(link.rel).toBe("prefetch");
	expect(link.as).toBe("script");
	expect(link.href).toBe("https://example.com/public/path/chunk2-css.js");

	const promise = import(
		/* webpackChunkName: "chunk1", webpackPrefetch: true */ "./chunk1"
	);

	expect(document.head._children).toHaveLength(7);

	// Test normal script loading
	script = document.head._children[3];
	expect(script._type).toBe("script");
	expect(script.src).toBe("https://example.com/public/path/chunk1.js");
	expect(script.getAttribute("nonce")).toBe("nonce");
	expect(script.crossOrigin).toBe("anonymous");
	expect(script.onload).toBeTypeOf("function");

	// Test preload of chunk1-b
	link = document.head._children[4];
	expect(link._type).toBe("link");
	expect(link.rel).toBe("preload");
	expect(link.as).toBe("script");
	expect(link.href).toBe("https://example.com/public/path/chunk1-b.js");
	expect(link.charset).toBe("utf-8");
	expect(link.getAttribute("nonce")).toBe("nonce");
	expect(link.crossOrigin).toBe("anonymous");

	// Test preload of chunk1-a-css
	link = document.head._children[5];
	expect(link._type).toBe("link");
	expect(link.rel).toBe("preload");
	expect(link.as).toBe("style");
	expect(link.href).toBe("https://example.com/public/path/chunk1-a-css.css");

	link = document.head._children[6];
	expect(link._type).toBe("link");
	expect(link.rel).toBe("preload");
	expect(link.as).toBe("script");
	expect(link.href).toBe("https://example.com/public/path/chunk1-a-css.js");
	expect(link.charset).toBe("utf-8");
	expect(link.getAttribute("nonce")).toBe("nonce");
	expect(link.crossOrigin).toBe("anonymous");

	// Run the script
	__non_webpack_require__("./chunk1.js");

	script.onload();

	return promise.then(() => {
		expect(document.head._children).toHaveLength(8);

		// Test prefetching for chunk1-c and chunk1-a in this order
		link = document.head._children[6];
		expect(link._type).toBe("link");
		expect(link.rel).toBe("prefetch");
		expect(link.as).toBe("script");
		expect(link.href).toBe("https://example.com/public/path/chunk1-c.js");
		expect(link.charset).toBe("utf-8");
		expect(link.crossOrigin).toBe("anonymous");

		link = document.head._children[7];
		expect(link._type).toBe("link");
		expect(link.rel).toBe("prefetch");
		expect(link.as).toBe("script");
		expect(link.href).toBe("https://example.com/public/path/chunk1-a.js");
		expect(link.crossOrigin).toBe("anonymous");

		const promise2 = import(
			/* webpackChunkName: "chunk1", webpackPrefetch: true */ "./chunk1"
		);

		// Loading chunk1 again should not trigger prefetch/preload
		expect(document.head._children).toHaveLength(8);

		const promise3 = import(/* webpackChunkName: "chunk2" */ "./chunk2");

		expect(document.head._children).toHaveLength(9);

		// Test normal script loading
		script = document.head._children[8];
		expect(script._type).toBe("script");
		expect(script.src).toBe("https://example.com/public/path/chunk2.js");
		expect(script.getAttribute("nonce")).toBe("nonce");
		expect(script.crossOrigin).toBe("anonymous");
		expect(script.onload).toBeTypeOf("function");

		// Run the script
		__non_webpack_require__("./chunk2.js");

		script.onload();

		return promise3.then(() => {
			// Loading chunk2 again should not trigger prefetch/preload as it's already prefetch/preloaded
			expect(document.head._children).toHaveLength(8);

			const promise4 = import(/* webpackChunkName: "chunk1-css" */ "./chunk1.css");

			expect(document.head._children).toHaveLength(10);

			link = document.head._children[8];
			expect(link._type).toBe("link");
			expect(link.rel).toBe("stylesheet");
			expect(link.href).toBe("https://example.com/public/path/chunk1-css.css");
			expect(link.crossOrigin).toBe("anonymous");

			const promise5 = import(/* webpackChunkName: "chunk2-css", webpackPrefetch: true */ "./chunk2.css");

			expect(document.head._children).toHaveLength(12);

			link = document.head._children[10];
			expect(link._type).toBe("link");
			expect(link.rel).toBe("stylesheet");
			expect(link.href).toBe("https://example.com/public/path/chunk2-css.css");
			expect(link.crossOrigin).toBe("anonymous");
		});
	});
});
