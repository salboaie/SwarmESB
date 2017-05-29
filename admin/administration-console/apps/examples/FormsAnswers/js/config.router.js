'use strict';

/**
 * Config for the router
 */
angular.module('app')
    .run(['$rootScope', '$state', '$stateParams',
            function ($rootScope, $state, $stateParams) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
            }
        ])
    .config(
        ['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {

                $urlRouterProvider
                    .otherwise('/app/formsAnswers');

                $stateProvider
                    .state('app', {
                        abstract: true,
                        url: '/app',
                        templateUrl: 'tpl/app.html'
                    })

                    .state('app.formsAnswers',{
                       url:'/formsAnswers',
                        templateUrl:'tpl/formsAnswers.html',
                        resolve:{
                            deps:['$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load([
                                        'js/controllers/formsAnswersController.js'
                                    ]);
                                }]
                        }
                    })

                    .state('access.404', {
                        url: '/404',
                        templateUrl: 'tpl/page_404.html'
                    })
            }
        ]
    );