
angular.module('app')
	.constant('usersZones',
		[
			{
				name: 'administrator',
				nice: 'Administrator'
			},
			{
				name: 'organizer',
				nice: 'Organizer'
			},
			{
				name: 'member',
				nice: 'Member'
			}
		]
	)
	.constant('notifyDefaults',{
		placement: {
			from: "bottom",
			align :"center"
		},
		animate:{
			enter: "animated fadeInUp",
			exit: "animated fadeOutDown"
		},
		allow_dismiss: true,
		element: 'body',
		timer: 1000,
		delay: 3000,
		offset:{
			y:10,
			x:0
		}
	})
;