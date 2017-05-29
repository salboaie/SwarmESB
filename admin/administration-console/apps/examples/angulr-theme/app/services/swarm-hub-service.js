angular.module('swarm', [])
    .service('swarmHubService', function () {
        this.hub = new window.SwarmHubClient();
    });