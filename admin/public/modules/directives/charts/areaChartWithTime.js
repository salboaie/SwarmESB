/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */

/*'use strict';*/

SwarmMonitor.directive('areaChartWithTime', [function() {
    
    var controller = ['$scope', '$state', '$rootScope', '$element',
        function($scope, $translate, $state, $rootScope, $element){

        }];

    var defaultConfig = {
        categoryField: 'date',
        valueField: 'value',
        enableScrollBar: true,
        category: {
            parseDates: true, // in order char to understand dates, we should set parseDates to true
            minPeriod: 'ss', // 'mm' for minute interval			 
            gridAlpha: 0.07,
            axisColor: '#DADADA',
            categoryBalloonDateFormat: 'JJ:NN, DD MMMM'
        },
        value: {
            gridAlpha: 0.07,
            title: "Value type"
        },
        graph: {
            type: 'line', // try to change it to "column"
            title: 'red line',
            lineAlpha: 1,
            lineColor: '#d1cf2a',
            fillAlphas: 0.3 // setting fillAlphas to > 0 value makes it area graph
        }
    };
    return {
        replace: true,
        template: '<div style="width: 100%; height: 400px;"></div>',
        restrict: 'E',
        scope: {
            config: '=config',
            data: '=data',
            liveView:'=liveView'
        },
        controller: controller,
        link: function (scope, element, attr) {
            var chart;

            var id = _.uniqueId('chart-');
            element.attr('id', id);
            var config = scope.config || defaultConfig;

            var initChart = function() {
                if (chart) {
                    chart.destroy();
                }
                // SERIAL CHART
                chart = new AmCharts.makeChart(id,{
                    type: "serial",
                    theme: "none",
                    marginLeft: 20,
                    pathToImages: "./images/amcharts/",
                    //dataProvider: scope.data,
                    categoryField: config.categoryField,
                    //dataDateFormat: 'MM SS',
                    categoryAxis: {
                        parseDates: config.category.parseDates || defaultConfig.category.parseDates,
                        minPeriod: config.category.minPeriod || defaultConfig.category.minPeriod,
                        gridAlpha: config.category.gridAlpha || defaultConfig.category.gridAlpha,
                        axisColor: config.category.axisColor || defaultConfig.category.axisColor,
                        minorGridAlpha: config.category.gridAlpha || defaultConfig.category.gridAlpha,
                        minorGridEnabled: true
                    },
                    valueAxes: [{
                        gridAlpha: config.value.gridAlpha || defaultConfig.value.gridAlpha,
                        title: config.value.title || defaultConfig.value.title
                    }],
                    graphs: [{
                        valueField:config.valueField,
                        balloonText: config.graph.balloonText || "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
                        type: config.graph.type || defaultConfig.graph.type,
                        title: config.graph.title || defaultConfig.graph.title,
                        lineAlpha: config.graph.lineAlpha || defaultConfig.graph.lineAlpha,
                        lineColor: config.graph.lineColor || defaultConfig.graph.lineColor,
                        fillAlphas: config.graph.fillAlphas || defaultConfig.graph.fillAlphas
                    }],
                    chartScrollbar: null,
                    chartCursor: {
                        categoryBalloonDateFormat: config.category.categoryBalloonDateFormat || defaultConfig.category.categoryBalloonDateFormat,
                        //"cursorAlpha": 0.2,
                        "cursorPosition": "mouse"
                    }
                });
            };

            var checker;
            scope.$watch('liveView', function(newValue, oldValue){
                if (newValue !== true) {
                    clearInterval(checker);
                } else {
                    console.log('live view enabled');
                    checker = setInterval(function(){
                        //check for new data
                        //console.log(chart.dataProvider.length);
                        if (chart) {
                            chart.validateData();
                           // chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
                        }
                    },1000);
                }
            });

            scope.$watch('data', function(newValue,oldValue){
                console.log('chart data changed', newValue ? newValue.length : 'null');
                if (newValue) {
                    initChart();
                    chart.dataProvider = newValue;
                    chart.validateData();
                    //chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
                }
            });

            scope.$on('$destroy', function(){
                //console.log('CHART destroyed for id:' + id);
                clearInterval(checker);
            });
        }
    };
}]);
