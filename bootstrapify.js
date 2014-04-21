var StyleGenerator = {
    removeStyles: [
        'line-height',
        'color',
        'text-decoration',
        'background',
        'background-color',
        'font',
        'font-size',
        'font-family',
        'font',
        'border',
        'border-color'
    ],

    addBootstrapStylesheet: function() {
        var bootstrap = document.createElement("link");
        bootstrap.type = "text/css";
        bootstrap.rel = "stylesheet";
        bootstrap.href = "//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css";
        document.getElementsByTagName("head")[0].appendChild(bootstrap);

    },

    removeStylesheets: function() {
        // Would prefer to use removeLocalStyles, but document.styleSheets API
        // does not contain rules for css files hosted on other sites, including CDNs
        var stylesheets = document.styleSheets;
        for (var i = 0; i < stylesheets.length; i++) {
            if (stylesheets[i].cssRules === null) {
                stylesheets[i].disabled = true;
            }
        }
    },

    removeLocalStyles: function() {
        var stylesheets = document.styleSheets;

        for (var i = 0; i < stylesheets.length; i++) {
            var cssRules = stylesheets[i].cssRules ? stylesheets[i].cssRules: [];
            for (var j = 0; j < cssRules.length; j++) {
                var styleObj = cssRules[j].style ? cssRules[j].style: [];
                for (var k = styleObj.length-1; k >= 0; k--) {
                   var nameString = styleObj[k];
                   if (this.removeStyles.indexOf(nameString) >= 0) {
                       styleObj.removeProperty(nameString);
                   }
                }
            }
        }
    },
    
    addBootstrapMarkup: function() {
        document.body.className = "container";
    }
};


// StyleGenerator.removeLocalStyles();
StyleGenerator.removeStylesheets();
StyleGenerator.addBootstrapStylesheet();
StyleGenerator.addBootstrapMarkup();