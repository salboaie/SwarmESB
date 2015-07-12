/* This is a mock adapter for unit testing.

To use it, create a Mock Adapter in your test specs like this:

var MockMailAdapter = new MockAdapter('./../adapters/MailAdapter.js');

 */

var mockery= require('mockery');

mockery.enable({warnOnUnregistered: false});	
	
var swarmcoreMock = {
	// This mocked function is called when the actual adapter is loaded
	createAdapter: function (name) {
	console.log('Creating Mock Adapter ' + name);
	}	
};

mockery.registerMock('swarmcore', swarmcoreMock);

/* 
Constructor : _file is the adapter module to mock
 Make sure all functions you want to test are exported from the adapter module
 via module.exports 
 */
function MockAdapter(_file) {
	
	this.swarmDetails = {
		swarmFile: '',
		phase: '',
		args: []
	};
	
	var self = this;
	if (_file) {
		this.whoami = _file;
		// This is where the actual adapter is loaded
		var mockedAdapter = require(_file);
		Object.keys(mockedAdapter).forEach(function(key) {
	   		self[key] = mockedAdapter[key]; 
	 	});
	}
}

/* Mock the startSwarm function. */
MockAdapter.prototype.startSwarm = function(){

// tests can inspect the Mock Adapter's swarmDetails to see if swarms were started.

	this.swarmDetails = {
		swarmFile: '',
		phase: '',
		args: []
	};
	
	for (var i = 0; i < arguments.length; i++) {
    	if (i === 0) this.swarmDetails.swarmFile = arguments[0];
		if (i === 1) this.swarmDetails.phase = arguments[1];
		if (i > 1) this.swarmDetails.args.push(arguments[i]);
  }
}

module.exports = MockAdapter; 
