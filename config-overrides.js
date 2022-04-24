const webpack = require('webpack');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};

    Object.assign(fallback, {
        'buffer': require.resolve('buffer'),
    });

    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
        }),
    ]);

    config.module.rules.find(rule => !!rule.oneOf).oneOf.unshift({
        test: /\.(yml|yaml)$/,
        use: ['yaml-loader'],
    });

    return config;
}
