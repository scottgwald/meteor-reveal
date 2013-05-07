// TODO: WHAT IF USER ISN'T LOGGED IN, BUT TRIES TO CREATE A SLIDE?
// ADD TO ROUTER.


// LOGIN IS HANGING ... 
//

//Meteor.startup( function() {
Session.set('configLoaded',false);
Slides = new Meteor.Collection('slides');
Config = new Meteor.Collection('config');
Directory = new Meteor.Collection('directory');
currentSlides = new Meteor.Collection('current-slides');
Session.set('notFoundId', "xxxx");
Session.set('notFoundInd', 9999);
Session.set('notFoundText', "No slide here!");
Session.set('currentSlide',Session.get('notFoundId'));
//Session.set('panelIndex',0);

Deps.autorun(function () {
  if (Meteor.userId()) {
    // upon login
    Meteor.subscribe('slidesForUser', function onComplete() {
      // this should be superfluous with auto-new-insert in getOrCreateConfigId
      if (Slides.find({}).count()===0) {
        Slides.insert(defaultSlide(Meteor.userId()));
      }
    });
    Meteor.call('fixMyOrder');
    // Session.set('configLoaded',false); //done at the top.
    Meteor.subscribe('configForUser', function onComplete() {
      var configId = getOrCreateConfigId(Meteor.userId()); // any good reason to pass it in?
      // TODO TODO TODO: replace all occurrences of configID with configId, for consistency.
      Session.set('configID',configId);
      Session.set('configLoaded',true);
      // revealInit();
      Meteor.subscribe('all-users-current-slides');
    });
  } else {
    // upon logout
    Session.set("configLoaded",false);
    Session.set("configID",undefined);
  }
});

// Meteor.subscribe('config', function onComplete() {
//   revealInit();
// });
//})

// IF DEBUG
// Meteor.subscribe("config");

// Meteor.subscribe("directory-email");
Meteor.subscribe("directory-name-email");
Meteor.subscribe("userInDetail");

Meteor.Router.add({
  '/':'view_edit',

  '/edit': 'view_edit', // renders template 'news'

  '/reveal': 'reveal',

  '/all': function() {
    Session.set('slideDeck','onePerUser');
    return 'reveal_arg';
  },
  '/custom': function() {
    Session.set('slideDeck','handSelected');
    return 'reveal_arg';
  },

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

nextSlide = function() {
  // TODO check in bounds
  var newId = slideId(currentSlideInd()+1);
  // Config.update(Session.get('configID'),{$inc: {n:1}});
  Config.update(Session.get('configID'),{$set: {id:newId}});
  return currentSlideInd();
}

previousSlide = function() {
  // TODO check in bounds
  var newId = slideId(currentSlideInd()-1);
  // Config.update(Session.get('configID'),{$inc: {n:-1}});
  Config.update(Session.get('configID'),{$set: {id:newId}});
  return currentSlideInd();
}

gotoSlide = function(ind) {
  Config.update(Session.get('configID'), {$set: {n:ind+1}});
}

gotoSlideId = function(theId) {
  Config.update(Session.get('configID'), {$set: {id:theId}});
}

currentSlide = function() {
  if (! Session.get("configLoaded")) {
    console.log("config not loaded");
    return -1;
  }  else {
    console.log("config loaded."); 
    // use id instead to avoid undefined in transient state?
    return Config.findOne(Session.get('configID')).n; 
  }
};

getShowingSlideId = function() {
  if (! Session.get("configLoaded")) {
    console.log("config not loaded");
    return Session.get("notFoundId");
  }  else {
    console.log("config loaded."); 
    // use id instead to avoid undefined in transient state?
    return Config.findOne(Session.get('configID')).id;
  }
};

slideText = function(id) {
  var sl = Slides.findOne(id);
  if (sl) {
    return sl.text;
  } else {
    return Session.get('notFoundText');
  }
}

// ?type declaration here might be helpful
slideId = function(ind) {
  // todo, check for multiples
  var sl = Slides.findOne({ind:ind});
  if (sl) {
    return sl._id;
  } else {
    return Session.get('notFoundId');
  }
}

slideInd = function(id) {
  var sl = Slides.findOne(id);
  if (sl) {
    return sl.ind;
  } else {
    return Session.get('notFoundInd');
  }
}

currentSlideInd = function() {
  return slideInd(getShowingSlideId());
}

currentSlideText = function() {
  var sl = Slides.findOne({ind:currentSlideInd()});
  if (! sl) {
    return "Loading";
  } else {
    return sl.text;
  }
}

nextSlideText = function() {
  return slideText(slideId(currentSlideInd()+1));
}

showSlides = function() {
  console.log(Config.find({}));
  return Config.find({});
}


swapSlides = function(ind1, ind2) {
  // should also check if there are more than one
  var id1 = Slides.findOne({ind:ind1})._id;
  var id2 = Slides.findOne({ind:ind2})._id;
  // any way to do this actually-atomically??
  Slides.update(id1,{$set: {ind:ind2}});
  Slides.update(id2,{$set: {ind:ind1}});
}

// add checkrep function to assure no spaces or duplicate indices

moveSlide = function(sourceIndex, targetIndex) {
  Meteor.call('moveSlide',sourceIndex,targetIndex);
  var id = Slides.findOne({ind:sourceIndex})._id;
  var movinUp = targetIndex > sourceIndex;
  shift = movinUp ? -1 : 1;
  lowerIndex = Math.min(sourceIndex, targetIndex);
  lowerIndex += movinUp ? 1 : 0;
  upperIndex = Math.max(sourceIndex, targetIndex);
  upperIndex -= movinUp ? 0 : 1;
  console.log("Shifting slides from "+lowerIndex+" to "+upperIndex+" by "+shift+" (with Meteor.call).");
}

revealReset = function() {
  Session.set('configLoaded',false);
  Meteor.call('revealReset', function (error, result) {
    revealInit();    
  });
}

logger = function() {
  var oldConsoleLog = null;
  var pub = {};

  pub.enableLogger =  function enableLogger() 
  {
    if(oldConsoleLog == null)
      return;

    window['console']['log'] = oldConsoleLog;
  };

  pub.disableLogger = function disableLogger()
  {
    oldConsoleLog = console.log;
    window['console']['log'] = function() {};
  };

  return pub;
}();
