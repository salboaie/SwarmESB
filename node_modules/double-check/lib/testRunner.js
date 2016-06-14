/*
     Created by ctalmacel on 2/29/16.
*/

var forker = require('child_process');
var fs = require('fs');
var tests = {};
var testFiles = [];
var singularRuns = [];
var maximumNrOfParallelTests = process.env['DOUBLE_CHECK_POOL_SIZE']||10;
var runningTests = 0;
var singularRun = false;

getTests(function(newTestFiles,newSingularRuns) {
    testFiles = testFiles.concat(newTestFiles);
    singularRuns = singularRuns.concat(newSingularRuns);
    launchTests();
})

function launchTests(){

    if(singularRun){
        return;
    }

    while(runningTests < maximumNrOfParallelTests && testFiles.length > 0){
        launchTest(testFiles.pop());
    }
    if(runningTests === 0 && singularRuns.length > 0){
        singularRun = true;
        launchTest(singularRuns.pop());
    }


    function launchTest(test) {
        console.log("Starting test " + test);
        var env = process.env;
        var worker = forker.fork(test,{"env":env,"silent":true}).
        on("message", handleTestMessage(test)).
        on("exit", handleExitEvent(test));
        runningTests++;


        setTimeout(function(){
            if(!worker.isDead) {
                worker.kill();
            }
        },process.env['TEST_TIMEOUT']||10000);
    }
}



function getTests(callback){

    var testsDirectory = getTestsPath();
    var testFiles = [];

    fs.readdir(testsDirectory,function(err,files){
        checkDirectory(err,files,testsDirectory);
    });

    function checkDirectory(err,files,path){
        if(err){
            throw(err);
        }

        var directoryPath = path;
        var filesCount=files.length;
        var gotDoubleCheck = false;

        var directoryTestFiles = [];
        var excludedFiles = [];
        var singularRuns = [];


        files.forEach(checkFile);

        function checkFile(fileName) {
            if (fileName.match("double-check.conf")) {
                parseConfig(fileName);
            }
            else {
                var path = directoryPath+"/"+fileName;
                fs.stat(path, function (err, fileStatus) {
                    if(err){throw err;}

                    if (fileStatus.isDirectory()) {
                        fs.readdir(path, function(err,files){
                            checkDirectory(err,files,path);
                        });
                    }
                    else {
                        if (fileName.match(".js")) {
                            directoryTestFiles.push(path);
                        }
                    }
                    afterFileIsProcessed();
                })
            }
        }

        function parseConfig(fileName){

            gotDoubleCheck = true;
            fs.readFile(directoryPath+"/"+fileName, function (err, data) {
                if (err) {throw err;}

                data = data.toString().split("\n").forEach(function(fileInfo) {
                    fileInfo = fileInfo.split(' ');

                    if(fileInfo[1] === "disabled" || fileInfo[1] === "alone") {
                        excludedFiles.push(directoryPath+"/"+fileInfo[0]);
                        if(fileInfo[1] === "alone"){
                            singularRuns.push(directoryPath + "/" + fileInfo[0]);
                        }
                    }

                })

                afterFileIsProcessed();
            })
        }

        function afterFileIsProcessed(){
            filesCount--;
            if (filesCount === 0 && gotDoubleCheck) {
                excludedFiles.forEach(function(file){
                    var index = directoryTestFiles.indexOf(file)
                    if(index>-1){
                        directoryTestFiles.splice(index,1);
                    }
                })
                callback(directoryTestFiles,singularRuns);
            }
        }

    }

    function getTestsPath(){
        if(process.argv.length==3){
            return process.argv[2];
        }else{
            return process.cwd();
        }
    }

}

function handleTestMessage(testFile){
    tests[testFile] = {
        "output":[],
        "done":false
    };
    return function(message) {
        tests[testFile].done = true;
        tests[testFile].output.push(message)
    }
}

function handleExitEvent(testFile){
    return function(){
        runningTests--;
        singularRun = false;
        launchTests();

        if(tests[testFile].done===false){
            console.log("Test "+testFile+" did not terminate properly...");
            return;
        }

        console.log("\nTest: "+testFile);
        tests[testFile].output.forEach(function(message){
            console.log("Message: "+message.message);
            if(message.hasOwnProperty('stack')){
                console.log('Stack:');
                message.stack.split("\n").forEach(function(message){console.log(message)});
            }
        });
        console.log("\n");
    }
}
