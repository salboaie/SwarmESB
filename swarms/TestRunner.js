/*
 * Copyright (c) 2016 ROMSOFT.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the The MIT License (MIT).
 * which accompanies this distribution, and is available at
 * http://opensource.org/licenses/MIT
 *
 * Contributors:
 *    Ciprian Tălmăcel (ROMSOFT)
 * Initially developed in the context of OPERANDO EU project www.operando.eu
 */
var testRunner = {
    meta:{
        'debug':true
    },
    start:function (tests) {
        this.tests = tests;
        this.swarm("runTests");
    },
    runTests:{
        node:"TestsManager",
        code:function () {
            runTests(this.tests,S(function(result){
                startSwarm("FetchResult.js","start",result);
            }));
        }
    }
}

testRunner;