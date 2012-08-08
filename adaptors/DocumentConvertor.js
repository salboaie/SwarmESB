var initialized=false;
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

    var docExecCmd;
    var swfExecCmd;
    var endTime;
    var startTime            = Date.now();
    var directory            = getFileDirectory(fileName);
    var extension            = getExtensionFromFileName(fileName);
    var thisFileName         = getFileName(fileName);
    var swfConvertorHandler  = function()
        {
            endTime=Date.now();
            callBack("Generating file done in :"+(endTime-startTime)/1000+" seconds !");
            endCallBack();
        }.bind(this);
    
    swfExecCmd = pdf2swfCmd;
    swfExecCmd = swfExecCmd.replace("[file]",directory+"/"+thisFileName+".pdf");
    swfExecCmd = swfExecCmd.replace("[swffile]",directory+"/"+thisFileName+".swf");

    if ( extension != "pdf" )
    {
        docExecCmd = doc2pdfCmd;
        docExecCmd = docExecCmd.replace("[file]",fileName);
        docExecCmd = docExecCmd.replace("[outdir]",directory);

        convertFile(fileName,docExecCmd,doc2pdfCmdPath,callBack,function()
            {
                convertFile(fileName,swfExecCmd,pdf2swfCmdPath,callBack,swfConvertorHandler);
            }
        );
    }
    else
    {
        convertFile(fileName,swfExecCmd,pdf2swfCmdPath,callBack,swfConvertorHandler);
    }
}

var convertFile = function(fileName,execCmd,cwd,callBack,endCallBack)
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

require('swarmutil').createAdapter("DocumentConvertor");



