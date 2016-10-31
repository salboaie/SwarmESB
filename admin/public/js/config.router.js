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
                    .otherwise('/app/privatesky');

                $stateProvider
                    .state('app', {
                        abstract: true,
                        url: '/app',
                        templateUrl: 'tpl/app.html'
                    })
                    .state("app.privatesky", {
                        url: '/privatesky',
                        templateUrl: 'tpl/privatesky/privatesky.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['js/app/stats/usage.js',
                                        'js/controllers/chart.js']);
                                }]
                        }
                    })
                    .state('app.usermanager',{
                       url:'/userManager',
                        templateUrl:'tpl/privatesky/usersManager.html',
                        resolve:{
                            deps:['$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['js/controllers/usersManagerController.js']);
                                }]
                        }
                    })
                      // pages
                    .state('app.page', {
                        url: '/page',
                        template: '<div ui-view class="fade-in-down"></div>'
                    })
                    .state('app.swarms', {
                        url: '/swarms',
                        templateUrl: 'tpl/swarms-infinite-scroll.html',
                        resolve: {
                            deps: ['uiLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['js/controllers/infiniteScroller.js']);
                                }]
                        }
                    })
                    .state('app.testsManager',{
                        url: '/testsManager',
                        reloadOnSearch:false,
                        templateUrl: 'tpl/testsManager.html',
                        resolve: {
                            deps: ['uiLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['js/controllers/testsManagerController.js']);
                                }]
                        }
                    })
                    .state('app.logsManager',{
                        url: '/logsManager',
                        reloadOnSearch:false,
                        templateUrl: 'tpl/logsManager.html',
                        resolve: {
                            deps: ['uiLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['js/controllers/logsManagerController.js']);
                                }]
                        }
                    })
                    .state('app.page.profile', {
                        url: '/profile',
                        templateUrl: 'tpl/page_profile.html',
                        resolve: {
                            deps: ['uiLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['js/controllers/profile.js']);
                                }]
                        }
                    })

                    .state('access', {
                        url: '/access',
                        template: '<div ui-view class="fade-in-right-big smooth"></div>'
                    })
                    .state('access.signin', {
                        url: '/signin',
                        templateUrl: 'tpl/page_signin.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/signin.js']);
                                }]
                        }
                    })
                    .state('access.signup', {
                        url: '/signup',
                        templateUrl: 'tpl/page_signup.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/signup.js']);
                                }]
                        }
                    })
                    .state('access.forgotpwd', {
                        url: '/forgotpwd',
                        templateUrl: 'tpl/page_forgotpwd.html'
                    })
                    .state('access.404', {
                        url: '/404',
                        templateUrl: 'tpl/page_404.html'
                    })
            }
        ]
    );