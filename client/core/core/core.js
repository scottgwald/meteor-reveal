//Meteor.startup( function() {
Session.set('configLoaded',false);
Slides = new Meteor.Collection('slides');
Config = new Meteor.Collection('config');
Session.set('notFoundId', "xxxx");
Session.set('notFoundInd', 9999);
Session.set('notFoundText', "No slide here!");
Session.set('currentSlide',Session.get('notFoundId'));
//Session.set('panelIndex',0);

Meteor.subscribe('slides');

Meteor.subscribe('config', function onComplete() {
  revealInit();
});
//})

Meteor.subscribe("directory");

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
