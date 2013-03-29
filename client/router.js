Meteor.Router.add({
  '/':'view-edit',

  '/edit': 'view-edit', // renders template 'news'

  '/reveal': 'reveal',

  '/about': function() {
    if (Session.get('aboutUs')) {
      return 'aboutUs'; //renders template 'aboutUs'
    } else {
      return 'aboutThem'; //renders template 'aboutThem'
    }
  },

  '*': 'not_found'
});
