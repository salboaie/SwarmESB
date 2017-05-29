/*
 * Copyright (c) 2016 ROMSOFT.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the The MIT License (MIT).
 * which accompanies this distribution, and is available at
 * http://opensource.org/licenses/MIT
 *
 * Contributors:
 *    RAFAEL MASTALERU (ROMSOFT)
 * Initially developed in the context of OPERANDO EU project www.operando.eu
 */


var notificationSwarming = {
    getNotifications: function () {
        this.swarm("getUserZones");
    },
    getUserZones: {
        node: "UsersManager",
        code: function () {
            var self = this;
            zonesOfUser(this.meta.userId, S(function (err, zones) {
                if (err) {
                    self.err = err.message;
                    self.home('failed');
                } else {
                    self.zones = zones.map(function (zone) {
                        return zone.zoneName;
                    });
                    self.swarm("getUserNotifications");
                }
            }))
        }
    },
    getUserNotifications: {
        node: "NotificationUAM",
        code: function () {
            var self = this;
            getNotifications(this.meta.userId, this.zones, S(function (err, notifications) {
                if (err) {
                    self.err = err.message;
                    console.log(err);
                    self.home('failed');
                }
                else {
                    self.notifications = notifications;
                    self.home("gotNotifications");
                }
            }));
        }
    },

    dismissNotification: function (notificationId) {
        this.userId = this.meta.userId;
        this.notificationId = notificationId;
        this.swarm("dismissUserNotification");
    },
    dismissUserNotification: {
        node: "NotificationUAM",
        code: function () {
            var self = this;
            dismissNotification(this.userId, this.notificationId, S(function (err) {
                if (err) {
                    self.err = err.message;
                    console.log(err);
                    self.home('failed');
                }
                else {
                    self.home("notificationDismissed");
                }
            }));
        }
    },

    sendNotification: function (notification) {
        this.notification = notification;
        this.swarm("getReceivers")
    },
    getReceivers: {
        node: "UsersManager",
        code: function () {
            var self = this;
            usersInZone(this.notification.zone, S(function (err, users) {
                if (err) {
                    self.err = err.message;
                    self.home('failed');
                } else {
                    self.users = users.map(function (user) {return user.userId;});

                    self.swarm("getUserDevices");
                }
            }))
        }
    },
    getUserDevices: {
        node: "UDEAdapter",
        code: function () {
            var self = this;
            getFilteredDevices({"userId": self.users}, S(function (err, devices) {
                if (err) {
                    self.err = err.message;
                    self.home('failed')
                } else {
                    delete self.users; // so we don't have to carry it anymore
                    
                    self.devicesPushNotificationTokens = devices.map(function (device) {return device.notificationIdentifier});
                    self.devicesPushNotificationTokens = self.devicesPushNotificationTokens.filter(function(token){
                        return token!==-1;
                    });
                    self.swarm('relayNotification')
                }
            }))
        }
    },
    relayNotification: {
        node: "NotificationUAM",
        code: function () {
            var self = this;
            self.notification.sender = this.meta.userId;
            createNotification(self.notification, S(function (err, notification) {
                if (err) {
                    self.err = err.message;
                    self.home('failed');
                } else {
                    notifyUsers(self.devicesPushNotificationTokens, self.notification, S(function (err) {
                        console.log(arguments);
                        if (err) {
                            self.err = err.message;
                            self.home('failed')
                        } else {
                            self.home('notificationSent');
                        }
                    }))
                }
            }))
        }
    },

    getFilteredNotifications: function (filter) {
        if (!filter) {
            this.filter = {}
        } else {
            this.filter = filter;
        }
        this.swarm('filter');
    },
    filter: {
        node: "NotificationUAM",
        code: function () {
            var self = this;
            filterNotifications(this.filter, S(function (err, result) {
                if (err) {
                    self.err = err.message;
                    self.home('failed')
                } else {
                    self.notifications = result;
                    self.home('gotFilteredNotifications');
                }
            }))
        }
    },

    success: {
        node: "Core",
        code: function () {
            console.log("Returning Notifications");
            this.notifications = [{
                message: "Pellentesque semper augue sed suscipit fringilla. Etiam vitae gravida augue, id tempus enim.",
                title: "Security error FACEBOOK MESSENGER",
                type: "SECURITY",
                action: "UNINSTALL",
                targetId: "com.facebook.orca"
            },
                {
                    message: "Pellentesque semper augue sed suscipit fringilla. Etiam vitae gravida augue, id tempus enim. ",
                    title: "Security error FACEBOOK",
                    type: "PRIVACY",
                    action: "DISABLE",
                    targetId: "com.facebook.katana"
                },
                {
                    message: "Pellentesque semper augue sed suscipit fringilla. Etiam vitae gravida augue, id tempus enim. ",
                    title: "Security error INSTAGRAM",
                    type: "PRIVACY",
                    action: "DISABLE",
                    targetId: "com.instagram.android"
                }];
            this.home("success");
        }
    },

    registerInZone: function (zoneName) {
        var possibleZones = ['iOS', 'Android', 'Extension'];
        if (possibleZones.indexOf(zoneName) === -1) {
            this.err = new Error('The possible user zones are: ', possibleZones).message;
            this.home('failed')
        } else {
            this.zone = zoneName;
            this.swarm('attachUserToZone');
        }
    },
    attachUserToZone: {
        node: "UsersManager",
        code: function () {
            var self = this;
            createZone(this.zone, S(function (err, result) {
                if (err) {
                    self.err = err.message;
                    self.home('failed');
                } else {
                    addUserToZone(self.meta.userId, self.zone, S(function (err, result) {
                        if (err) {
                            self.err = err.message;
                            self.home('failed');
                        } else {
                            self.home('success');
                        }
                    }))
                }
            }))
        }
    }
}

notificationSwarming;