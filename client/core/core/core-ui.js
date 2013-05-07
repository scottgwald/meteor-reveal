Template.menu_body.events({
	'click .my-menu .my-menu-button': function() {
		console.log('clicked the button!');
		$('.my-menu-body').toggle();
	}
});

Template.menu_body.created = function() {
	console.log('hello 870907');

	logger.disableLogger();
	console.log('hi', 'hiya');
	console.log('this wont show up in console');

	logger.enableLogger();
	console.log('This will show up!');

	// logger.disableLogger();
}

Template.menu_body.rendered = function() {
	$('.my-menu-body').hide();
}

Template.menu.events({
	'click a': function(events) {
		console.log('clicked a link 809re.');
		$('.my-menu-body').toggle();
	}
});

// Template.menu.events({
// 	'click ul>li>a': function() {
// 		console.log("Clicked a link.");
// 	}
// });
