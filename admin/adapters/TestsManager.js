/**
 * Created by ciprian on 3/23/16.
 */


var core = require ("swarmcore");
thisAdapter = core.createAdapter("TestsManager");

var pathToTests = process.argv[2];
if(!pathToTests){
    pathToTests = process.cwd();
}

var fs = require('fs');

runTests = function(tests,callback){
    var forker = require('child_process');
    tests.forEach(function(test){
        var env = process.env;
        env.RUN_WITH_WHYS = true;
        var worker = forker.fork(test,{'env':env,'silent':true});

        worker.on("message",function(log){
            if(log.type === 'assert'){
                log['test'] = test;
                callback(log)
            }
            thisAdapter.nativeMiddleware.recordLog(log);
        });

        worker.on("exit",function(){
            worker.terminated = true;
            callback({
                "test":test,
                result:"Terminated"
            })
        })
        worker.terminated = false;

        setTimeout(function(){
            if(!worker.terminated === true){
                worker.kill();
                callback({"messgae":"Test did not terminate properly"});
            }
        },process.env['TEST_TIMEOUT']||10000)

    })
}

getAvailableTests = function(){
    var tests = [];
    var dirsToBeAnalyzed = [pathToTests];

    while(dirsToBeAnalyzed.length>0){
        var dir = dirsToBeAnalyzed.shift();
        var content = extractContentOfDirectory(dir);
        dirsToBeAnalyzed = dirsToBeAnalyzed.concat(content.directories);
        tests = tests.concat(content.tests);
    }

    return tests;
    function extractContentOfDirectory(directory){
        var tests = [];
        var gotTests = false;
        var directories = [];
        var content = fs.readdirSync(directory);
        content.forEach(function(item){
            item = directory+"/"+item;
            if(item.match('double-check.conf')){
                gotTests = true;
            }else{
                if(item.match(".js")){
                    tests.push(item);
                }
                else{
                    var status = fs.statSync(item);
                    if(status.isDirectory()){
                        directories.push(item);
                    }
                }
            }
        })
        if(gotTests){
            return{
                "tests":tests,
                "directories":directories
            }
        }else{
            return{
                "tests":[],
                "directories":directories
            }
        }
    }
}

