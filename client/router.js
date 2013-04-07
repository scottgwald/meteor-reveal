Meteor.Router.add({
  '/':'view_edit',

  '/edit': 'view_edit', // renders template 'news'

  '/reveal': 'reveal',

  '/revealp': 'reveal_panels',

  '/reveals': 'reveals',

  '/about': function() {
    if (Session.get('aboutUs')) {
      return 'aboutUs'; //renders template 'aboutUs'
    } else {
      return 'aboutThem'; //renders template 'aboutThem'
    }
  },

  '*': 'not_found'
});
