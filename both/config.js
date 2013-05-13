defaultSlide = function (userId) {
  return {owner: userId, text: "Nothing to say yet.", ind:Session.get('notFoundInd')};
};
// Meteor.subscribe('slides');
defaultConfig = function (userId) {
  return {_id:userId, owner:userId, id:getOrCreateSlideId(userId)};
}

getOrCreateSlideId = function (userId) {
  var slideId;
  var mySlides = Slides.find({owner:userId});
  console.log("Evaluating getOrCreateSlideId.");
  if (mySlides.count()===0) {
    slideId = Slides.insert(defaultSlide(userId));
  } else {
    slideId = mySlides.fetch()[0]._id;
  };
  return slideId;
}

slideIsValid = function(slide) {
  if (slide === undefined) {
    console.log("slide is undefined.");
    return false;
  }
  console.log("Evaluating slideIsValid.");
  // check: slide has valid owner
  if (slide.hasOwnProperty('owner')) {
    if (!userExists(slide.owner)) {
      console.log("Owner "+slide.owner+" is an invalid user.");
      return false;
    } 
  } else {
    console.log("Slide has no owner.");
    return false;
  }
  // check: slide has valid text 
  //
  // note: I'm being lazy, should check for type, but I don't feel like
  // reviewing the details of how to do it right
  if (slide.hasOwnProperty('text')) {
    if (slide.text === undefined) {
      console.log("Text of slide is undefined.");
      return false;
    }
  }
  return true;
}

configIsValid = function(conf) {
  if (!(conf.hasOwnProperty('id') && conf.hasOwnProperty('owner'))) {
    return false;
  }
  // this method also checks that the user exists and slide exists
  if (slideIsOwnedByUser(conf.id, conf.owner)) {
    return true;
  } else {
    return false;
  }
}

userExists = function (userId) {
  console.log("Checking for the existence of user "+userId+".");
  console.log("I currently have users: ");
  Meteor.users.find().forEach( function(user) {
    console.log(user._id);
  });
  console.log("And the count of matches is "+Meteor.users.find(userId).count());
  return (!(Meteor.users.find(userId).count() === 0));
}

// not checking for multiple entries with the same id (is this possible in
// mongodb?)
slideExistsAndValid = function (slideId) {
  curs = Slides.find(slideId);
  if (curs.count() === 0) {
    return false;
  }
  console.log("Evaluating slideExistsAndValid.");
  if (slideIsValid(curs.fetch()[0])) {
    return true;
  } else {
    console.log("Removing invalid slide "+JSON.stringify(Slides.findOne(slideId)));
    Slides.remove(slideId);
    return false;
  }
}

slideIsOwnedByUser = function (slideId, userId) {
  if (slideExistsAndValid(slideId)) {
    theSlide = Slides.findOne(slideId);
    if (theSlide.owner === userId) {
      return true;
    }
  }
  return false;
}

// should only be called if there is 
// check userId for undefined?
getOrCreateConfigId = function(userId)   {
  var configId;
  var configs = Config.find({$or: [{owner: userId}, {_id: userId}]});
  var foundValid = false;
  if (configs.count()===0) {
    console.log("Creating new config object for user "+userId+" (first occurrence).")
    var configId = Config.insert(defaultConfig(userId));
    var foundValid = true;
  } else {
    var foundValid = false;
    console.log("Found "+configs.count()+" config objects for user "+userId+".");
    console.log("Out of a total of "+Config.find().count()+" config objects.");
    configs.forEach( function (conf) {
      if (!foundValid) {
        if (configIsValid(conf)) {
          foundValid = true;
          configId = conf._id;
        } else {
          console.log("Removing malformed config "+conf._id+".");
          Config.remove(conf._id);
        }
      } else {
        console.log("Removing superfluous config "+conf._id+" because already have valid config "+configId+".");
        Config.remove(conf._id);
      }
    });
  }
  // if there were none valid ones among
  if (!foundValid) {
    console.log("Creating new config object for user "+userId+" (second occurrence).")
    var configId = Config.insert(defaultConfig(userId));
    var foundValid = true;
  }
  return configId;
}
