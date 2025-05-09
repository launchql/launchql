module.exports = (api) => {
  api.cache(true);
  return {
    plugins: [
      ["@babel/plugin-transform-runtime",
        {
          "esmodules": true
        }],
      '@babel/proposal-object-rest-spread',
      '@babel/proposal-class-properties',
      '@babel/proposal-export-default-from'
    ],
    presets: [
      "@babel/env"
    ]
  };
};
