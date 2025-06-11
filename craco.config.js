const path = require('path');

module.exports = {
    webpack: {
        configure: {
            resolve: {
                fallback: {
                    "stream": require.resolve("stream-browserify"),
                    "crypto": require.resolve("crypto-browserify"),
                    "http": require.resolve("stream-http"),
                    "https": require.resolve("https-browserify"),
                    "zlib": require.resolve("browserify-zlib"),
                    "url": require.resolve("url"),
                    "assert": require.resolve("assert"),
                    "util": require.resolve("util"),
                    "buffer": require.resolve("buffer"),
                }
            },
        },
    },
}; 