/*  This plugin uses two different approaches for re-rendering the page with
    bootstrap styling, depending on whether the site relies on external (CDN)
    stylesheets, or if the stylesheets are on the same domain. */

    /* Self-hosted: We can step through site's stylesheets and save any desired
        user styles to a dynamically generated stylesheet. Preferred approach.

        1. Step through stylesheets and save styles not related to color/font
        2. Disable stylesheets
        3. Reapply local styles via a new stylesheet in the head
        4. Add bootstrap markup
        5. Add bootstrap stylesheet
        6. Custom font size and line height
    */

    /* CDN: If the user hosts their CSS files externally, we do not have access to all
        of the document.stylesheets cssRules. We must instead use element.getComputedStyle
        to determine and reapply user styles inline. This approach is inferior
        because computed styles applied inline are not "trumped" by Twitter Bootstrap styles.
        Also there is no way to differentiate between user-specified widths and
        widths computed by browser, meaning certain nodes will be restricted
        in size, despite the new content having larger font, line-height, etc.

        1. Step through DOM and get computed styles for each node,
            saving any styles related to structure / layout
        2. Disable stylesheets
        3. Reapply styles inline
        4. Add bootstrap markup
        5. Add bootstrap stylesheet
        6. H1-H6 and other fixes

    */

// Parent object for both sets of solutions. Contains shared methods
var StyleGenerator = function() {};

StyleGenerator.prototype = {

    addBootstrapStylesheet: function() {
        var bootstrap = document.createElement("link");
        bootstrap.type = "text/css";
        bootstrap.rel = "stylesheet";
        bootstrap.href = "//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css";
        document.getElementsByTagName("head")[0].appendChild(bootstrap);
    },

    bootstrapContainer: function() {
        if (!document.querySelector('.container')) {
            document.body.className = "container";
        }
    },

    bootstrapNavigation: function() {
        var navs = [], i = 0;
        var possibleNavSelectors = [
            'nav>ul',
            '#nav>ul',
            'ul.nav',
            'ul.menu',
            'ul.main-nav',
            'ul.main-menu',
            'ul.mainNav',
            'ul.mainMenu'
        ];

        // continue trying selectors until we find the user's navigation
        while (navs.length <= 0 && i < possibleNavSelectors.length) {
            navs = document.querySelectorAll(possibleNavSelectors[i]);
            i++;
        }

        // once found, apply bootstrap nav class
        for (i = 0; i < navs.length; i++) {
            navs[i].className = "nav nav-tabs";
        }
    },

    bootstrapTables: function() {
        var tables = document.getElementsByTagName('table');

        for (var i = 0; i < tables.length; i++) {
            tables[i].className = "table table-bordered table-striped";
        }
    },

    bootstrapButtons: function() {
        var buttons = document.getElementsByTagName('button');

        for (var i = 0; i < buttons.length; i++) {
            buttons[i].className = "btn btn-default";
        }
    },

    bootstrapForms: function() {
        var forms = document.getElementsByTagName('form');

        for (var i = 0; i < forms.length; i++) {
            forms[i].className = "form form-inline";
        }
    },

    bootstrapInputs: function() {
        var inputs = document.getElementsByTagName('input');

        for (var i = 0; i < inputs.length; i++) {
            var inputClass = "form-control";
            if (inputs[i].type === "submit") {
                inputClass += " btn btn-primary";
            }

            inputs[i].className = inputClass;
        }
    },

    bootstrapTextareas: function() {
        var textareas = document.getElementsByTagName('textarea');
        for (var i = 0; i < textareas.length; i++) {
            textareas[i].className = "form-control";
        }
    },

    addBootstrapMarkup: function() {
        this.bootstrapContainer();
        this.bootstrapNavigation();
        this.bootstrapTables();
        this.bootstrapButtons();
        this.bootstrapForms();
        this.bootstrapInputs();
        this.bootstrapTextareas();
    },

    generateStyles: function() {
        this.saveStyles();
        this.disableStylesheets();
        this.reapplyStyles();
        this.addBootstrapMarkup();
        this.addBootstrapStylesheet();
        this.addCustomStyles();
    }
};

//
var HostedStyleGenerator = function(){
    StyleGenerator.call(this);

    this.localStyles = [];
    this.removeStyles = [
        'line-height',
        'color',
        'text-decoration',
        'text-shadow',
        'background',
        'background-color',
        'font',
        'font-size',
        'font-family',
        'border',
        'border-color',
        'border-bottom-color',
        'border-top-color',
        'border-right-color',
        'border-left-color'
    ];
};

// StyleGenerator child object for sites which host their own CSS
HostedStyleGenerator.prototype = Object.create(StyleGenerator.prototype);
HostedStyleGenerator.prototype.constructor = HostedStyleGenerator;

HostedStyleGenerator.prototype.saveStyles = function() {
    var stylesheets = document.styleSheets;
    var self = this, rule, prop;

    for (var i = 0; i < stylesheets.length; i++) {
        var cssRules = stylesheets[i].cssRules || [];

        for (var j = 0; j < cssRules.length; j++) {
            var styleObj, selector;

            // nested rules
            if (cssRules[j].cssRules){
                var rules = cssRules[j].cssRules;
                for (var k = 0; k < rules.length; k++) {
                    if (rules[k] && rules[k].style){
                        rule = rules[k];

                        for (prop in rule.style) {
                            if (rule.style.hasOwnProperty(prop) && self.removeStyles.indexOf(prop) >= 0) {
                                rule.style.removeProperty(prop);
                            }
                        }

                        this.localStyles.push(rule);
                    }
                }
            } else {
                // top-level rules
                rule = cssRules[j];

                for (prop in rule.style) {
                    if (rule.style.hasOwnProperty(prop) && self.removeStyles.indexOf(prop) >= 0) {
                        rule.style.removeProperty(prop);
                    }
                }

                this.localStyles.push(rule);

            }
        }
    }
};
HostedStyleGenerator.prototype.disableStylesheets = function() {
    var stylesheets = document.styleSheets;

    for (var i = 0; i < stylesheets.length; i++) {
        stylesheets[i].disabled = true;
    }
};


HostedStyleGenerator.prototype.addCustomStylesheet = function() {
    var style = document.createElement("style");
    style.appendChild(document.createTextNode("")); // WebKit hack :(
    document.head.appendChild(style);
    return style.sheet;
};

HostedStyleGenerator.prototype.reapplyStyles = function() {
    var stylesheet = this.addCustomStylesheet();

    this.localStyles.forEach(function(rule) {
        if(rule) {
            try {
                stylesheet.insertRule(rule.cssText, 0);
            } catch(e) {
                console.log("Error inserting rule: ", e);
            }
        }
    });
};

HostedStyleGenerator.prototype.addCustomStyles = function() {
    document.body.style.fontSize = "16px";
    document.body.style.lineHeight = "2em";
};


// StyleGenerator child object for sites which do not their own CSS
var ExternalStyleGenerator = function(){
    StyleGenerator.call(this);

    this.localStyles = [];
    this.keepStyles = [
        'backgroundSize',
        'border',
        'borderBottom',
        'borderCollapse',
        'borderLeft',
        'borderRadius',
        'borderRight',
        'borderSpacing',
        'borderStyle',
        'borderTop',
        'borderWidth',
        'bottom',
        'boxShadow',
        'boxSizing',
        'clear',
        'content',
        'cursor',
        'display',
        'emptyCells',
        'flex',
        'float',
        'height',
        'left',
        'listStyle',
        'margin',
        'marginBottom',
        'marginLeft',
        'marginRight',
        'marginTop',
        'maxHeight',
        'maxWidth',
        'maxZoom',
        'minHeight',
        'minWidth',
        'minZoom',
        'opacity',
        'overflow',
        'overflowX',
        'overflowY',
        'padding',
        'paddingBottom',
        'paddingLeft',
        'paddingRight',
        'paddingTop',
        'page',
        'position',
        'right',
        'size',
        'tableLayout',
        'textAlign',
        'textIndent',
        'top',
        'transition',
        'verticalAlign',
        'visibility',
        'width',
        'zIndex',
        'zoom'
    ];
};

ExternalStyleGenerator.prototype = Object.create(StyleGenerator.prototype);
ExternalStyleGenerator.prototype.constructor = ExternalStyleGenerator;

ExternalStyleGenerator.prototype.saveStyles = function() {
    var els = document.getElementsByTagName('*');

    for (var i = 0; i < els.length; i++) {
        var rule = window.getComputedStyle(els[i]);

        if (rule.cssText) {
            for (var prop in rule) {
                if (rule.hasOwnProperty(prop) && this.keepStyles.indexOf(prop) >= 0){
                    this.localStyles.push({
                        el: els[i],
                        prop: prop,
                        style: rule[prop]
                    });
                }
            }
        }
    }
};

ExternalStyleGenerator.prototype.disableStylesheets = function() {
    var stylesheets = document.styleSheets;

    for (var i = 0; i < stylesheets.length; i++) {
        stylesheets[i].disabled = true;
    }
};

ExternalStyleGenerator.prototype.reapplyStyles = function() {
    this.localStyles.forEach(function(rule) {
        rule.el.style[rule.prop] = rule.style;
    });
};

ExternalStyleGenerator.prototype.addCustomStyles = function() {
    var headings = ["H1", "H2", "H3", "H4", "H5", "H6"];
    var a = document.getElementsByTagName('a');

    // give anchors inside headings full width (instead of computed width)
    for (var i = 0; i < a.length; i++) {
        var anchor = a[i];
        if (headings.indexOf(anchor.parentNode.nodeName) >= 0) {
            anchor.style.display = "block";
            anchor.style.width = '100%';
        }
    }
};


// We will assume that even one locally hosted stylesheet is sufficient
(function() {
    var generator, hosted = false;
    var domain = window.location.host;
    var stylesheets = document.styleSheets;

    for (var i = 0; i < stylesheets.length; i++) {
        if (stylesheets[i].href && stylesheets[i].href.indexOf(domain) >= 0){
            hosted = true;
            break;
        }
    }

    if (hosted) {
        generator = new HostedStyleGenerator();
    } else {
        generator = new ExternalStyleGenerator();
    }

    generator.generateStyles();

})();