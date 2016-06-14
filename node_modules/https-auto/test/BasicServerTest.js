var server = require("../lib/AutoBootHttps.js");

/*
eyJ1cmwiOiJsb2NhbGhvc3Q6MzAwMCIsImNvZGUiOiJRMFZwVFRoa1pYbFZjV05rU1VFOVBRbz0iLCJrZXkiOiJXbGhOYW5KSmQwdGtlbHBxVTNjOVBRbz0ifQ==
*/

//eyJ1cmwiOiJsb2NhbGhvc3Q6MzAwMCIsImNvZGUiOiJPVzFFTm5NM1VqZGhVWHBDYUVFOVBRbz0iLCJrZXkiOiJibFEyUmtGbWJsTnRlVGRpSzJjOVBRbz0ifQ==

server.startServer(8080, "tmp", function(){
    console.log("Touch");
});
