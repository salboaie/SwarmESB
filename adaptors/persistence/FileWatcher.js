var util = require('util');
var events = require('events');
var fs = require('fs');
var os = require('os');

var FileWatcher = function (name) {

    events.EventEmitter.call(this);

    var filesQueue = {};
    var changesQueue = {};
    var cache = null;
    var self = this;
    var watchers = {};
    var cachePath = "";

    allFiles = {};

    var init = function (name) {
        cachePath = os.tmpDir() + '/filewatcher-' + name + '.cache';
        self.on('fileChange', addFileChange);
    }


    this.run = function (folders) {
        listAndWatchFolders(folders, true);
        self.emit('scanComplete', allFiles);
        loadCacheFile();
        compareCacheWithFiles();
    }


    this.deleteCache = function () {
        try {
            fs.unlinkSync(cachePath);
        }
        catch (e) {
        }
    }

    var addFileChange = function () {
        var clone = {};
        for (var key  in changesQueue) {
            clone[key] = changesQueue[key];
        }
        self.emit('changes', clone);
        saveCache();
        changesQueue = {};
    }

    var saveCache = function () {
        fs.writeFile(cachePath, JSON.stringify(cache), function (err) {
            if (err) {
                console.error("Cache not saved");
                return;
            }
            console.log("Cache saved");
        });
    }

    var compareCacheWithFiles = function () {
        if (!cache) {
            return;
        }

        var changes = false;
        var file;
        for (file in filesQueue) {
            if (isCacheDifferent(file, filesQueue[file])) {
                changesQueue[file] = filesQueue[file];
                cache[file] = filesQueue[file];
                changes = true;
            }
        }
        if (changes) {
            self.emit('fileChange');
        }
        filesQueue = {};
    }

    var isCacheDifferent = function (key, value) {
        if (!cache) {
            return true;
        }
        var cacheValue;
        cacheValue = cache[key];
        if (!cacheValue || JSON.stringify(cacheValue) != JSON.stringify(value)) {
            return true;
        }

        return false;
    }

    var loadCacheFile = function () {
        var stringCache = null;
        try {
            stringCache = fs.readFileSync(cachePath);
        }
        catch (e) {
            stringCache = null;
        }
        if (stringCache) {
            cache = JSON.parse(stringCache);
        }
        else {
            cache = {};
        }

    }

    var listAndWatchFolders = function (folders) {
        var folderPath;
        var files;
        var i, j, dLen, fLen;

        for (i = 0; dLen = folders.length, i < dLen; i++) {
            folderPath = folders[i];
            try {
                files = fs.readdirSync(folderPath);
            }
            catch (e) {
                console.log("Error reading files from : " + folderPath);
                files = [];
            }
            for (j = 0; fLen = files.length, j < fLen; j++) {
                checkFile(folderPath, files[j]);
            }
            watchFolder(folderPath);
        }
    }

    var checkFile = function (folderPath, fileName) {
        var filePath = folderPath + '/' + fileName;
        var fileStat = fs.statSync(filePath);

        if (!fs.existsSync(filePath)) {
            unwatchFolder(filePath);
            return;
        }
        var queueValue = {stat: fileStat,
            name: fileName,
            path: filePath};

        if (!isCacheDifferent(filePath, queueValue)) {
            return;
        }

        if (fileStat.isDirectory()) {
            listAndWatchFolders([filePath]);
        }
        else {
            allFiles[filePath] = queueValue;
            filesQueue[filePath] = queueValue;
        }
    }

    var unwatchFolder = function (folderPath) {
        var watcher = watchers[folderPath];
        if (watcher) {
            watcher.removeAllListeners()
            watcher.close();
            watchers[folderPath] = null;
            delete watchers[folderPath];
        }
    }
    var watchFolder = function (folderPath) {
        unwatchFolder(folderPath);
        var watcher = fs.watch(folderPath, function (event, filename) {
            if (filename) {
                console.log(folderPath + ' ' + event + ' ' + filename);
                checkFile(folderPath, filename);
            } else {
                console.log(folderPath + ' ' + event + ' folder');
                listAndWatchFolders([folderPath]);
                if (event == 'rename') {
                    self.emit('fileChange');
                }
            }
            compareCacheWithFiles();
        });

        watcher.on('error', function (err) {
            unwatchFolder(folderPath);
        });

        watchers[folderPath] = watcher;
    }

    init(name);
}

util.inherits(FileWatcher, events.EventEmitter);

module.exports = FileWatcher;