module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/EPICenter-Website/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "build/chunks/8b612_d1204736._.js",
  "build/chunks/[root-of-the-server]__922242ae._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/EPICenter-Website/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];