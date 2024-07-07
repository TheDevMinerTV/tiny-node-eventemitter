const outputs = [
	['cjs', 'cjs'],
	['esm', 'mjs']
]
	.map(([format, suffix]) => ({
		file: `./dist/index.${suffix}`,
		format,
		sourcemap: true,
		sourcemapExcludeSources: true
	}))
	.flat();

/**	@type {import('rollup').RollupOptions} */
export default {
	input: './src/index.js',
	output: outputs
};
