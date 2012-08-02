var initialized=false;
var thisAdaptor;
var pdf2swfCmd;
var doc2pdfCmd;

/***********************************************************************************************************************
 *  Functions
 **********************************************************************************************************************/

initialize = function()
{
    if ( initialized )
    {
        return;
    }

    initialized = true;

    pdf2swfCmdPath = thisAdaptor.config["DocumentConvertor"]["pdf2swfCmdPath"];
    pdf2swfCmd     = thisAdaptor.config["DocumentConvertor"]["pdf2swfCmd"];

    doc2pdfCmdPath = thisAdaptor.config["DocumentConvertor"]["doc2pdfCmdPath"];
    doc2pdfCmd     = thisAdaptor.config["DocumentConvertor"]["doc2pdfCmd"];
}


convertDocument = function(fileName,callBack,endCallBack)
{
    initialize();

    var startTime;
    var endTime;
    var docExecCmd;
    var swfExecCmd;
    var directory    = getFileDirectory(fileName);
    var extension    = getExtensionFromFileName(fileName);
    var thisFileName = getFileName(fileName);

    startTime  = Date.now();
    swfExecCmd = pdf2swfCmd;
    swfExecCmd = swfExecCmd.replace("[file]",directory+"/"+thisFileName+".pdf");
    swfExecCmd = swfExecCmd.replace("[swffile]",directory+"/"+thisFileName+".swf");

    if ( extension != "pdf" )
    {
        docExecCmd = doc2pdfCmd;
        docExecCmd = docExecCmd.replace("[file]",fileName);
        docExecCmd = docExecCmd.replace("[outdir]",directory);

        converFile(fileName,docExecCmd,doc2pdfCmdPath,callBack,function()
            {
                converFile(fileName,swfExecCmd,pdf2swfCmdPath,callBack,function()
                    {
                        endTime=Date.now();
                        callBack("Generating file done in :"+(endTime-startTime)/1000+" seconds !");
                        endCallBack();
                    }
                );
            }
        );
    }
    else
    {
        converFile(fileName,swfExecCmd,pdf2swfCmdPath,callBack,function()
            {
                endTime=Date.now();
                callBack("Generating file done in :"+(endTime-startTime)/1000+" seconds !");
                endCallBack();
            }
        );
    }
}

var converFile = function(fileName,execCmd,cwd,callBack,endCallBack)
{
    var intervalId;
    var messageQueue;
    var intervalFunction;

    console.log("Generating for : "+fileName);
    callBack("Generating for : "+fileName);
    console.log("Exec : "+execCmd);

    var util       = require('util'),
        exec       = require('child_process').exec ,
        exeHandler = exec (execCmd,{cwd:cwd});

    messageQueue="";

    intervalFunction = function()
    {
        if ( messageQueue.length > 0 )
        {
            callBack(messageQueue);
            messageQueue="";
        }
    }.bind(this);

    intervalId = setInterval(intervalFunction,500);

    exeHandler.stdout.on('data', function (data)
    {
        messageQueue+= data;
    });

    exeHandler.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    exeHandler.on('exit', function (code) {
        clearInterval(intervalId);
        intervalFunction();
        endCallBack();
    });
}

var getExtensionFromFileName = function(filePath)
{
    return filePath.split('.').pop();
}

var getFileName = function(filePath)
{
    if (filePath.indexOf("/") == -1) // windows
    {
        return filePath.substring( filePath.lastIndexOf('\\')+1,filePath.lastIndexOf('.'));
    }
    else // unix
    {
        return filePath.substring( filePath.lastIndexOf('/')+1,filePath.lastIndexOf('.'));
    }
}

var getFileDirectory = function(filePath)
{
    if (filePath.indexOf("/") == -1) // windows
    {
        return filePath.substring(0, filePath.lastIndexOf('\\'));
    }
    else // unix
    {
        return filePath.substring(0, filePath.lastIndexOf('/'));
    }
}

thisAdaptor = require('swarmutil').createAdaptor("DocumentConvertor");



