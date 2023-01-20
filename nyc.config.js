module.exports = {
    "extends": "@istanbuljs/nyc-config-typescript",
    "all": true,
    //"check-coverage":true,
    "include":["src/**/*.ts","src/**/*.js"],
    "exclude":["src/workers/**/*.js","src/vendor/**/*.js","src/loaders/**/*.js","src/assets/**/*.js"],
    "reporter":['lcov','text','html'],
    //"extension":['.ts']
};