var core = require("swarmcore");
var thisAdapter = core.createAdapter("NewsAdapter");
var apersistence = require('apersistence');

const crypto = require('crypto');
var container = require("safebox").container;
var flow = require("callflow");
var uuid = require('uuid');

var self = this;

var registerModels = function () {
	self.persistence.registerModel("News", {
		newsId: {
			type: "string",
			pk: true,
			index: true,
			length: 255
		},
		title: {
			type: "string",
			length: 255
		},
		body: {
			type: "textString"
		},
		image: {
			type: "string",
			length: 255
		},
		urlPage: {
			type: "string",
			length: 255
		},
		author: {
			type: "string",
			length: 255
		},
		date: {
			type: "string",
			length: 255
		},
		is_active: {
			type: "string",
			default: "false",
			length: 255
		}
	}, function (err, model) {
		if (err) {
			console.log("[News Adapter]", err);
		}
	});
};

/*
 Adauga o stire
 */

createNews = function (newsData, callback) {
	if (!newsData.newsId) {
		newsData.newsId = uuid.v1().split("-").join("");
	}
	var dateObject = new Date();
	newsData.date = dateObject.getTime();


	self.persistence.lookup("News", newsData.newsId, function (err, news) {
		if (err) {
			callback(new Error("Could not retrieve news by id"))
		} else if (!self.persistence.isFresh(news)) {
			callback(new Error("News item with id " + newsData.newsId + " already exists"));
		} else {
			self.persistence.externalUpdate(news, newsData);
			self.persistence.save(news, function (err, newsData) {
				if (err) {
					console.log(err);
					callback(new Error("Could not create news item."))
				} else {
					self.connection.query("select * from defaultuser where userId ='"+news.author+"'", function (err, result) {
						if(!err){
							news.lastName = result[0].lastName;
							news.firstName = result[0].firstName;
						}
						delete(news.__meta);
						callback(undefined, news);
					});
				}
			})
		}
	});
};

/*
 Update a news item
 */
updateNews = function (newsObj, callback) {
	flow.create("update user", {
		begin: function () {
			self.persistence.lookup.async("News", newsObj.newsId, this.continue("updateNews"));
		},
		updateNews: function (err, news) {
			if (err) {
				callback(err, null);
			}
			else {
				if (self.persistence.isFresh(news)) {
					callback(new Error("News item with id " + newsObj.newsId + " does not exist"), null);
				}
				else {
					self.persistence.externalUpdate(news, newsObj);
					self.persistence.saveObject(news, this.continue("updateReport"));
				}
			}
		},
		updateReport: function (err, user) {
			callback(err, user);
		}
	})();
};

/*
 queryByAuthor returneaza lista stirilor dupa un anumit Author ID
 */

queryByAuthor = function (authorId, callback) {
	flow.create("query by author", {
		begin: function () {
			self.persistence.filter("News", {"author": authorId}, this.continue("getNewsByAuthor"));
		},
		getNewsByAuthor: function (err, news) {
			var result = [];

			news.forEach(function (item) {
				if (item.is_active != false) {
					result.push(item);
				}
			});

			callback(err, result);
		}
	})();
};

queryByState = function (state, callback) {
	self.connection.query("select * from news join defaultuser on defaultuser.userId = news.author where news.is_active='"+state+"' order by date desc", function (err, result) {
		if(!err){
			cleanObject(result);
		}
		callback(err,result);
	});
};


queryNews = function (callback) {
	self.connection.query("select * from news join defaultuser on defaultuser.userId = news.author", function (err, result) {
		if(!err){
			cleanObject(result);
		}
		callback(err,result);
	});
};

/*
 Returneaza informatii despre o stire
 */
getNewsInfo = function (newsId, callback) {
	flow.create("retrieve news info", {
		begin: function () {
			self.persistence.findById("News", newsId, this.continue("info"));
		},
		info: function (err, news) {
			if (err) {
				callback(err, null);
			} else if (news) {

				callback(null, news);


			} else {
				callback(null, null);
			}
		}
	})();
};

container.declareDependency("NewsManagementAdapter", ["mysqlPersistence"], function (outOfService, persistence) {
	if (!outOfService) {
		self.persistence = persistence;
		registerModels();
	} else {
		console.log("Disabling persistence...");
	}
});

container.declareDependency("mysqlConn",['mysqlConnection'],function(outOfService,mysqlConnection){
	if(!outOfService){
		self.connection = mysqlConnection;
	}else{
		console.log("Initialising MySQL persistence");
	}
});

function cleanObject(items) {
	for (var i = 0; i < items.length; i++) {
		delete(items[i].__meta);
		delete(items[i].password);
		delete(items[i].salt);
	}
}