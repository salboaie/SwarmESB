!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),o.angularFootable=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

angular
    .module('ui.footable', [])
    .directive('footable', function() {
        var events = {
            beforeFiltering: 'footable_filtering'
        };
        var extractSpecOpts = function(opts, attrs) {
            var extracted = {},
                k;
            for (k in opts) {
                if (k !== 'filter' && (!angular.isUndefined(events[k]))) {
                    if(!angular.isFunction(scope.$eval(attrs[k]))) {
                        extracted[k] = attrs[k];
                    }
                }
            }
            return extracted;
        };

        var bindEventHandler = function(tableObj, scope, attrs) {
            var k;
            for (k in attrs) {
                if (k !== 'filter' && (!angular.isUndefined(events[k]))) {
                    var targetEventName = events[k];
                    if(angular.isFunction(scope.$eval(attrs[k]))) {
                        tableObj.bind(targetEventName, scope.$eval(attrs[k]));
                    }
                }
            }
        };

        return {
            restrict: 'C',
            link: function(scope, element, attrs) {
                var tableOpts = {
                    'event-filtering': null
                };

                angular.extend(
                    tableOpts,
                    footable.options
                );

                angular.extend(
                    tableOpts,
                    extractSpecOpts(tableOpts, attrs)
                );

                var tableObj = element.footable(tableOpts);

                bindEventHandler(tableObj, scope, attrs);

            }
        };
    });

},{}]},{},[1])

(1)
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90b255d2FuZy93b3Jrc3BhY2UvamF2YXNjcmlwdC9hbmd1bGFyLWZvb3RhYmxlL25vZGVfbW9kdWxlcy9ib2lsZXJwbGF0ZS1ndWxwL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvdG9ueXdhbmcvd29ya3NwYWNlL2phdmFzY3JpcHQvYW5ndWxhci1mb290YWJsZS9zcmMvYW5ndWxhci1mb290YWJsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFuZ3VsYXItZm9vdGFibGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhclxuICAgIC5tb2R1bGUoJ3VpLmZvb3RhYmxlJywgW10pXG4gICAgLmRpcmVjdGl2ZSgnZm9vdGFibGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50cyA9IHtcbiAgICAgICAgICAgIGJlZm9yZUZpbHRlcmluZzogJ2Zvb3RhYmxlX2ZpbHRlcmluZydcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGV4dHJhY3RTcGVjT3B0cyA9IGZ1bmN0aW9uKG9wdHMsIGF0dHJzKSB7XG4gICAgICAgICAgICB2YXIgZXh0cmFjdGVkID0ge30sXG4gICAgICAgICAgICAgICAgaztcbiAgICAgICAgICAgIGZvciAoayBpbiBvcHRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGsgIT09ICdmaWx0ZXInICYmICghYW5ndWxhci5pc1VuZGVmaW5lZChldmVudHNba10pKSkge1xuICAgICAgICAgICAgICAgICAgICBpZighYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLiRldmFsKGF0dHJzW2tdKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhY3RlZFtrXSA9IGF0dHJzW2tdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGV4dHJhY3RlZDtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgYmluZEV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uKHRhYmxlT2JqLCBzY29wZSwgYXR0cnMpIHtcbiAgICAgICAgICAgIHZhciBrO1xuICAgICAgICAgICAgZm9yIChrIGluIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGsgIT09ICdmaWx0ZXInICYmICghYW5ndWxhci5pc1VuZGVmaW5lZChldmVudHNba10pKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0RXZlbnROYW1lID0gZXZlbnRzW2tdO1xuICAgICAgICAgICAgICAgICAgICBpZihhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUuJGV2YWwoYXR0cnNba10pKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFibGVPYmouYmluZCh0YXJnZXRFdmVudE5hbWUsIHNjb3BlLiRldmFsKGF0dHJzW2tdKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQycsXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFibGVPcHRzID0ge1xuICAgICAgICAgICAgICAgICAgICAnZXZlbnQtZmlsdGVyaW5nJzogbnVsbFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICAgICAgICAgICAgdGFibGVPcHRzLFxuICAgICAgICAgICAgICAgICAgICBmb290YWJsZS5vcHRpb25zXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKFxuICAgICAgICAgICAgICAgICAgICB0YWJsZU9wdHMsXG4gICAgICAgICAgICAgICAgICAgIGV4dHJhY3RTcGVjT3B0cyh0YWJsZU9wdHMsIGF0dHJzKVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGFibGVPYmogPSBlbGVtZW50LmZvb3RhYmxlKHRhYmxlT3B0cyk7XG5cbiAgICAgICAgICAgICAgICBiaW5kRXZlbnRIYW5kbGVyKHRhYmxlT2JqLCBzY29wZSwgYXR0cnMpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=