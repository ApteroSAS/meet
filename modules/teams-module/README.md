This is the axolotis-teams-modules that allows the application
to use the teams and microsoft service directly.

library contains async files and should be served in the parent project example with webpack:
```javascript
new CopyWebpackPlugin({
    patterns: [{
        from: "node_modules/@aptero/axolotis-module-teams/build/library/",
        to: "assets/js/library"
    }]
})
```


