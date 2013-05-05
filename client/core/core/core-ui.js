Template.menu_body.events({
	'click .my-menu .my-menu-button': function() {
		console.log('clicked the button!');
		$('.my-menu-body').toggle();
	}
});

Template.menu_body.rendered = function() {
	$('.my-menu-body').hide();
}

// Template.menu.events({
// 	'click ul>li>a': function() {
// 		console.log("Clicked a link.");
// 	}
// });
