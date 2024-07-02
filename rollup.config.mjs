const outputs = ['cjs', 'esm']
	.map((format) => ({
		file: `./dist/index.${format}.js`,
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
