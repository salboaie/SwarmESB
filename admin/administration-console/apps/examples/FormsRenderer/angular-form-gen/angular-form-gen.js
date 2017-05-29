/*!
 angular-form-gen v0.1.0-beta.7
 (c) 2015 (null) McNull https://github.com/McNull/angular-form-gen
 License: MIT
 */
(function(angular) {

    var fg = angular.module('fg', ['dq']);

    /**
     * Constructor for form-gen Field types.
     * @param {string} type         Indicates the type of field
     * @param {object} properties   [optional] Initial property values
     */
    fg.constant('FgField', function FgField(type, properties) {
            this.name = this.type = type;

            if (properties) {
                angular.extend(this, properties);
            }

            this.displayName = this.displayName || this.type.charAt(0).toUpperCase() + this.type.substring(1);
        }
    );

    fg.config(["$provide", function ($provide) {

        $provide.provider('fgConfig', function () {

            var config = {
                enableDebugInfo: true,
                validation: {
                    messages: {},
                    patterns: {}
                },
                fields: {
                    templates: [],
                    categories: {},
                    renderInfo: {}
                }
            };

            var templates = config.fields.templates;

            function indexOfTemplate(type) {
                var idx = templates.length;

                while (idx--) {
                    if (templates[idx].type === type) {
                        break;
                    }
                }

                return idx;
            }

            return {
                debug: function (value) {
                    config.enableDebugInfo = value;
                },
                fields: {
                    add: function (objectTemplate, categories, templateUrl, propertiesTemplateUrl) {

                        if (!objectTemplate || !objectTemplate.type || !categories || !categories.length) {
                            throw new Error('Need a valid objectTemplate and at least one category');
                        }

                        var idx = indexOfTemplate(objectTemplate.type);

                        if (idx !== -1) {
                            templates[idx] = objectTemplate;
                        } else {
                            templates.push(objectTemplate);
                        }

                        this.category(objectTemplate.type, categories);
                        this.renderInfo(objectTemplate.type, templateUrl, propertiesTemplateUrl);
                    },
                    remove: function (type) {
                        var idx = indexOfTemplate(type);

                        if (idx !== -1) {
                            templates.splice(idx, 1);
                        }

                        this.category(type);
                        this.renderInfo(type);
                    },
                    get: function(type) {
                        var i = templates.length;
                        while(i--) {
                            var t = templates[i];
                            if(t.type === type) {
                                return t;
                            }
                        }
                    },
                    renderInfo: function (fieldType, templateUrl, propertiesTemplateUrl) {
                        config.fields.renderInfo[fieldType] = {
                            templateUrl: templateUrl,
                            propertiesTemplateUrl: propertiesTemplateUrl
                        };
                    },
                    category: function (fieldType, categories) {
                        if (!angular.isArray(categories)) {
                            categories = [categories];
                        }

                        angular.forEach(config.fields.categories, function (category) {
                            delete category[fieldType];
                        });

                        angular.forEach(categories, function (category) {
                            if (config.fields.categories[category] === undefined) {
                                config.fields.categories[category] = {};
                            }

                            config.fields.categories[category][fieldType] = true;
                        });
                    }
                },
                validation: {
                    message: function (typeOrObject, message) {

                        var messages = config.validation.messages;

                        if (angular.isString(typeOrObject)) {

                            if (!message) {
                                throw new Error('No message specified for ' + typeOrObject);
                            }

                            messages[typeOrObject] = message;
                        } else {
                            angular.extend(messages, typeOrObject);
                        }
                    },
                    pattern: function (nameOrObject, pattern) {

                        if (angular.isString(nameOrObject)) {
                            config.validation.patterns[nameOrObject] = pattern;
                        } else {
                            angular.extend(config.validation.patterns, nameOrObject);
                        }
                    }
                },
                $get: function () {
                    return config;
                }
            };
        });

    }]);

    fg.config(["fgConfigProvider", "FgField", function (fgConfigProvider, FgField) {

        // - - - - - - - - - - - - - - - - - - - - - -
        // Messages
        // - - - - - - - - - - - - - - - - - - - - - -

        fgConfigProvider.validation.message({
            required: 'A value is required for this field.',
            minlength: 'The value does not match the minimum length{{ field.schema && (" of " + field.schema.validation.minlength + " characters" || "")}}.',
            maxlength: 'The value exceeds the maximum length{{ field.schema && (" of " + field.schema.validation.maxlength + " characters" || "")}}.',
            pattern: 'The value "{{ field.state.$viewValue }}" does not match the required format.',
            email: 'The value "{{ field.state.$viewValue }}" is not a valid email address.',
            unique: 'The value "{{ field.state.$viewValue }}" is already in use.',
            number: 'The value "{{ field.state.$viewValue }}" is not a number.',
            min: 'The value {{ field.schema && ("should be at least " + field.schema.validation.min) || field.state.$viewValue + " is too low" }}',
            max: 'The value {{ field.schema && ("should be less than " + field.schema.validation.max) || field.state.$viewValue + " is too high" }}',
            minoptions: 'At least {{ field.schema.validation.minoptions }} option(s) should be selected.',
            maxoptions: 'No more than {{ field.schema.validation.maxoptions }} option(s) should be selected.'
        });

        // - - - - - - - - - - - - - - - - - - - - - -
        // Fields
        // - - - - - - - - - - - - - - - - - - - - - -

        var categories = {
            'Text input fields': [
                new FgField('text', {
                    displayName: 'Textbox'
                }),
                new FgField('email'),
                new FgField('number', {
                    validation: { maxlength: 15 /* to prevent > Number.MAX_VALUE */ }
                }),
                new FgField('password'),
                new FgField('textarea')
            ],
            'Checkbox fields': [
                new FgField('checkbox', { nolabel: true }),
                new FgField('checkboxlist', {
                    displayName: 'Checkbox List',
                    options: [
                        {
                            value: '1',
                            text: 'Option 1'
                        },
                        {
                            value: '2',
                            text: 'Option 2'
                        },
                        {
                            value: '3',
                            text: 'Option 3'
                        }
                    ],
                    value: {
                        '1': true,
                        '2': true
                    }
                })
            ],
            'Select input fields': [
                new FgField('radiobuttonlist', {
                    displayName: 'Radiobutton List',
                    options: [
                        {
                            value: '1',
                            text: 'Option 1'
                        },
                        {
                            value: '2',
                            text: 'Option 2'
                        },
                        {
                            value: '3',
                            text: 'Option 3'
                        }
                    ],
                    value: '1'
                }),
                new FgField('selectlist', {
                    displayName: 'Select List',
                    options: [
                        {
                            value: '',
                            text: 'Select an option'
                        },
                        {
                            value: '1',
                            text: 'Option 1'
                        },
                        {
                            value: '2',
                            text: 'Option 2'
                        },
                        {
                            value: '3',
                            text: 'Option 3'
                        }
                    ],
                    value: ''
                }) // ,
                // new FgField('dropdownlist', {
                //   options: [{
                //     value: '1',
                //     text: 'Option 1'
                //   }, {
                //     value: '2',
                //     text: 'Option 2'
                //   }, {
                //     value: '3',
                //     text: 'Option 3'
                //   }],
                //   value: '1'
                // })
            ]
        };


        angular.forEach(categories, function (fields, category) {
            angular.forEach(fields, function (field) {
                fgConfigProvider.fields.add(field, category /*, templateUrl, propertiesTemplateUrl */);
            });
        });

        // - - - - - - - - - - - - - - - - - - - - - -
        // Patterns
        // - - - - - - - - - - - - - - - - - - - - - -

        fgConfigProvider.validation.pattern({
            'None': undefined,
            'Url': '^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$',
            'Domain': '^([a-z][a-z0-9\\-]+(\\.|\\-*\\.))+[a-z]{2,6}$',
            'IPv4 Address': '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
            'Email Address': '^([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})$',
            'Integer': '^-{0,1}\\d+$',
            'Positive Integers': '^\\d+$',
            'Negative Integers': '^-\\d+$',
            'Number': '^-{0,1}\\d*\\.{0,1}\\d+$',
            'Positive Number': '^\\d*\\.{0,1}\\d+$',
            'Negative Number': '^-\\d*\\.{0,1}\\d+$',
            'Year (1920-2099)': '^(19|20)[\\d]{2,2}$',
            'Password': '(?=.*\\d)(?=.*[!@#$%^&*\\-=()|?.\"\';:]+)(?![.\\n])(?=.*[A-Z])(?=.*[a-z]).*$'
        });
    }]);

// ATTENTION!
// DO NOT MODIFY THIS FILE BECAUSE IT WAS GENERATED AUTOMATICALLY
// SO ALL YOUR CHANGES WILL BE LOST THE NEXT TIME THE FILE IS GENERATED
    angular.module('fg').run(['$templateCache', function($templateCache){
        $templateCache.put('angular-form-gen/edit/edit.ng.html', '<div class=\"fg-edit row form-group\" ng-form=\"$fg\"><div class=\"col-sm-8\"><div fg-form=\"\" fg-edit-canvas=\"\" fg-no-render=\"true\"></div></div><div class=\"col-sm-4\" ng-form=\"$palette\" fg-null-form=\"\"><div fg-form=\"\" fg-edit-palette=\"\" fg-no-render=\"true\"></div></div></div>');
        $templateCache.put('angular-form-gen/validation/summary.ng.html', '<ul class=\"fg-validation-summary help-block unstyled\" ng-if=\"field.state.$invalid && field.state.$dirty\"><li ng-repeat=\"(key, error) in field.state.$error\" ng-if=\"error\" fg-bind-expression=\"messages[key]\"></li></ul>');
        $templateCache.put('angular-form-gen/common/jsonify/jsonify.ng.html', '<div class=\"jsonify\"><div class=\"btn-toolbar btn-toolbar-right\"><button class=\"btn btn-default btn-xs\" type=\"button\" title=\"Copy the json data.\" ng-click=\"copy()\"><span class=\"glyphicon glyphicon-transfer\"></span></button> <button class=\"btn btn-default btn-xs\" type=\"button\" title=\"Display hidden properties.\" ng-click=\"displayHidden = !displayHidden\" ng-class=\"{ \'active\': displayHidden }\"><span class=\"glyphicon glyphicon-eye-open\"></span></button></div><pre><code>{{ jsonify | j$on:displayHidden }}</code></pre></div>');
        $templateCache.put('angular-form-gen/common/tabs/tabs-pane.ng.html', '<div class=\"fg-tabs-pane\" ng-show=\"tabs.active === pane\"><div ng-if=\"tabs.active === pane || pane.renderAlways\" ng-transclude=\"\"></div></div>');
        $templateCache.put('angular-form-gen/common/tabs/tabs.ng.html', '<div class=\"fg-tabs tabbable\"><ul class=\"nav nav-tabs\"><li ng-repeat=\"tab in tabs.items\" ng-class=\"{ active: tab === tabs.active, disabled: tab.disabled }\"><a href=\"\" ng-click=\"tabs.activate(tab)\">{{ tab.title }}</a></li></ul><div class=\"tab-content\" ng-transclude=\"\"></div></div>');
        $templateCache.put('angular-form-gen/edit/canvas/canvas.ng.html', '<div class=\"fg-edit-canvas\" ng-class=\"{ \'fg-edit-canvas-dragging\': dragging }\"><fieldset><legend>Canvas</legend><div class=\"fg-edit-canvas-area\" dq-drag-area=\"fg-edit-canvas\" dq-drag-enter=\"canvasCtrl.dragEnter()\" dq-drag-leave=\"canvasCtrl.dragLeave()\" dq-drop=\"canvasCtrl.drop()\"><div ng-if=\"!(schema.fields.length)\"><div ng-if=\"!dragPlaceholder.visible\" class=\"fg-edit-canvas-area-empty alert alert-info text-center\"><p class=\"fg-edit-canvas-area-empty-x\">X</p><p class=\"lead hidden-phone\"><strong>Drag</strong> one of the available <strong>templates</strong> from the <strong>palette</strong> onto this <strong>canvas</strong>.</p></div></div><div ng-repeat=\"field in schema.fields\"><div ng-class=\"{ \'fg-drag-placeholder-visible\' : dragPlaceholder.visible && dragPlaceholder.index === $index }\" class=\"fg-drag-placeholder\"></div><div fg-edit-canvas-field=\"\"></div></div><div ng-class=\"{ \'fg-drag-placeholder-visible\': dragPlaceholder.visible && dragPlaceholder.index == schema.fields.length }\" class=\"fg-drag-placeholder\"></div></div></fieldset></div>');
        $templateCache.put('angular-form-gen/edit/palette/palette.ng.html', '<div class=\"fg-edit-palette\"><fieldset><div fg-edit-palette-categories=\"\" data-category=\"selectedCategory\"></div><div ng-repeat=\"template in templates | filter:templateFilter\" class=\"fg-field\" dq-draggable=\"fg-edit-canvas\" dq-drag-begin=\"{ source: \'palette\', field: template }\"><div class=\"fg-field-overlay\"><div class=\"btn-toolbar btn-toolbar-right\"><button class=\"btn btn-default btn-xs btn-primary\" type=\"button\" ng-click=\"schemaCtrl.addField(template)\" title=\"Add this field.\"><span class=\"glyphicon glyphicon-plus\"></span></button></div></div><div fg-field=\"template\" fg-tab-index=\"-1\" fg-no-validation-summary=\"true\" fg-edit-mode=\"true\"></div></div></fieldset></div>');
        $templateCache.put('angular-form-gen/field-templates/default/checkbox.ng.html', '<div class=\"checkbox\"><label title=\"{{ field.schema.tooltip }}\"><input fg-field-input=\"\" id=\"{{ field.$_id }}\" type=\"checkbox\" tabindex=\"{{ tabIndex }}\" ng-model=\"form.data[field.schema.name]\"> <span ng-if=\"field.schema.nolabel\">{{ field.schema.displayName }}</span></label></div>');
        $templateCache.put('angular-form-gen/field-templates/default/checkboxlist.ng.html', '<div fg-checkboxlist=\"\" fg-field-input=\"\" ng-model=\"form.data[field.schema.name]\" name=\"{{ field.schema.name }}\"><div class=\"checkbox\" ng-repeat=\"option in field.schema.options\"><label title=\"{{ field.schema.tooltip }}\"><input type=\"checkbox\" tabindex=\"{{ tabIndex }}\" value=\"{{ option.value }}\" ng-model=\"form.data[field.schema.name][option.value]\"> <span>{{option.text || option.value}}</span></label></div></div>');
        $templateCache.put('angular-form-gen/field-templates/default/dropdownlist.ng.html', '<div fg-field-input=\"\" fg-dropdown-input=\"field.schema.options\" title=\"{{ field.schema.tooltip }}\" id=\"{{ field.$_id }}\" ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.validation.required\" tabindex=\"{{ tabIndex }}\" placeholder=\"{{ field.schema.placeholder }}\" ng-minlength=\"{{ field.schema.validation.minlength }}\" ng-maxlength=\"{{ field.schema.validation.maxlength }}\" ng-pattern=\"/{{ field.schema.validation.pattern }}/\"></div>');
        $templateCache.put('angular-form-gen/field-templates/default/email.ng.html', '<input class=\"form-control\" fg-field-input=\"\" type=\"email\" id=\"{{ field.$_id }}\" title=\"{{ field.schema.tooltip }}\" tabindex=\"{{ tabIndex }}\" placeholder=\"{{ field.schema.placeholder }}\" ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.validation.required\" ng-minlength=\"{{ field.schema.validation.minlength }}\" ng-maxlength=\"{{ field.schema.validation.maxlength }}\" ng-pattern=\"/{{ field.schema.validation.pattern }}/\">');
        $templateCache.put('angular-form-gen/field-templates/default/not-in-cache.ng.html', '<div class=\"fg-field-not-in-cache alert alert-error\"><p>No template registered in cache for field type \"{{ field.type }}\".</p></div>');
        $templateCache.put('angular-form-gen/field-templates/default/number.ng.html', '<input class=\"form-control\" fg-field-input=\"\" fg-input-number=\"\" type=\"text\" id=\"{{ field.$_id }}\" title=\"{{ field.schema.tooltip }}\" tabindex=\"{{ tabIndex }}\" placeholder=\"{{ field.schema.placeholder }}\" min=\"{{ field.schema.validation.min }}\" max=\"{{ field.schema.validation.max }}\" ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.validation.required\" ng-minlength=\"{{ field.schema.validation.minlength }}\" ng-maxlength=\"{{ field.schema.validation.maxlength }}\" ng-pattern=\"/{{ field.schema.validation.pattern }}/\">');
        $templateCache.put('angular-form-gen/field-templates/default/password.ng.html', '<input class=\"form-control\" fg-field-input=\"\" type=\"password\" id=\"{{ field.$_id }}\" title=\"{{ field.schema.tooltip }}\" tabindex=\"{{ tabIndex }}\" placeholder=\"{{ field.schema.placeholder }}\" ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.validation.required\" ng-minlength=\"{{ field.schema.validation.minlength }}\" ng-maxlength=\"{{ field.schema.validation.maxlength }}\" ng-pattern=\"/{{ field.schema.validation.pattern }}/\">');
        $templateCache.put('angular-form-gen/field-templates/default/radiobuttonlist.ng.html', '<div class=\"radio\" ng-repeat=\"option in field.schema.options\"><label title=\"{{ field.schema.tooltip }}\"><input fg-field-input=\"\" type=\"radio\" name=\"{{ field.schema.name }}[]\" tabindex=\"{{ tabIndex }}\" value=\"{{ option.value }}\" ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.validation.required\"> <span>{{option.text || option.value}}</span></label></div>');
        $templateCache.put('angular-form-gen/field-templates/default/selectlist.ng.html', '<select class=\"form-control\" fg-selectlist=\"\" fg-field-input=\"\" id=\"{{ field.$_id }}\" title=\"{{ field.schema.tooltip }}\" ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.validation.required\" tabindex=\"{{ tabIndex }}\"><option ng-repeat=\"option in field.schema.options\" value=\"{{ option.value }}\" ng-selected=\"form.data[field.schema.name] === option.value\">{{ option.text || option.value }}</option></select>');
        $templateCache.put('angular-form-gen/field-templates/default/text.ng.html', '<input class=\"form-control\" fg-field-input=\"\" type=\"text\" id=\"{{ field.$_id }}\" title=\"{{ field.schema.tooltip }}\" tabindex=\"{{ tabIndex }}\" placeholder=\"{{ field.schema.placeholder }}\" ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.validation.required\" ng-minlength=\"{{ field.schema.validation.minlength }}\" ng-maxlength=\"{{ field.schema.validation.maxlength }}\" ng-pattern=\"/{{ field.schema.validation.pattern }}/\">');
        $templateCache.put('angular-form-gen/field-templates/default/textarea.ng.html', '<textarea class=\"form-control\" fg-field-input=\"\" fg-placeholder=\"field.schema.placeholder\" ng-model=\"form.data[field.schema.name]\" id=\"{{ field.$_id }}\" title=\"{{ field.schema.tooltip }}\" tabindex=\"{{ tabIndex }}\" ng-required=\"field.schema.validation.required\" ng-minlength=\"{{ field.schema.validation.minlength }}\" ng-maxlength=\"{{ field.schema.validation.maxlength }}\" ng-pattern=\"/{{ field.schema.validation.pattern }}/\">\n' +
            '</textarea>');
        $templateCache.put('angular-form-gen/field-templates/properties/checkbox.ng.html', '<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{ fieldname: true, displayname: true, tooltip: true }\"></div><div fg-property-field=\"fieldValue\"><div class=\"checkbox\"><label title=\"Set the initial value of this field.\"><input type=\"checkbox\" name=\"fieldValue\" ng-model=\"field.value\"> Initial value</label></div></div></div>');
        $templateCache.put('angular-form-gen/field-templates/properties/checkboxlist.ng.html', '<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{ fieldname: true, displayname: true, tooltip: true }\"></div></div><div fg-tabs-pane=\"Options\"><div fg-property-field-options=\"multiple\"></div></div><div fg-tabs-pane=\"Validation\"><div fg-property-field-validation=\"{ required: true }\"></div><div class=\"fg-property-field-validation\"><div fg-property-field=\"minoptions\" fg-property-field-label=\"Minimum options\"><input type=\"text\" fg-field-redraw=\"\" fg-input-number=\"\" title=\"The minimum number of options that should be selected.\" name=\"minoptions\" ng-model=\"field.validation.minoptions\" class=\"form-control\"></div><div ng-if=\"field.validation.minoptions >= 1\"><div fg-edit-validation-message=\"minoptions\"></div></div></div><div class=\"fg-property-field-validation\"><div fg-property-field=\"maxoptions\" fg-property-field-label=\"Maximum options\"><input type=\"text\" fg-field-redraw=\"\" fg-input-number=\"\" title=\"The maximum number of options that can be selected.\" name=\"maxoptions\" ng-model=\"field.validation.maxoptions\" class=\"form-control\"></div><div ng-if=\"field.validation.maxoptions >= 1\"><div fg-edit-validation-message=\"maxoptions\"></div></div></div></div>');
        $templateCache.put('angular-form-gen/field-templates/properties/dropdownlist.ng.html', '<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{ fieldname: true, displayname: true, placeholder: true, tooltip: true }\"></div><div fg-property-field-value=\"\"><div fg-field-input=\"\" fg-dropdown-input=\"field.options\" ng-model=\"field.value\" ng-minlength=\"{{ field.schema.validation.minlength }}\" ng-maxlength=\"{{ field.schema.validation.maxlength }}\" ng-pattern=\"/{{ field.schema.validation.pattern }}/\"></div></div></div><div fg-tabs-pane=\"Validation\"><div fg-property-field-validation=\"{ required: true, minlength: true, maxlength: true, pattern: true }\"></div></div>');
        $templateCache.put('angular-form-gen/field-templates/properties/email.ng.html', '<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{ fieldname: true, displayname: true, placeholder: true, tooltip: true }\"></div><div fg-property-field-value=\"\"><input type=\"email\" class=\"form-control\" name=\"fieldValue\" ng-model=\"field.value\" ng-minlength=\"{{ field.validation.minlength }}\" ng-maxlength=\"{{ field.validation.maxlength }}\" ng-pattern=\"/{{ field.validation.pattern }}/\"></div></div><div fg-tabs-pane=\"Validation\"><div fg-property-field-validation=\"{ required: true, minlength: true, maxlength: true, pattern: true }\"></div></div>');
        $templateCache.put('angular-form-gen/field-templates/properties/number.ng.html', '<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{ fieldname: true, displayname: true, placeholder: true, tooltip: true }\"></div><div fg-property-field-value=\"\"><input fg-input-number=\"\" class=\"form-control\" type=\"text\" name=\"fieldValue\" ng-model=\"field.value\" min=\"{{ field.validation.min }}\" max=\"{{ field.validation.max }}\" ng-minlength=\"{{ field.validation.minlength }}\" ng-maxlength=\"{{ field.validation.maxlength }}\" ng-pattern=\"/{{ field.validation.pattern }}/\"></div></div><div fg-tabs-pane=\"Validation\"><div class=\"fg-property-field-validation\"><div fg-property-field=\"min\" fg-property-field-label=\"Minimum value\"><input fg-input-number=\"\" fg-field-redraw=\"\" class=\"form-control\" type=\"text\" name=\"min\" title=\"The minimum value that should be entered\" ng-model=\"field.validation.min\"></div><div ng-if=\"field.validation.min >= 0\"><div fg-edit-validation-message=\"min\"></div></div></div><div class=\"fg-property-field-validation\"><div fg-property-field=\"max\" fg-property-field-label=\"Maximum value\"><input fg-input-number=\"\" fg-field-redraw=\"\" class=\"form-control\" type=\"text\" name=\"max\" title=\"The maximum value that should be entered\" ng-model=\"field.validation.max\"></div><div ng-if=\"field.validation.max >= 0\"><div fg-edit-validation-message=\"max\"></div></div></div><div fg-property-field-validation=\"{ required: true, minlength: true, maxlength: true, pattern: true }\"></div></div>');
        $templateCache.put('angular-form-gen/field-templates/properties/password.ng.html', '<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{ fieldname: true, displayname: true, placeholder: true, tooltip: true }\"></div><div fg-property-field-value=\"\"><input fg-input-number=\"\" class=\"form-control\" type=\"password\" name=\"fieldValue\" ng-model=\"field.value\" ng-minlength=\"{{ field.validation.minlength }}\" ng-maxlength=\"{{ field.validation.maxlength }}\" ng-pattern=\"/{{ field.validation.pattern }}/\"></div></div><div fg-tabs-pane=\"Validation\"><div fg-property-field-validation=\"{ required: true, minlength: true, maxlength: true, pattern: true }\"></div></div>');
        $templateCache.put('angular-form-gen/field-templates/properties/radiobuttonlist.ng.html', '<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{ fieldname: true, displayname: true, tooltip: true }\"></div></div><div fg-tabs-pane=\"Options\"><div fg-property-field-options=\"\"></div></div><div fg-tabs-pane=\"Validation\"><div fg-property-field-validation=\"{ required: true }\"></div></div>');
        $templateCache.put('angular-form-gen/field-templates/properties/selectlist.ng.html', '<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{ fieldname: true, displayname: true, tooltip: true }\"></div></div><div fg-tabs-pane=\"Options\"><div fg-property-field-options=\"\"></div></div><div fg-tabs-pane=\"Validation\"><div fg-property-field-validation=\"{ required: true }\"></div></div>');
        $templateCache.put('angular-form-gen/field-templates/properties/text.ng.html', '<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{ fieldname: true, displayname: true, placeholder: true, tooltip: true }\"></div><div fg-property-field-value=\"\"><input type=\"text\" class=\"form-control\" name=\"fieldValue\" ng-model=\"field.value\" ng-minlength=\"{{ field.validation.minlength }}\" ng-maxlength=\"{{ field.validation.maxlength }}\" ng-pattern=\"/{{ field.validation.pattern }}/\"></div></div><div fg-tabs-pane=\"Validation\"><div fg-property-field-validation=\"{ required: true, minlength: true, maxlength: true, pattern: true }\"></div></div>');
        $templateCache.put('angular-form-gen/field-templates/properties/textarea.ng.html', '<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{ fieldname: true, displayname: true, placeholder: true, tooltip: true }\"></div><div fg-property-field-value=\"\"><textarea name=\"fieldValue\" class=\"form-control\" ng-model=\"field.value\" ng-minlength=\"{{ field.validation.minlength }}\" ng-maxlength=\"{{ field.validation.maxlength }}\" ng-pattern=\"/{{ field.validation.pattern }}/\">\n' +
            '    </textarea></div></div><div fg-tabs-pane=\"Validation\"><div fg-property-field-validation=\"{ required: true, minlength: true, maxlength: true, pattern: true }\"></div></div>');
        $templateCache.put('angular-form-gen/form/field/field.ng.html', '<div class=\"fg-field-inner form-group\" ng-class=\"{ \'fg-field-required\': fieldSchema.validation.required, \'has-error\': form.state[field.name].$invalid }\"><label ng-if=\"!field.schema.nolabel\" class=\"col-sm-3 control-label\" for=\"{{ field.$_id }}\">{{ fieldSchema.displayName }}</label><div class=\"col-sm-9\" ng-class=\"{ \'col-sm-offset-3\': field.schema.nolabel }\"><div ng-include=\"renderInfo.templateUrl\"></div><div fg-validation-summary=\"\" fg-validation-messages=\"fieldSchema.validation.messages\" ng-if=\"!noValidationSummary\"></div></div></div>');
        $templateCache.put('angular-form-gen/form/form-fields/form-fields.ng.html', '<div class=\"fg-form-fields\"><fieldset><div ng-repeat=\"field in form.schema.fields\"><div fg-field=\"field\"></div></div></fieldset></div>');
        $templateCache.put('angular-form-gen/edit/canvas/field/field.ng.html', '<div class=\"fg-field fg-field-{{ field.type }} fg-edit-canvas-field\" ng-class=\"{ \'error\': field.$_invalid, \'dragging\': field.$_isDragging }\" dq-draggable=\"fg-edit-canvas\" dq-drag-disabled=\"dragEnabled === false\" dq-drag-begin=\"canvasCtrl.dragBeginCanvasField($index, field)\" dq-drag-end=\"canvasCtrl.dragEndCanvasField(field)\"><div class=\"fg-field-overlay\" ng-mouseenter=\"dragEnabled = true\" ng-mouseleave=\"dragEnabled = false\"><div class=\"fg-field-overlay-drag-top\" dq-drag-enter=\"dragPlaceholder.index = $index\"></div><div class=\"fg-field-overlay-drag-bottom\" dq-drag-enter=\"dragPlaceholder.index = ($index + 1)\"></div><div class=\"btn-toolbar btn-toolbar-right\"><button class=\"btn btn-default btn-xs\" type=\"button\" ng-disabled=\"field.$_displayProperties && field.$_invalid\" ng-class=\"{ \'active\': field.$_displayProperties }\" ng-click=\"toggleProperties(field)\" title=\"Configure this field.\"><span class=\"glyphicon glyphicon-wrench\"></span></button> <button class=\"btn btn-default btn-xs\" type=\"button\" ng-click=\"schemaCtrl.swapFields($index - 1, $index)\" ng-disabled=\"$index === 0\" title=\"Move up\"><span class=\"glyphicon glyphicon-arrow-up\"></span></button> <button class=\"btn btn-default btn-xs\" type=\"button\" ng-click=\"schemaCtrl.swapFields($index, $index + 1)\" ng-disabled=\"$index === schema.fields.length - 1\" title=\"Move down\"><span class=\"glyphicon glyphicon-arrow-down\"></span></button> <button class=\"btn btn-default btn-xs btn-danger\" type=\"button\" ng-click=\"schemaCtrl.removeField($index)\" title=\"Remove\"><span class=\"glyphicon glyphicon-trash\"></span></button></div></div><div ng-form=\"\" fg-null-form=\"\"><div fg-field=\"field\" fg-tab-index=\"-1\" fg-edit-mode=\"true\" fg-no-validation-summary=\"true\"></div></div><div class=\"fg-field-properties-container\" ng-class=\"{ visible: field.$_displayProperties }\"><div fg-edit-canvas-field-properties=\"field\" ng-if=\"expanded\"></div></div></div>');
        $templateCache.put('angular-form-gen/edit/palette/categories/categories.ng.html', '<legend ng-click=\"paletteCategoriesMenuOpen = !paletteCategoriesMenuOpen\" ng-class=\"{ \'open\': paletteCategoriesMenuOpen }\">Palette <span class=\"fg-legend-extra fg-edit-palette-categories visible-xs-inline visible-md-inline visible-lg-inline\">- {{ categoryName || \'All field types\' }}</span> <i class=\"caret\"></i><ul class=\"dropdown-menu\"><li ng-repeat=\"(name, category) in categories\" ng-class=\"{ \'active\': categoryName === name }\"><a ng-click=\"setCategory(name, category)\">{{ name }}</a></li><li class=\"divider\"></li><li ng-class=\"{ \'active\': !category }\"><a ng-click=\"setCategory(null)\">All field types</a></li></ul></legend>');
        $templateCache.put('angular-form-gen/edit/canvas/field/properties/properties.ng.html', '<div class=\"fg-field-properties\"><div novalidate=\"\" ng-form=\"fieldPropertiesForm\"><div fg-tabs=\"property.tabs\"><div ng-include=\"renderInfo.propertiesTemplateUrl\"></div><div fg-tabs-pane=\"Debug\" order=\"1000\" auto-active=\"false\"><div data-jsonify=\"field\"></div></div></div></div></div>');
        $templateCache.put('angular-form-gen/edit/canvas/field/properties/options/options.ng.html', '<div ng-if=\"!field.options || field.options.length === 0\" ng-click=\"optionsCtrl.addOption()\" class=\"alert alert-info\"><h2>No options defined</h2><p class=\"lead\">Click here to add a new option definition to this field.</p></div><table ng-if=\"field.options.length > 0\" class=\"table-field-options\"><thead><tr><th></th><th>Value</th><th>Text</th><th><a href=\"\" class=\"btn btn-default btn-xs\" ng-click=\"optionsCtrl.addOption()\" title=\"Add a new option to the list\"><i class=\"glyphicon glyphicon-plus\"></i></a></th><th class=\"table-field-options-padding\"></th></tr></thead><tbody><tr ng-form=\"fieldOptionForm\" ng-repeat=\"option in field.options\" ng-class=\"{ \'error\': fieldOptionForm.$invalid }\"><td ng-if=\"multiple === false\"><input type=\"radio\" name=\"{{ field.name }}selection[]\" value=\"{{ option.value }}\" ng-model=\"field.value\" ng-click=\"optionsCtrl.toggleOption(option.value)\"></td><td ng-if=\"multiple === true\"><input type=\"checkbox\" name=\"{{ field.name }}selection[]\" value=\"{{ option.value }}\" ng-model=\"field.value[option.value]\"></td><td><input type=\"text\" name=\"optionValue\" ng-model=\"option.value\" class=\"form-control\" ng-required=\"field.type != \'selectlist\'\"></td><td><input type=\"text\" ng-model=\"option.text\" class=\"form-control\"></td><td><a href=\"\" class=\"btn btn-default btn-xs\" ng-click=\"optionsCtrl.removeOption($index)\" title=\"Remove this option from the list\"><i class=\"glyphicon glyphicon-trash\"></i></a></td><td></td></tr></tbody></table>');
        $templateCache.put('angular-form-gen/edit/canvas/field/properties/property-field/common.ng.html', '<div ng-if=\"fields.fieldname\"><div fg-property-field=\"fieldName\" fg-property-field-label=\"Name\"><input type=\"text\" class=\"form-control\" name=\"fieldName\" ng-model=\"field.name\" ng-required=\"true\" ng-pattern=\"/^[a-zA-Z]([\\w]+)?$/\" fg-unique-field-name=\"\"></div></div><div ng-if=\"fields.displayname\"><div fg-property-field=\"displayName\" fg-property-field-label=\"Display name\"><input type=\"text\" class=\"form-control\" name=\"displayName\" ng-model=\"field.displayName\"></div></div><div ng-if=\"fields.placeholder\"><div fg-property-field=\"fieldPlaceholder\" fg-property-field-label=\"Placeholder text\"><input type=\"text\" class=\"form-control\" name=\"fieldPlaceholder\" ng-model=\"field.placeholder\"></div></div><div ng-if=\"fields.tooltip\"><div fg-property-field=\"fieldTooltip\" fg-property-field-label=\"Tooltip\"><input type=\"text\" class=\"form-control\" name=\"fieldTooltip\" ng-model=\"field.tooltip\"></div></div>');
        $templateCache.put('angular-form-gen/edit/canvas/field/properties/property-field/field-value.ng.html', '<div ng-if=\"draw\"><div fg-property-field=\"fieldValue\" fg-property-field-label=\"Initial value\"><div ng-transclude=\"\"></div></div></div>');
        $templateCache.put('angular-form-gen/edit/canvas/field/properties/property-field/property-field.ng.html', '<div class=\"form-group fg-property-field\" ng-class=\"{ \'has-error\': fieldPropertiesForm[fieldName].$invalid }\"><label class=\"col-sm-5 col-md-4 control-label\">{{ fieldLabel }}</label><div class=\"col-sm-7 col-md-8\"><div ng-transclude=\"\"></div><div fg-validation-summary=\"{{ fieldName }}\"></div></div></div>');
        $templateCache.put('angular-form-gen/edit/canvas/field/properties/validation/validation-message.ng.html', '<div ng-form=\"valMsgForm\"><div fg-property-field=\"message\" fg-property-field-label=\"Message\"><input type=\"text\" name=\"message\" title=\"{{ tooltip }}\" placeholder=\"Optional message\" ng-model=\"field.validation.messages[validationType]\" class=\"form-control\"></div></div>');
        $templateCache.put('angular-form-gen/edit/canvas/field/properties/validation/validation.ng.html', '<div ng-if=\"fields.minlength\" class=\"fg-property-field-validation\"><div fg-property-field=\"minlength\" fg-property-field-label=\"Minimum length\"><input type=\"text\" fg-field-redraw=\"\" fg-input-number=\"\" title=\"The minimum length of characters that should be entered.\" name=\"minlength\" ng-model=\"field.validation.minlength\" class=\"form-control\"></div><div ng-if=\"field.validation.minlength >= 1\"><div fg-edit-validation-message=\"minlength\"></div></div></div><div ng-if=\"fields.maxlength\" class=\"fg-property-field-validation\"><div fg-property-field=\"maxlength\" fg-property-field-label=\"Maximum length\"><input type=\"text\" fg-field-redraw=\"\" fg-input-number=\"\" title=\"The maximum length of characters that should be entered.\" name=\"maxlength\" ng-model=\"field.validation.maxlength\" class=\"form-control\"></div><div ng-if=\"field.validation.maxlength >= 1\"><div fg-edit-validation-message=\"maxlength\"></div></div></div><div ng-if=\"fields.pattern\" class=\"fg-property-field-validation\"><div fg-property-field=\"pattern\" fg-property-field-label=\"Pattern\"><div fg-dropdown-input=\"patternOptions\" name=\"pattern\" title=\"The pattern that should match with the input value.\" fg-parse-pattern=\"\" fg-field-redraw=\"\" ng-model=\"field.validation.pattern\"></div></div><div ng-if=\"field.validation.pattern.length > 0\"><div fg-edit-validation-message=\"pattern\"></div></div></div><div ng-if=\"fields.required\" class=\"fg-property-field-validation\"><div fg-property-field=\"required\"><div class=\"checkbox\"><label title=\"Indicates if a value is required for this field.\"><input type=\"checkbox\" ng-model=\"field.validation.required\">Required</label></div></div><div ng-if=\"field.validation.required\"><div fg-edit-validation-message=\"required\"></div></div></div>');
    }]);
    fg.directive('fgBindExpression', ["$interpolate", function ($interpolate) {

        function buildWatchExpression(interpolateFn) {
            var sb = [];
            var parts = interpolateFn.parts;
            var ii = parts.length;

            while (ii--) {
                var part = parts[ii];

                if (part.exp && !part.exp.match(/^\s*$/)) {
                    sb.push(part.exp);
                }
            }

            return '[' + sb.join() + ']';
        }

        return function (scope, element, attr) {

            var interpolateFn, watchHandle, oldWatchExpr;

            function cleanWatchHandle() {
                if (watchHandle) watchHandle();
                watchHandle = undefined;
            }

            function interpolateExpression() {
                element.text(interpolateFn(scope));
            }

            scope.$on('$destroy', function () {
                cleanWatchHandle();
            });

            scope.$watch(attr.fgBindExpression, function (value) {
                if (value !== undefined) {
                    interpolateFn = $interpolate(value);

                    element.addClass('ng-binding').data('$binding', interpolateFn);

                    var watchExpr = buildWatchExpression(interpolateFn);

                    if (oldWatchExpr !== watchExpr) {

                        oldWatchExpr = watchExpr;

                        cleanWatchHandle();

                        watchHandle = scope.$watchCollection(watchExpr, function () {
                            interpolateExpression();
                        });
                    } else {
                        interpolateExpression();
                    }
                }
            });
        };
    }]);

    fg.directive('fgDropdownInput', ["$compile", "$document", "$timeout", "$parse", "fgUtils", function ($compile, $document, $timeout, $parse, fgUtils) {

        function createInput($scope, $element, $attrs) {

            var template = '<div class="fg-dropdown-input input-group">' +
                '<input type="text" class="form-control"/>' +
                '<span class="input-group-btn">' +
                '<button class="btn btn-default" type="button" ng-click="dropdownToggle()">' +
                '<span class="caret"></span>' +
                '</button>' +
                '</span>' +
                '</div>';

            var $template = angular.element(template);
            var $input = $template.find('input');

            // Copy the original attributes to the input element

            var attributes = $element.prop("attributes");

            angular.forEach(attributes, function (a) {
                if (a.name !== 'fg-dropdown-input' && a.name !== 'class') {
                    $input.attr(a.name, a.value);
                }
            });

            var $button = $template.find('button');
            var closeTimeout;

            $scope.dropdownToggle = function () {
//      $button[0].focus(); // force focus for chrome
                $scope.dropdownVisible = !$scope.dropdownVisible;
            };

//    $button.on('blur', function () {
//      closeTimeout = $timeout(function () {
//        $scope.dropdownVisible = false;
//      }, 100);
//    });

            $scope.$on('$destroy', function () {
                if (closeTimeout) $timeout.cancel(closeTimeout);
                closeTimeout = undefined;
            });

            return $template;
        }

        function createDropdown($scope, $element, $attrs, ngModelCtrl, $input) {

            var modelGetter = $parse($attrs.ngModel);
            var modelSetter = modelGetter.assign;

            var template = '<div class="fg-dropdown" ng-class="{ \'open\': dropdownVisible }">' +
                '<ul ng-if="items && items.length" class="dropdown-menu">' +
                '<li ng-repeat="item in items" ng-class="{ active: item.value === getModelValue() }">' +
                '<a href="" ng-click="setModelValue(item.value)">{{ item.text || item.value }}</a>' +
                '</li>' +
                '</ul>' +
                '</div>';

            var $template = angular.element(template);

            $scope.setModelValue = function (value) {

                $scope.dropdownVisible = false;

                // Convert to a string

                var viewValue = value || '';

                var idx = ngModelCtrl.$formatters.length;

                while (idx--) {
                    var fn = ngModelCtrl.$formatters[idx];
                    var viewValue = fn(viewValue);

                    if (viewValue === undefined) {
                        break;
                    }
                }


                // Parse the viewValue

                idx = ngModelCtrl.$parsers.length;
                var pv = viewValue;

                while (idx--) {
                    var fn = ngModelCtrl.$parsers[idx];
                    pv = fn(pv);

                    if (pv === undefined) {
                        break;
                    }
                }

                if (pv === undefined) {
                    // Failed to parse.
                    // Set the formatted string in the input, which will retrigger the parsing and display the correct error message.

                    ngModelCtrl.$setViewValue(viewValue);
                    ngModelCtrl.$render();

                } else {
                    modelSetter($scope, value);
                }
            };

            $scope.getModelValue = function () {
                return modelGetter($scope);
            };

            var input = $input[0];

            $scope.$watch('dropdownVisible', function (value) {
                if (value) {

                    var rect = input.getBoundingClientRect();
                    var scroll = fgUtils.getScrollOffset();

                    $template.css({
                        left: (scroll.x + rect.left) + 'px',
                        top: (scroll.y + rect.top + input.clientHeight) + 'px',
                        width: input.clientWidth + 'px'
                    });
                }
            });

            $scope.$watchCollection($attrs.fgDropdownInput, function (value) {
                $scope.items = value;
            });

            $scope.$on('$destroy', function () {
                $template.remove();
            });

            return $template;
        }

        return {
            priority: 1000,
            restrict: 'A',
            terminal: true,
            scope: true,
            compile: function (tElement, tAttrs) {

                return function link($scope, $element, $attrs, ctrls) {

                    var $input = createInput($scope, $element, $attrs);

                    $element.append($input);
                    $compile($input)($scope);

                    var $inputText = $input.find('input');
                    var ngModelCtrl = $inputText.controller('ngModel');

                    ////////////////////////////////////////

                    var $dropdown = createDropdown($scope, $element, $attrs, ngModelCtrl, $input);
                    var dropdownCompileFn = $compile($dropdown);

                    var $body = $document.find('body');

                    $body.append($dropdown);

                    dropdownCompileFn($scope);

                    ////////////////////////////////////////
                };
            }
        };
    }]);

    /**
     * Created by null on 16/10/14.
     */
    fg.directive('fgNullForm', function () {

        var nullFormCtrl = {
            $addControl: angular.noop,
            $removeControl: angular.noop,
            $setValidity: angular.noop,
            $setDirty: angular.noop,
            $setPristine: angular.noop
        };

        return {
            restrict: 'A',
            require: ['form'],
            link: function link($scope, $element, $attrs, $ctrls) {

                var form = $ctrls[0];

                // Locate the parent form

                var parentForm = $element.parent().inheritedData('$formController');

                if(parentForm) {

                    // Unregister this form controller

                    parentForm.$removeControl(form);
                }

                // Nullify the form

                angular.extend(form, nullFormCtrl);
            }
        };
    });

    fg.directive('fgFormRequiredFilter', function() {

        return {
            restrict: 'A',
            require: ['form'],
            link: function($scope, $element, $attrs, $ctrls) {

                var form = $ctrls[0];

                var $setValidity = form.$setValidity;

                form.$setValidity = function (validationToken, isValid, control) {

                    if(validationToken === 'required') {
                        isValid = true;
                    }

                    $setValidity.call(form, validationToken, isValid, control);
                };
            }
        };

    });
    fg.directive('fgInputNumber', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attr, ctrl) {

                ctrl.$parsers.push(function(inputValue) {
                    // this next if is necessary for when using ng-required on your input. 
                    // In such cases, when a letter is typed first, this parser will be called
                    // again, and the 2nd time, the value will be undefined
                    if (inputValue == undefined) {
                        return '';
                    }

                    var transformedInput = inputValue.replace(/[^0-9]/g, '');

                    var value = parseInt(transformedInput);
                    value === NaN ? undefined : value;

                    if (transformedInput != inputValue) {
                        ctrl.$setViewValue(transformedInput);
                        ctrl.$render();
                    }

                    return value;

                });

                ctrl.$parsers.push(function(value) {
                    var empty = ctrl.$isEmpty(value);
                    if (empty || /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/.test(value)) {
                        ctrl.$setValidity('number', true);
                        return value === '' ? null : (empty ? value : parseFloat(value));
                    } else {
                        ctrl.$setValidity('number', false);
                        return undefined;
                    }
                });

                ctrl.$formatters.push(function(value) {
                    return ctrl.$isEmpty(value) ? undefined : value;
                });

                if (attr.min) {
                    var minValidator = function(value) {
                        var min = parseFloat(attr.min);
                        if (!ctrl.$isEmpty(value) && value < min) {
                            ctrl.$setValidity('min', false);
                            return undefined;
                        } else {
                            ctrl.$setValidity('min', true);
                            return value;
                        }
                    };

                    ctrl.$parsers.push(minValidator);
                    ctrl.$formatters.push(minValidator);
                }

                if (attr.max) {
                    var maxValidator = function(value) {
                        var max = parseFloat(attr.max);
                        if (!ctrl.$isEmpty(value) && value > max) {
                            ctrl.$setValidity('max', false);
                            return undefined;
                        } else {
                            ctrl.$setValidity('max', true);
                            return value;
                        }
                    };

                    ctrl.$parsers.push(maxValidator);
                    ctrl.$formatters.push(maxValidator);
                }

                ctrl.$formatters.push(function(value) {

                    if (ctrl.$isEmpty(value) || angular.isNumber(value)) {
                        ctrl.$setValidity('number', true);
                        return value;
                    } else {
                        ctrl.$setValidity('number', false);
                        return undefined;
                    }
                });
            }
        };
    });

    fg.directive('fgPlaceholder', function() {
        /*
         This attribute is only required on TEXTAREA elements. 
         Angular in combination with IE doesn't like placeholder="{{ myExpression }}".
         */
        return {
            link: function($scope, $element, $attrs) {
                $scope.$watch($attrs.fgPlaceholder, function(value) {
                    $element.attr('placeholder', value);
                });
            }
        };
    });
    fg.factory('fgUtils', ["$templateCache", "$window", "fgConfig", function ($templateCache, $window, fgConfig) {

        var uniqueCounter = (+new Date) % 10000;

        return {
            getScrollOffset: function() {

                // the pageYOffset property of the window object is supported in all browsers except 
                // in Internet Explorer before version 9, and always returns the scroll amount regardless of the doctype

                // the scrollY property of the window object is supported by Firefox, Google Chrome and Safari, and always
                // returns the scroll amount regardless of the doctype

                // if a doctype is specified in the document, the scrollTop property of the html element returns the scroll
                // amount in Internet Explorer, Firefox and Opera, but always returns zero in Google Chrome and Safari

                // if no doctype is specified in the document, the scrollTop property of the html element always returns zero

                // if no doctype is specified in the document, the scrollTop property of the body element returns the 
                // scroll amount in Internet Explorer, Firefox, Opera, Google Chrome and Safari.

                var offset = {};

                if($window.pageYOffset !== undefined) {
                    offset.x = $window.pageXOffset;
                    offset.y = $window.pageYOffset;
                } else {
                    var de = $window.document.documentElement;
                    offset.x = de.scrollLeft;
                    offset.y = de.scrollTop;
                }

                return offset;
            },
            defaultArea: 'default',
            getRenderInfo: function(field) {
                //var renderInfo = fg.Field[field.type];
                var renderInfo = fgConfig.fields.renderInfo[field.type];

                if(!renderInfo) {
                    renderInfo = {};
                    // fg.Field[field.type] = renderInfo;
                    fgConfig.fields.renderInfo[field.type] = renderInfo;
                }

                if(!renderInfo.templateUrl) {
                    renderInfo.templateUrl = this.getTemplateUrl(field);
                }

                if(!renderInfo.propertiesTemplateUrl) {
                    renderInfo.propertiesTemplateUrl = this.getTemplateUrl(field, 'properties');
                }

                return renderInfo;
            },
            formatTemplateUrl: function (type, area) {
                return 'angular-form-gen/field-templates/' + (area || this.defaultArea) + '/' + type + '.ng.html';
            },
            getTemplateUrl: function (field, area) {

                area = area || this.defaultArea;

                // IE8 fix: Aliases removed
                // var templateType = fgConfig.fields.aliases[field.type] || field.type;
                var templateType = field.type;
                var templateUrl = this.formatTemplateUrl(templateType, area);

                var cached = $templateCache.get(templateUrl);

                if (!cached) {

                    // Url is not in cache -- fallback to default area.
                    // Properties area will never fallback to default area.

                    if (area !== 'properties' && area !== this.defaultArea) {
                        templateUrl = this.getTemplateUrl(field, this.defaultArea);
                    } else {
                        return this.formatTemplateUrl('not-in-cache');
                    }
                }

                return templateUrl;
            },
            getUnique: function() {
                return ++uniqueCounter;
            },
            copyField: function(field) {
                var copy = angular.copy(field);
                copy.name = 'field' + this.getUnique();
                return copy;
            },
            findElementsByClass: function (root, className, recursive, buffer) {
                buffer = buffer || [];

                if (root.className === className) {
                    buffer.push(root);
                }

                if (root.hasChildNodes()) {
                    for (var i = 0; i < root.children.length; i++) {
                        var child = root.children[i];
                        if (child.className === className) {
                            buffer.push(child);
                        }
                        if (recursive) {
                            this.findElementsByClass(child, className, recursive, buffer);
                        }
                    }
                }

                return buffer;
            }
        };
    }]);
    angular.module('dq', []).factory('dqUtils', ["$window", "$rootScope", function($window, $rootScope) {

        var _dragData = null;

        //noinspection FunctionWithInconsistentReturnsJS
        return {
            getEvent: function (e) {
                return e && e.originalEvent ? e.originalEvent : e || $window.event;
            },
            stopEvent: function (e) {
                // e.cancelBubble is supported by IE8 -
                // this will kill the bubbling process.
                e.cancelBubble = true;
                e.bubbles = false;

                // e.stopPropagation works in modern browsers
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();

                return false;
            },
            dragData: function (data) {
                if (data === undefined) {
                    return _dragData;
                }
                _dragData = data;
            },
            getParentArea: function ($scope) {
                var area = {};
                $scope.$emit('dqLocateArea', area);
                return area.name;
            },
            isAreaMatch: function ($scope) {
                var parentArea = this.getParentArea($scope);
                var eventArea = _dragData ? _dragData.area : "";

                return parentArea === eventArea;
            }
        };
    }]);
    angular.module('dq').directive('dqDragArea', ["dqUtils", function (dqUtils) {

        function evalBroadcastEvent($scope, args, areaName, expression) {
            if (expression && args && args.area === areaName) {
                $scope.$eval(expression);
            }
        }

        return {
            restrict: 'AEC',
            link: function ($scope, $element, $attrs) {

                var areaName = $attrs.dqDragArea || $attrs.dqDragAreaName || "";

                $scope.$on('dqDragBegin', function ($event, args) {
                    evalBroadcastEvent($scope, args, areaName, $attrs.dqDragProgressBegin);
                });

                $scope.$on('dqDragEnd', function ($event, args) {
                    evalBroadcastEvent($scope, args, areaName, $attrs.dqDragProgressEnd);
                });

                $scope.$on('dqLocateArea', function($event, args) {
                    args.name = areaName;
                    $event.stopPropagation();
                });
            }
        }
    }]);

    angular.module('dq').directive('dqDragEnter',["dqDragTrack", function (dqDragTrack) {
        return {
            link: dqDragTrack
        };
    }]).directive('dqDragLeave',["dqDragTrack", function (dqDragTrack) {
        return {
            link: dqDragTrack
        };
    }]).directive('dqDragOver',["dqDragTrack", function (dqDragTrack) {
        return {
            link: dqDragTrack
        };
    }]).directive('dqDrop',["dqDragTrack", function (dqDragTrack) {
        return {
            link: dqDragTrack
        };
    }]).factory('dqDragTrack', ["dqUtils", "$document", function (dqUtils, $document) {

        // Combines both nq-drag-enter & nq-drag-leave & nq-drag-over

        return function ($scope, $element, $attrs) {

            // Tracking already set on the element?

            if ($element.data('dqDragTrack') !== true) {

                var trackingEnabled = false; // Toggled on drag-begin if the area name does not match the target
                var inbound = false; // Toggle to indicate if the dragging is in or outbound element
                var element = $element[0];
                var dropEffect = 'none'; // Drop effect used in the dragover event
                var doingLeaveDoubleCheck = false; // Toggle that indicates the body has a dragover event to do.

                var $body = $document.find('body');

                function dragLeaveDoubleCheck($e) {
                    var e = dqUtils.getEvent($e);

                    // Check if the drag over element is a child of the this element

                    var target = e.target || $e.target;

                    if (target !== element) {

                        // TODO: we're not really checking if the target element is visually within the $element.

                        if (!element.contains(target)) {

                            // Drag over element is out of bounds

                            dragLeaveForSure(true);
                        }
                    }

                    // We're done with the expensive body call

                    $body.off('dragover', dragLeaveDoubleCheck);

                    // Notify the local element event callback there's no event listener on the body and the next event
                    // can safely be cancelled.

                    doingLeaveDoubleCheck = false;

                    e.dataTransfer.dropEffect = dropEffect;

                    // Always cancel the dragover -- otherwise the dropEffect is not used.

                    return dqUtils.stopEvent($e);
                }

                function dragLeaveForSure(apply) {
                    inbound = false;
                    var expression = $attrs.dqDragLeave;
                    if (expression) {
                        if (apply) {
                            $scope.$apply(function () {
                                $scope.$eval(expression);
                            });
                        } else {
                            $scope.$eval(expression);
                        }
                    }
                }

                $scope.$on('$destroy', function () {
                    // Just to be sure
                    $body.off('dragover', dragLeaveDoubleCheck);
                });

                $scope.$on('dqDragBegin', function () {
                    // Check if we should track drag movements
                    trackingEnabled = dqUtils.isAreaMatch($scope);
                });

                $scope.$on('dqDragEnd', function () {
                    if (trackingEnabled) {
                        // Gief cake
                        dragLeaveForSure(false);
                    }
                });

                $element.on('dragenter', function (e) {
                    if (trackingEnabled && inbound === false) {
                        inbound = true;
                        var expression = $attrs.dqDragEnter;
                        if (expression) {
                            $scope.$apply(function () {
                                $scope.$eval(expression);
                            });
                        }
                    }
                });

                $element.on('dragleave', function () {
                    if (trackingEnabled && inbound === true) {

                        // dragleave is a lie -- hovering child elements will cause this event to trigger also.
                        // We fake the cake by tracking the drag ourself.

                        // Notify the "real" dragover event that he has to play nice with the body and not to
                        // cancel the event chain.

                        doingLeaveDoubleCheck = true;
                        $body.on('dragover', dragLeaveDoubleCheck);
                    }
                });

                //noinspection FunctionWithInconsistentReturnsJS
                $element.on('dragover', function ($e) {

                    if (trackingEnabled) {

                        var e = dqUtils.getEvent($e);

                        var expression = $attrs.dqDragOver;
                        var result;

                        if (expression) {
                            $scope.$apply(function () {
                                result = $scope.$eval(expression);
                            });
                        }

                        // The evaluated expression can indicate to cancel the drop

                        dropEffect = result === false ? 'none' : 'copy';

                        if (!doingLeaveDoubleCheck) {

                            // There's no dragover queued on the body.
                            // The event needs to be terminated here else the dropEffect will
                            // not be applied (and dropping is not allowed).

                            e.dataTransfer.dropEffect = dropEffect;
                            return dqUtils.stopEvent($e);
                        }
                    }
                });

                //noinspection FunctionWithInconsistentReturnsJS
                $element.on('drop', function($e) {

                    var e = dqUtils.getEvent($e);

                    if(trackingEnabled) {
                        var expression = $attrs.dqDrop;

                        if(expression) {
                            $scope.$apply(expression);
                        }
                    }

                    return dqUtils.stopEvent($e);
                });

                // Ensure that we only do all this magic stuff on this element for one time only.

                $element.data('dqDragTrack', true);
            }
        };

    }]);

    angular.module('dq').directive('dqDraggable', ["dqUtils", "$rootScope", function (dqUtils, $rootScope) {

        function evalAndBroadcast(eventName, targetArea, $scope, expression, cb) {
            $scope.$apply(function () {
                var data = $scope.$eval(expression);

                var bcData = {
                    area: targetArea,
                    data: data
                };

                cb(bcData);

                $rootScope.$broadcast(eventName, bcData);
            });
        }

        return {
            restrict: 'AEC',
            link: function ($scope, $element, $attrs) {

                var targetArea = $attrs.dqDraggable || $attrs.dqDragTargetArea || "";
                var disabled = false;

                $scope.$watch($attrs.dqDragDisabled, function(value) {
                    disabled = value;
                    $element.attr('draggable', disabled ? 'false' : 'true');
                });

                $element.on('selectstart',function (e) {

                    // Pure IE evilness

                    if (!disabled && this.dragDrop) {
                        this.dragDrop();
                        e = dqUtils.getEvent(e);
                        return dqUtils.stopEvent(e);
                    }
                }).on('dragstart',function (e) {

                    e = dqUtils.getEvent(e);

                    if(disabled) {
                        return dqUtils.stopEvent(e);
                    }

                    var dt = e.dataTransfer;
                    dt.effectAllowed = 'all';
                    dt.setData('Text', 'The cake is a lie!');

                    evalAndBroadcast('dqDragBegin', targetArea, $scope, $attrs.dqDragBegin, function(dragData) {
                        dqUtils.dragData(dragData);
                    });

                }).on('dragend', function () {

                    evalAndBroadcast('dqDragEnd', targetArea, $scope, $attrs.dqDragEnd, function() {
                        dqUtils.dragData(null);
                    });

                });
            }
        };

    }]);
    fg.controller('fgEditController', ["$scope", "fgUtils", "$location", function ($scope, fgUtils, $location) {

//  var self = this;

//  $scope.preview = $location.search().preview;
//
//  this.setMetaForm = function(metaForm) {
//    self.metaForm = metaForm;
//  };

//  this.togglePreview = function() {
//    $scope.preview = !$scope.preview;
//  };

//  $scope.$watch(function () {
//
//    var schema = $scope.schemaCtrl.model();
//
//    // Seems that this watch is sometimes fired after the scope has been destroyed(?)
//
//    if (schema) {
////      schema.$_invalid = self.metaForm ? self.metaForm.$invalid : false;
////
////      if (!schema.$_invalid) {
//
//      var fields = schema.fields;
//
//      if (fields) {
//
//        var i = fields.length;
//
//        while (--i >= 0 && !schema.$_invalid) {
//          schema.$_invalid = fields[i].$_invalid;
//        }
//      }
//    }
//
//  });

    }]);
    fg.directive('fgEdit', function () {
        return {
            priority: 100,
            require: 'fgSchema',
            restrict: 'AE',
            scope: {
                // // The schema model to edit
                schema: '=?fgSchema'
//      // Boolean indicating wether to show the default form action buttons
//      actionsEnabled: '=?fgActionsEnabled',
//      // Callback function when the user presses save -- any argument named 'schema' is set to the schema model.
//      onSave: '&fgOnSave',
//      // Callback function when the user presses cancel -- any argument named 'schema' is set to the schema model.
//      onCancel: '&fgOnCancel',
//      // Boolean indicating wether the edit is in preview mode or not
//      preview: '=?fgPreview'
            },
            replace: true,
            controller: 'fgEditController as editCtrl',
            templateUrl: 'angular-form-gen/edit/edit.ng.html',
            link: function ($scope, $element, $attrs, schemaCtrl) {

                if ($scope.schema === undefined) {
                    $scope.schema = {};
                }

//      if ($scope.actionsEnabled === undefined) {
//        $scope.actionsEnabled = true;
//      }
//
//      if ($scope.preview === undefined) {
//        $scope.preview = false;
//      }

                schemaCtrl.model($scope.schema);
                $scope.schemaCtrl = schemaCtrl;
            }
        }
    });
    fg.controller('fgFormController', ["$scope", "$parse", function($scope, $parse) {

        this.model = {};
        var self = this;

        this.init = function(dataExpression, schema, state, editMode) {
            // Called by the directive

            self.editMode = editMode;

            var dataGetter = $parse(dataExpression);
            var dataSetter = dataGetter.assign;

            $scope.$watch(dataGetter, function(value) {
                if(value === undefined) {
                    value = {};

                    if(dataSetter) {
                        dataSetter($scope, value);
                    }
                }

                self.model.data = value;
            });

            $scope.$watch(function() {
                return schema.model();
            }, function(value) {
                if(value === undefined) {
                    schema.model({});
                } else {
                    self.model.schema = value;
                }
            });

            self.model.state = state;


            return self.model;
        };

//  this.clearFocusOnFields = function() {
//    angular.forEach(self.model.schema.fields, function(field) {
//      field.focus = false;
//    });
//  };

    }]);

    fg.directive('fgForm', ["fgFormCompileFn", function(fgFormCompileFn) {
        return {
            restrict: 'AE',
            require: ['^?form', 'fgForm', '^fgSchema'],
            controller: 'fgFormController',
            scope: true,
            compile: fgFormCompileFn
        };
    }]).factory('fgFormLinkFn', function() {
        return function link($scope, $element, $attrs, ctrls) {

            var ngFormCtrl = ctrls[0];
            var formCtrl = ctrls[1];
            var schemaCtrl = ctrls[2];

            var editMode = $attrs.fgNoRender === 'true';

            formCtrl.init($attrs.fgFormData, schemaCtrl, ngFormCtrl, editMode);

        };
    }).factory('fgFormCompileFn', ["fgFormLinkFn", function(fgFormLinkFn) {
        return function($element, $attrs) {

            $element.addClass('fg-form');

            var noRender = $attrs.fgNoRender;

            if (noRender !== 'true') {
                var renderTemplate = '<div fg-form-fields></div>';
                $element.append(renderTemplate);
            }

            return fgFormLinkFn;
        };
    }]);


    fg.directive('fgValidationSummary', ["fgValidationSummaryLinkFn", function(fgValidationSummaryLinkFn) {

        return {
            require: ['^?fgField', '^?form'],
            templateUrl: 'angular-form-gen/validation/summary.ng.html',
            scope: {
                fieldName: '@?fgValidationSummary',
                validationMessages: '=?fgValidationMessages'
            },
            link: fgValidationSummaryLinkFn
        };
    }]).factory('fgValidationSummaryLinkFn', ["fgConfig", function(fgConfig) {

        return function($scope, $element, $attrs, ctrls) {

            var fgFieldCtrl = ctrls[0];
            var ngFormController = ctrls[1];

            if (fgFieldCtrl) {
                // Grab the whole field state from the field controller
                $scope.field = fgFieldCtrl.field();
                $scope.form = fgFieldCtrl.form();

            } else if (ngFormController) {

                $scope.form = {
                    state: ngFormController
                };

                $scope.$watch('fieldName', function(value) {
                    $scope.field = {
                        name: value,
                        state: ngFormController[value]
                    };
                });
            }

            // Whenever the form designer edits a custom message but decides to delete it later a "" is leftover.
            // I don't feel like setting all kinds of watchers so we'll fix that here

            if($scope.validationMessages) {
                angular.forEach($scope.validationMessages, function(value, key) {
                    if(!value) {
                        delete $scope.validationMessages[key];
                    }
                });
            }

            $scope.messages = angular.extend({}, fgConfig.validation.messages, $scope.validationMessages);
        };

    }]);
    fg.directive('fgUniqueFieldName', function () {

        var changeTick = 0;

        function validate(ngModelCtrl, schemaCtrl, field) {

            var schema = schemaCtrl.model();
            var valid = true;
            var schemaField;

            if(schema) {

                var fields = schema.fields;

                for (var i = 0; i < fields.length; i++) {
                    schemaField = fields[i];
                    if (schemaField !== field && field.name === schemaField.name) {
                        valid = false;
                        break;
                    }
                }
            }

            ngModelCtrl.$setValidity('unique', valid);
        }

        return {
            priority: 100,
            require: ['ngModel', '^fgSchema'],
            link: function ($scope, $element, $attrs, ctrls) {

                var ngModelCtrl = ctrls[0];
                var schemaCtrl = ctrls[1];

                var field = $scope.field;

                if(!field) {
                    throw Error('No field property on scope');
                }

                $scope.$watch(function() { return ngModelCtrl.$modelValue; }, function () {

                    // Every instance of this directive will increment changeTick
                    // whenever the name of the associated field is modified.

                    ++changeTick;
                });

                $scope.$watch(function() { return changeTick; }, function() {

                    // Every instance of this directive will fire off the validation
                    // whenever the changeTick has been modifed.

                    validate(ngModelCtrl, schemaCtrl, field);
                });
            }
        };
    });

    fg.filter('j$on',function () {
        return function (input, displayHidden) {

            if(displayHidden)
                return JSON.stringify(input || {}, null, '  ');

            return angular.toJson(input || {}, true);
        };
    }).directive('jsonify', ["$window", "$filter", function ($window, $filter) {
        return {
            templateUrl: 'angular-form-gen/common/jsonify/jsonify.ng.html',
            replace: true,
            scope: {
                jsonify: "=",
                displayHidden: "@jsonifyDisplayHidden"
            },
            link: function($scope, $element, $attrs, ctrls) {
                $scope.expression = $attrs.jsonify;

                $scope.copy = function() {
                    $window.prompt ("Copy to clipboard: Ctrl+C, Enter", $filter('j$on')($scope.jsonify, $scope.displayHidden));
                };
            }
        };
    }]);

    fg.controller('fgTabsController', ["$scope", function ($scope) {

        this.items = [];
        this.active = null;
        this.activeIndex = -1;

        this.add = function (item) {
            this.items.push(item);

            this.items.sort(function (x, y) {
                return x.order - y.order;
            });

            if (!$scope.active && item.autoActive != false) {
                this.activate(item);
            }
        };

        this.activate = function (itemOrIndex) {

            var idx = -1, item;

            if (isNaN(itemOrIndex)) {

                // Locate the item index

                item = itemOrIndex;
                var i = this.items.length;

                while (i--) {
                    if (this.items[i] === item) {
                        idx = i;
                        break;
                    }
                }

                if (idx === -1) {
                    throw new Error('Cannot activate pane: not found in pane list.');
                }
            } else {

                // Grab the item at the provided index

                idx = itemOrIndex;

                if(idx < 0 || idx >= this.items.length) {
                    throw new Error('Cannot activate pane: index out of bounds.')
                }

                item = this.items[idx];
            }

            if (!item.disabled) {
                this.active = $scope.active = item;
                this.activeIndex = $scope.activeIndex = idx;
            }

        };

    }]);
    fg.directive('fgTabs', function() {
        return {
            require: ['fgTabs'],
            restrict: 'EA',
            transclude: true,
            controller: 'fgTabsController',
            templateUrl: 'angular-form-gen/common/tabs/tabs.ng.html',
            scope: {
                'tabs': '=?fgTabs',
                'active': '=?fgTabsActive',
                'activeIndex': '=?fgTabsActiveIndex'
            },
            link: function($scope, $element, $attrs, $ctrls) {
                $scope.tabs = $ctrls[0];

                $scope.$watch('activeIndex', function(value) {
                    if(value !== undefined && $scope.tabs.activeIndex !== value) {
                        $scope.tabs.activate(value);
                    }
                });
            }
        };
    });




    fg.directive('fgTabsPane', ["fgTabsPaneLinkFn", function(fgTabsPaneLinkFn) {
        return {
            require: ['^fgTabs'],
            restrict: 'EA',
            transclude: true,
            templateUrl: 'angular-form-gen/common/tabs/tabs-pane.ng.html',
            link: fgTabsPaneLinkFn,
            scope: true
        };
    }]).factory('fgTabsPaneLinkFn', function() {
        return function($scope, $element, $attrs, $ctrls) {

            $scope.tabs = $ctrls[0];

            $scope.pane = {
                title: $attrs.fgTabsPane || $attrs.title,
                order: parseInt($attrs.fgTabsPaneOrder || $attrs.order) || 10,
                autoActive: !($attrs.fgTabsPaneAutoActive === "false" || $attrs.autoActive === "false"),
                renderAlways: $attrs.fgTabsPaneRenderAlways === "true" || $attrs.renderAlways === "true"
            };

            $scope.$watch($attrs.fgTabsPaneDisabled, function(value) {
                $scope.pane.disabled = value;
            });

            $scope.tabs.add($scope.pane);
        };
    });

    fg.controller('fgEditCanvasController', ["$scope", "dqUtils", "$timeout", "fgUtils", function ($scope, dqUtils, $timeout, fgUtils) {

        $scope.dragPlaceholder = {
            visible: false,
            index: 0
        };

        // - - - 8-< - - - - - - - - - - - - - - - - - - - - -
        // Drag & drop
        // - - - 8-< - - - - - - - - - - - - - - - - - - - - -

        $scope.$on('dqDragBegin', function() {
            $scope.dragging = true;
        });

        $scope.$on('dqDragEnd', function() {
            $scope.dragging = false;
        });

        this.dragEnter = function () {
//    $scope.dragging = true;
            $scope.dragPlaceholder.visible = true;
            $scope.dragPlaceholder.index = $scope.schema.fields.length;
        };

        this.dragLeave = function () {
            $scope.dragPlaceholder.visible = false;
        };

        this.dragBeginCanvasField = function (index, field) {

            // Delay is set to prevent browser from copying adjusted html as copy image

            $timeout(function () {
                field.$_isDragging = true;
            }, 1);

            return { source: 'canvas', field: field, index: index };
        };

        this.dragEndCanvasField = function (field) {

            // IE Fix: ensure this is fired after the drag begin

            $timeout(function () {
                field.$_isDragging = false;
//      $scope.dragging = false;
            }, 10);

        };

        this.drop = function () {

            var dragData = dqUtils.dragData();

            if (dragData && dragData.data) {

                var field = dragData.data.field;
                var source = dragData.data.source;
                var index = dragData.data.index;
                var fields = $scope.schema.fields;

                if (source == 'palette') {
                    $scope.schemaCtrl.addField(field, $scope.dragPlaceholder.index);

                } else if (source == 'canvas') {
                    $scope.schemaCtrl.moveField(index, $scope.dragPlaceholder.index);

                    // fields.splice(index, 1);
                    // fields.splice($scope.dragPlaceholder.index, 0, field);
                }

                // IE fix: not calling dragEnd sometimes
                field.$_isDragging = false;
            } else {
                throw Error('Drop without data');
            }
        };

    }]);
    fg.directive('fgEditCanvas', function() {

        return {
            require: ['^fgEdit', '^fgSchema', '^form'],
            templateUrl: 'angular-form-gen/edit/canvas/canvas.ng.html',
            controller: 'fgEditCanvasController as canvasCtrl',
            link: function($scope, $element, $attrs, ctrls) {
                $scope.editCtrl = ctrls[0];
                $scope.schemaCtrl = ctrls[1];
                $scope.formCtrl = ctrls[2];

                var ignoreDirty = true;

                $scope.$watchCollection('schema.fields', function() {

                    // Ignore the first call, $watchCollection fires at once without any changes.

                    if(!ignoreDirty) {
                        $scope.formCtrl.$setDirty(true);
                    }

                    ignoreDirty = false;

                });
            }
        };
    });

    fg.controller('fgEditPaletteController', ["$scope", "fgConfig", function ($scope, fgConfig) {

        $scope.templates = [];

        var tmpls = fgConfig.fields.templates;
        var i = tmpls.length;

        while(i--) {
            var tmpl = tmpls[i];

            if(tmpl.editor && tmpl.editor.visible == false) {
                continue;
            }

            $scope.templates.unshift(angular.copy(tmpl));
        }

        $scope.templateFilter = function (template) {
            return !$scope.selectedCategory || $scope.selectedCategory[template.type];
        };

    }]);
    fg.directive('fgEditPalette',function () {
        return {
            require: ['^fgSchema'],
            templateUrl: 'angular-form-gen/edit/palette/palette.ng.html',
            controller: 'fgEditPaletteController',
            link: function($scope, $element, $attrs, ctrls) {
                $scope.schemaCtrl = ctrls[0];
            }
        };
    });
    fg.directive('fgCheckboxlist', function() {

        function validateRequired(validation, value, options) {

            var required = validation ? validation.required : false;

            // Set in field-templates/default/checkboxlist.ng.html

            if(required) {

                // Ensures that at least one option is checked

                var x = options.length;

                while(x--) {
                    if(value[options[x].value]) {
                        return true;
                    }
                }

                return false;
            }

            return true;

        }

        function selectionCount(value) {
            var c = 0;

            for(var k in value) {
                if(value[k]) {
                    c += 1;
                }
            }

            return c;
        }

        return {
            require: ['^fgField'],
            link: function($scope, $element, $attrs, $ctrls) {

                var field = $ctrls[0].field();

                var formData = $scope.form.data, schema = field.schema;

                $scope.$watchCollection(function() {
                    return formData[schema.name];
                }, function(value, oldValue) {

                    // Ensure that the field is marked as dirty on changes
                    if(!field.state.$dirty && value !== oldValue) {
                        field.state.$setViewValue(value);
                    }

                    if(schema.validation) {
                        var required = validateRequired(schema.validation, value, schema.options);
                        field.state.$setValidity('required', required);

                        var minc = schema.validation.minoptions;
                        var maxc = schema.validation.maxoptions;

                        var min = true, max = true;

                        if(minc || maxc) {
                            var c = selectionCount(value);

                            if(minc) {
                                min = c >= schema.validation.minoptions;
                            }

                            if(maxc) {
                                max = c <= schema.validation.maxoptions;
                            }
                        }

                        field.state.$setValidity('minoptions', min);
                        field.state.$setValidity('maxoptions', max);
                    }
                });
            }
        };
    });

    fg.directive('fgSelectlist', ["$timeout", function($timeout) {

        // Angular adds a '? undefined:undefined ?' option dom element if it cannot find a matching model value in the
        // options list. Somehow this also happens if the value is in the option list. This directive simply removes
        // the invalid option from the dom.

        // https://github.com/angular/angular.js/issues/1019
        // http://stackoverflow.com/questions/12654631/why-does-angularjs-include-an-empty-option-in-select

        return {
            priority: 1000,
            link: function($scope, $element) {

                // Ensure that the ng-repeat has finished by suspending the remove.

                $timeout(function() {

                    var $options = $element.find('option');
                    var i = $options.length;

                    while(--i >= 0) {
                        var $option = angular.element($options[i]);
                        if($option.val() == '? undefined:undefined ?') {
                            $option.remove();
                            break;
                        }
                    }
                }, 0);
            }
        }
    }]);

    fg.controller('fgFieldController', ["$scope", "fgUtils", function($scope, fgUtils) {

        var self = this;
        var _form, _field;

        this.init = function(fgFormCtrl, fieldSchema, editMode) {

            self.initForm(fgFormCtrl);
            self.initField(fieldSchema);
            self.initDefaultData(fieldSchema, editMode);

            $scope.form = _form;
            $scope.field = _field;

        };

        this.initForm = function(fgFormCtrl) {
            _form = fgFormCtrl ? fgFormCtrl.model : {};

            return _form;
        };

        this.initField = function(fieldSchema) {

            _field = {
                $_id: 'id' + fgUtils.getUnique(),
                schema: fieldSchema
            };

            $scope.$watch('field.schema.name', function(value, oldValue) {
                self.registerState(value);
            });

            return _field;
        };

        this.initDefaultData = function(fieldSchema, editMode) {

            var fieldName = fieldSchema.name;

            _form.data = _form.data || {};

            if (editMode) {

                $scope.$watch('field.schema.value', function(value) {
                    _form.data[fieldSchema.name] = value;
                });

                $scope.$watch('field.schema.name', function(value, oldValue) {
                    if(value !== oldValue) {
                        var data = _form.data[oldValue];
                        delete _form.data[oldValue];
                        _form.data[value] = data;
                    }
                });

            } else if (_form.data && _form.data[fieldName] === undefined && fieldSchema.value !== undefined) {
                _form.data[fieldName] = angular.copy(fieldSchema.value);
            }

            return _form.data;
        };

        this.setFieldState = function(state) {
            // Called by the field-input directive
            _field.state = state;
            self.registerState(_field.schema.name);
        };

        this.registerState = function(fieldName) {
            // Re-register the ngModelCtrl with the form controller
            // whenever the name of the field has been modified.

            if (_form.state && _field.state) {
                _form.state.$removeControl(_field.state);
                _field.state.$name = fieldName;
                _form.state.$addControl(_field.state);
            }

            _field.name = fieldName;

        };

        this.field = function() {
            return _field;
        };

        this.form = function() {
            return _form;
        };
    }]);
    fg.directive('fgField', ["fgFieldLinkFn", function(fgFieldLinkFn) {

        return {
            require: ['^?fgForm', 'fgField'],
            replace: true,
            templateUrl: 'angular-form-gen/form/field/field.ng.html',
            scope: {
                fieldSchema: '=fgField', // The schema definition of the field
                tabIndex: '=?fgTabIndex', // Optional tab index -- used in overlay mode to disable focus
                editMode: '=?fgEditMode', // Indicates edit mode, which will sync the fieldSchema.value
                // to the form data for WYSIWYG pleasures.
                noValidationSummary: '=fgNoValidationSummary' // If true hides the validation summary
            },
            controller: 'fgFieldController',
            link: fgFieldLinkFn
        };

    }]).factory('fgFieldLinkFn', ["fgUtils", function(fgUtils) {
        return function($scope, $element, $attrs, ctrls) {

            var fgFormCtrl = ctrls[0];
            var fgFieldCtrl = ctrls[1];

            if ($scope.tabIndex === undefined) {
                $scope.tabIndex = 'auto';
            }

            $scope.renderInfo = fgUtils.getRenderInfo($scope.fieldSchema);

            fgFieldCtrl.init(fgFormCtrl, $scope.fieldSchema, $scope.editMode);
        };
    }]);
//fg.directive('fgFieldFocus', function($parse) {
//  return {
//    require: ['?^fgForm'],
//    link: function($scope, $element, $attrs, ctrls) {
//
//      var formCtrl = ctrls[0];
//
//      // if(formCtrl && formCtrl.editMode) {
//      //   return;
//      // }
//
//      var e = $element[0];
//
//      var getModel = $parse($attrs.fgFieldFocus);
//      var setModel = getModel.assign;
//
//      $scope.$watch(getModel, function(value) {
//
//        if (value) {
//          if(formCtrl) {
//            formCtrl.clearFocusOnFields();
//            setModel($scope, true);
//
//            if(formCtrl.editMode) {
//              return;
//            }
//          }
//
//          e.focus();
//
//        } else if(formCtrl && !formCtrl.editMode) {
//
//          e.blur();
//
//        }
//      });
//
//      // function onBlur() {
//      //   // if(getModel($scope) !== undefined) {
//      //   //   $timeout(function() {
//      //   //     setModel($scope, false);
//      //   //   });
//      //   // }
//      // }
//
//      // function onFocus() {
//      //   $timeout(function() {
//      //     setModel($scope, true);
//      //   });
//      // }
//
//      // $element.on('focus', onFocus);
//      // $element.on('blur', onBlur);
//
//      // $scope.$on('$destroy', function() {
//      //   $element.off('focus', onFocus);
//      //   $element.off('blur', onBlur);
//      // });
//    }
//  };
//});

    fg.directive('fgFieldInput', ["fgFieldInputLinkFn", function(fgFieldInputLinkFn) {
        return {
            require: ['^fgField', 'ngModel'],
            link: fgFieldInputLinkFn
        };
    }]).factory('fgFieldInputLinkFn', function() {
        return function($scope, $element, $attrs, ctrls) {

            var fgFieldCtrl = ctrls[0];
            var ngModelCtrl = ctrls[1];

            fgFieldCtrl.setFieldState(ngModelCtrl);
        };
    });
    fg.directive('fgFormFields', function() {

        return {
            require: ['^?fgForm'],
            restrict: 'AE',
            templateUrl: 'angular-form-gen/form/form-fields/form-fields.ng.html',
            scope: {},
            link: function($scope, $element, $attrs, ctrls) {

                var fgForm = ctrls[0];

                $scope.$watch(function() {
                    return fgForm.model;
                }, function(value) {
                    $scope.form = value;
                });
            }
        };

    });
    fg.controller('fgSchemaController', ["$scope", "fgUtils", function($scope, fgUtils) {

        var _model;

        this.model = function(value) {
            if(value !== undefined) {
                _model = value;

                if(!angular.isArray(value.fields)) {
                    value.fields = [];
                }
            }

            return _model;
        };

        this.addField = function(field, index) {

            var copy = fgUtils.copyField(field);

            index = index === undefined ? _model.fields.length : index;
            _model.fields.splice(index, 0, copy);

        };

        this.removeField = function(index) {
            _model.fields.splice(index, 1);
        };

        this.swapFields = function(idx1, idx2) {
            if (idx1 <= -1 || idx2 <= -1 || idx1 >= _model.fields.length || idx2 >= _model.fields.length) {
                return;
            }

            _model.fields[idx1] = _model.fields.splice(idx2, 1, _model.fields[idx1])[0];
        };

        this.moveField = function(fromIdx, toIdx) {
            if (fromIdx >= 0 && toIdx <= _model.fields.length && fromIdx !== toIdx) {
                var field = _model.fields.splice(fromIdx, 1)[0];
                if (toIdx > fromIdx)--toIdx;
                _model.fields.splice(toIdx, 0, field);
            }
        };

    }]);
    fg.directive('fgSchema', ["fgSchemaLinkFn", function(fgSchemaLinkFn) {

        return {
            require: ['fgSchema'],
            controller: 'fgSchemaController',
            link: fgSchemaLinkFn
        };

    }]).factory('fgSchemaLinkFn' , function() {
        return function($scope, $element, $attrs, ctrls) {
            var schemaCtrl = ctrls[0];

            $scope.$watch($attrs.fgSchema, function(value) {
                schemaCtrl.model(value);
            });

        };
    });


    fg.directive('fgEditCanvasField', ["$timeout", function ($timeout) {

        return {
            templateUrl: 'angular-form-gen/edit/canvas/field/field.ng.html',
            link: function ($scope) {

                // Prevent the property tabs from closing if the field schema is invalid

                $scope.toggleProperties = function (field) {
                    if (field.$_displayProperties) {
                        field.$_displayProperties = field.$_invalid;
                    } else {
                        field.$_displayProperties = true;
                    }
                }

                $scope.$watch('field.$_displayProperties', function (value) {

                    if (value) {
                        $scope.expanded = true;
                    } else {
                        $timeout(function () {
                            $scope.expanded = false;
                        }, 550);

                    }


                });
            }
        };

    }]);
    fg.controller('fgEditPaletteCategoriesController', ["$scope", "fgConfig", function($scope, fgConfig) {

        $scope.categories = fgConfig.fields.categories;

        $scope.setCategory = function(name, category) {
            $scope.categoryName = name;
            $scope.category = category;
        };

        if(!$scope.category) {
            //noinspection LoopStatementThatDoesntLoopJS
            for (var name in $scope.categories) {
                //noinspection JSUnfilteredForInLoop
                $scope.setCategory(name, $scope.categories[name]);
                break;
            }
        }
    }]);
    fg.directive('fgEditPaletteCategories', function () {
        return {
            templateUrl: 'angular-form-gen/edit/palette/categories/categories.ng.html',
            require: '^fgEditPalette',
            scope: {
                category: "=?"
            },
            controller: 'fgEditPaletteCategoriesController'
        };
    });
    fg.directive('fgEditCanvasFieldProperties', ["fgUtils", function (fgUtils) {

        // To keep the form validation working, the contents of the tabs needs to be rendered even if the tab is not active.

        function setRenderAlways(tabItems) {
            var i = tabItems.length;

            while (i--) {
                var tab = tabItems[i];

                // Skip the debug tab

                if(tab.title !== 'Debug') {
                    tab.renderAlways = true;
                }
            }
        }

        return {
            templateUrl: 'angular-form-gen/edit/canvas/field/properties/properties.ng.html',
            scope: {
                field: '=fgEditCanvasFieldProperties'
            },
            link: {
                pre: function ($scope) {
                    $scope.property = {};
                },
                post: function ($scope) {

                    $scope.$watch('fieldPropertiesForm.$invalid', function (newValue) {
                        $scope.field.$_invalid = newValue;
                    });

                    $scope.renderInfo = fgUtils.getRenderInfo($scope.field);


                    $scope.$watch('property.tabs.items.length', function(value) {
                        if(value) {
                            setRenderAlways($scope.property.tabs.items);
                        }
                    });

                }
            }
        };
    }]);

    fg.controller('fgPropertyFieldOptionsController', ["$scope", function($scope) {

        var self = this;
        var optionCounter = 1;

        // Monitor for changes in the options array and ensure a
        // watch for every option value.
        // Watchers are deleted when removing options from the array.

        $scope.$watchCollection('field.options', function(options) {
            if (options) {
                angular.forEach(options, function(option) {
                    if (!option.$_valueWatchFn) {
                        option.$_valueWatchFn = $scope.$watch(function() {
                            return option.value;
                        }, handleValueChange);
                    }
                });
            }
        });

        function handleValueChange(newValue, oldValue) {

            // Called by the watch collection
            // Ensure that when the selected value is changed, this
            // is synced to the field value.

            if (newValue !== oldValue) {
                if ($scope.multiple) {
                    $scope.field.value[newValue] = $scope.field.value[oldValue];
                    delete $scope.field.value[oldValue];
                } else {
                    if (oldValue === $scope.field.value) {
                        $scope.field.value = newValue;
                    }
                }
            }
        }

        this.toggleOption = function(optionValue) {

            // Only used in multiple === false
            // Allow the user to deselect an option from the list

            if($scope.field.type !== 'selectlist' && optionValue === $scope.field.value) {
                $scope.field.value = undefined;
            }

        };

        this.addOption = function() {

            if (!$scope.field.options) {
                $scope.field.options = [];
            }

            var option = {
                value: 'Option ' + optionCounter++
            };

            $scope.field.options.push(option);

            var count = $scope.field.options.length;

            if(!$scope.multiple && count === 1) {
                $scope.field.value = option.value;
            }

        };

        this.removeOption = function(index) {
            var options = $scope.field.options.splice(index, 1);

            if (options && options.length) {

                var option = options[0];

                if ($scope.multiple) {

                    if($scope.field.value[option.value] !== undefined)
                        delete $scope.field.value[option.value];

                } else {

                    if (option.value === $scope.field.value && $scope.field.options.length) {
                        $scope.field.value = $scope.field.options[0].value;
                    }

                    option.$_valueWatchFn();
                }
            }
        };

    }]);
    fg.directive('fgPropertyFieldOptions', ["fgPropertyFieldOptionsLinkFn", function(fgPropertyFieldOptionsLinkFn) {
        return {
            scope: true,
            controller: 'fgPropertyFieldOptionsController as optionsCtrl',
            templateUrl: 'angular-form-gen/edit/canvas/field/properties/options/options.ng.html',
            link: fgPropertyFieldOptionsLinkFn
        };
    }]).factory('fgPropertyFieldOptionsLinkFn', function() {
        return function($scope, $element, $attrs, ctrls) {

            $scope.multiple = false;

            $attrs.$observe('fgPropertyFieldOptions', function(value) {
                if(value === 'multiple') {
                    $scope.multiple = true;
                }
            });
        };
    });
    fg.directive('fgPropertyFieldCommon', ["fgPropertyFieldCommonLinkFn", function(fgPropertyFieldCommonLinkFn) {
        return {
            restrict: 'AE',
            templateUrl: 'angular-form-gen/edit/canvas/field/properties/property-field/common.ng.html',
            link: fgPropertyFieldCommonLinkFn
        };
    }]).factory('fgPropertyFieldCommonLinkFn', function() {
        return function($scope, $element, $attrs, ctrls) {

            $scope.fields = {
                fieldname: false,
                displayname: false,
                placeholder: false,
                tooltip: false,
                focus: false
            };

            $scope.$watch($attrs['fgPropertyFieldCommon'], function(value) {
                $scope.fields = angular.extend($scope.fields, value);
            });
        };
    });
    /*
     The field-value directive will re-render itself when certain validation values are modified.
     This is needed because angular does not watch or observe the values of certain attributes and allows
     an invalid initial value to be saved in the form schema.
     Important: the transcluded form field must be name fieldValue!
     <div fg-property-field-value>
     <input type="text" 
     name="fieldValue" 
     ng-model="field.value" 
     ng-minlength="{{ field.validation.minlength }}"
     ng-maxlength="{{ field.validation.maxlength }}"
     ng-pattern="/{{ field.validation.pattern }}/"/>
     </div>
     The fg-field-redraw directive will trigger, on model change, the field-value to re-render itself.
     */

    fg.directive('fgPropertyFieldValue', ["fgPropertyFieldValueLinkFn", function(fgPropertyFieldValueLinkFn) {

        return {
            require: ['^form'],
            templateUrl: 'angular-form-gen/edit/canvas/field/properties/property-field/field-value.ng.html',
            transclude: true,
            link: fgPropertyFieldValueLinkFn
        };

    }]).factory('fgPropertyFieldValueLinkFn', ["$parse", function($parse) {

        return function($scope, $element, $attrs, ctrls) {

            $scope.draw = true;
            var frmCtrl = ctrls[0];
            var oldViewValue;

            $scope.$watch('field.$_redraw', function(value) {

                if (value) {

                    var ngModelCtrl = frmCtrl['fieldValue'];

                    if(ngModelCtrl) {
                        oldViewValue = ngModelCtrl.$viewValue;
                    }

                    $scope.draw = false;
                    $scope.field.$_redraw = false;
                } else {
                    $scope.draw = true;
                    $element = $element;
                }
            });

            $scope.$watch(function() { return frmCtrl['fieldValue']; }, function(ngModelCtrl) {
                if(ngModelCtrl && oldViewValue) {
                    ngModelCtrl.$setViewValue(oldViewValue);
                    ngModelCtrl.$render();
                    oldViewValue = undefined;
                }
            });
        };
    }]).directive('fgFieldRedraw', function() {
        return {
            require: ['ngModel'],
            link: function($scope, $element, $attrs, ctrls) {

                var oldValue = $scope.$eval($attrs.ngModel);

                $scope.$watch($attrs.ngModel, function(value) {
                    if(value != oldValue) {
                        $scope.field.$_redraw = true;
                        oldValue = value;
                    }
                });
            }
        };
    });

    fg.directive('fgPropertyField', ["fgPropertyFieldLinkFn", function(fgPropertyFieldLinkFn) {

        return {
            restrict: 'AE',
            templateUrl: 'angular-form-gen/edit/canvas/field/properties/property-field/property-field.ng.html',
            transclude: true,
            scope: true,
            link: fgPropertyFieldLinkFn
        };

    }]).factory('fgPropertyFieldLinkFn', function() {
        return function($scope, $element, $attrs, ctrls) {

            $attrs.$observe('fgPropertyField', function(value) {
                $scope.fieldName = value;
            });

            $attrs.$observe('fgPropertyFieldLabel', function(value) {
                if(value) {
                    $scope.fieldLabel = value;
                }
            });

        };
    });
    fg.directive('fgParsePattern', function() {

        return {
            require: ['ngModel'],
            link: function($scope, $element, $attrs, ctrls) {
                var ngModelCtrl = ctrls[0];

                ngModelCtrl.$parsers.push(validate);

                function validate(value) {
                    try {
                        new RegExp(value);
                    } catch(e) {
                        ngModelCtrl.$setValidity('pattern', false);
                        return undefined;
                    }

                    ngModelCtrl.$setValidity('pattern', true);
                    return value;
                }
            }
        };
    });
    fg.directive('fgPropertyFieldValidation', ["fgPropertyFieldValidationLinkFn", function(fgPropertyFieldValidationLinkFn) {
        return {
            restrict: 'A',
            templateUrl: 'angular-form-gen/edit/canvas/field/properties/validation/validation.ng.html',
            link: fgPropertyFieldValidationLinkFn
        };
    }]).factory('fgPropertyFieldValidationLinkFn', ["fgConfig", function(fgConfig) {

        var patternOptions = [];
        var patternConfig = fgConfig.validation.patterns;

        angular.forEach(patternConfig, function(value, text) {
            patternOptions.push({ value: value, text: text });
        });

        return function($scope, $element, $attrs, ctrls) {

            $scope.patternOptions = patternOptions;

            $scope.field.validation = $scope.field.validation || {};
            $scope.field.validation.messages = $scope.field.validation.messages || {};

            $scope.fields = {
                required: false,
                minlength: false,
                maxlength: false,
                pattern: false
            };

            $scope.$watch($attrs['fgPropertyFieldValidation'], function(value) {
                $scope.fields = angular.extend($scope.fields, value);
            });
        };
    }]);
    fg.directive('fgEditValidationMessage', ["fgEditValidationMessageLinkFn", function(fgEditValidationMessageLinkFn) {
        return {
            templateUrl: 'angular-form-gen/edit/canvas/field/properties/validation/validation-message.ng.html',
            link: fgEditValidationMessageLinkFn,
            scope: true
        };
    }]).factory('fgEditValidationMessageLinkFn', function() {

        var DEFAULT_TOOLTIP = "Enter a error message here that will be shown if this validation fails. If this field is empty a default message will be used.";

        return function($scope, $element, $attrs, ctrls) {
            $attrs.$observe('fgEditValidationMessage', function(value) {
                $scope.validationType = value;
            });

            $attrs.$observe('fgEditValidationTooltip', function(value) {
                value = value || DEFAULT_TOOLTIP;
                $scope.tooltip = value;
            });
        };
    });
})(angular);
//# sourceMappingURL=angular-form-gen.js.map