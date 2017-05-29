var NewsSwarm = {
	meta: {
		name: "NewsSwarm.js"
	},

	create: function (news) {
		this.news = news;
		this.news.author = this.getUserId();
		this.swarm('createNews');
	},

	update: function (news) {
		this.news = news;
		this.swarm('updateNews');
	},

	info: function (newsId) {
		this.newsId = newsId;
		this.swarm('getNewsById');
	},

	getByAuthor: function (authorId) {
		this.authorId = authorId;
		this.swarm('getNewsByAuthor');
	},

	newsList: function () {
		this.userID = this.getUserId();
		this.swarm('getNewsList');
	},

	getByActive: function (state) {
		this.state = state;
		this.swarm('getNewsByActive');
	},

	createNews: {
		node: "NewsAdapter",
		code: function () {
			var self = this;
			createNews(self.news, S(function (err, news) {
				if (err) {
					console.log(err);
					self.error = err;
					self.home('failed');
				} else {
					self.result = news;
					self.home("newsCreationDone");
				}
			}));
		}
	},

	updateNews: {
		node: "NewsAdapter",
		code: function () {
			var self = this;
			getNewsInfo(self.news.newsId, S(function (err, news) {
				if (err) {
					console.log(err);
					self.error = err;
					self.home('failed');
				} else {
					updateNews(self.news, S(function (err, news) {
						if (err) {
							console.log(err);
							self.error = err;
							self.home('failed');
						} else {
							self.result = news;
							self.home('newsUpdateDone');
						}
					}));
				}
			}));

		}
	},

	getNewsById: {
		node: "NewsAdapter",
		code: function () {
			var self = this;
			getNewsInfo(self.newsId, S(function (err, news) {
				if (err) {
					console.log(err);
					self.error = err;
					self.home('failed');
				} else {
					self.result = news;
					self.home('getNewsByIdDone');
				}
			}));
		}
	},

	getNewsByAuthor: {
		node: "NewsAdapter",
		code: function () {
			var self = this;
			getNewsInfo(self.authorId, S(function (err, news) {
				if (err) {
					console.log(err);
					self.error = err;
					self.home('failed');
				} else {
					self.result = news;
					self.home('getNewsListDone');
				}
			}));
		}
	},

	getNewsByActive: {
		node: "NewsAdapter",
		code: function () {
			var self = this;
			queryByState(self.state, S(function (err, news) {
				if (err) {
					console.log(err);
					self.error = err;
					self.home('failed');
				} else {
					self.result = news;
					self.home('getNewsListDone');
				}
			}))
		}
	},

	getNewsList: {
		node: "NewsAdapter",
		code: function () {
			var self = this;
			queryNews(S(function (err, news) {
				if (err) {
					console.log(err);
					self.error = err;
					self.home('failed');
				} else {
					self.result = news;
					self.home('getNewsListDone');
				}
			}))
		}
	}


};

NewsSwarm;