// Lists -- {name: String}
Slides = new Meteor.Collection("slides");
Config = new Meteor.Collection("config");

// Publish complete set of lists to all clients.
Meteor.publish('slides', function () {
  return Slides.find({}, {sort: {ind:1}});
});

Meteor.publish('slidesForUser', function() {
  return Slides.find({owner:this.userId},{sort:{ind:1}});
});

Meteor.publish('config', function () {
  return Config.find();
});

Meteor.publish('configForUser', function() {
  return Config.find({owner:this.userId});
})

Meteor.publish("directory", function () {
  return Meteor.users.find({});
  // return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
});

function migrateToOrder() {
  var cur = Slides.find({},{sort: {ind:1}});
  var i = 0;
  cur.forEach( function(slide){
    console.log("Slide "+slide._id+" has index "+slide.ind);
    console.log("Updating "+slide._id+" to index "+i);
    Slides.update(slide._id, {$set: {ind: i}});
    i+=1;
  })
}

function migrateToUser(userId) {
  Slides.update({owner: undefined},{$set: {owner: userId}},{multi:true});
}

function fixMyOrder() {
  console.log("About to fix order for user "+Meteor.userId());
  var cur = Slides.find({owner:Meteor.userId()},{sort: {ind:1}});
  var i = 0;
  cur.forEach( function(slide){
    console.log("Slide "+slide._id+" has index "+slide.ind);
    console.log("Updating "+slide._id+" to index "+i);
    Slides.update(slide._id, {$set: {ind: i}});
    i+=1;
  })
}

function pruneMalformedUsers() {
  var users = Meteor.users.find();
  users.map(function (user) {
    if (user.profile === undefined) {
      console.log("removing malformed user "+user._id);
      Meteor.users.remove(user._id);
    }
  })
}

function removeUser(userId) {
  var user = Meteor.users.findOne(userId);
  try {
    var name = user.profile.name;
  } catch(e) {
    console.log("profile.name undefined.");
    var name = undefined;
  }
  if (user) {
    console.log("Removing user "+userId+" with user.profile.name "+name+".");
    Meteor.users.remove(user._id);
    return "Did it."
  } else {
    return "Couldn't find user with userId "+userId+"."
  }
}

// modify this to do index integrity check when
// user logs in... 
Meteor.startup(function () {
  if (Slides.find().count() === 0) {
    var data = [
      {text: "Busy as all hell!"},
      {text: "Just chillin like a villain."},
      {text: "Back after these messages."},
      {text: "Why can't things just be easy?"}
    ];

    for (var i=0; i < data.length; i++) {
      Slides.insert({text: data[i].text});
    }
  }

  if (Config.find().count() === 0) {
    Config.insert({n:5});
    // Config.insert({currentSlide: 0});
  }

  var config = Config.findOne({});
  if (config.id === undefined) {
    console.log("config.id was undefined.");
    var newId = Slides.findOne({})._id;
    console.log("setting config.id to "+newId+".");
    Config.update(config.id, {$set: {id: newId}});
  } else {
    console.log("config.id defined: "+config.id+".");
  }

  // TODO: collectionsCheckrep();

  // migrateToOrder();
});

// create suffix LI to mean "logged in"
Meteor.methods({
  revealReset: function () {
    Config.remove({});
    Config.insert({n:3});
  },
  revealResetLI: function () {
    Config.remove({owner: Meteor.userId()});
    // set the current slide to a random one
    Config.insert({owner: Meteor.userId, id: Slides.findOne({})});
  },
  moveSlide: function (sourceIndex, targetIndex) {
    var id = Slides.findOne({ind:sourceIndex})._id;
    var movinUp = targetIndex > sourceIndex;
    shift = movinUp ? -1 : 1;
    lowerIndex = Math.min(sourceIndex, targetIndex);
    lowerIndex += movinUp ? 1 : 0;
    upperIndex = Math.max(sourceIndex, targetIndex);
    upperIndex -= movinUp ? 0 : 1;
    console.log("Shifting slides from "+lowerIndex+" to "+upperIndex+" by "+shift+".");
    Slides.update({ind: {$gte: lowerIndex,$lte: upperIndex}}, {$inc: {ind:shift}},{multi:true});
    Slides.update(id, {$set: {ind:targetIndex}});
  },
  moveSlideLI: function (sourceIndex, targetIndex) {
    var id = Slides.findOne({ind:sourceIndex,owner:Meteor.userId()})._id;
    var movinUp = targetIndex > sourceIndex;
    shift = movinUp ? -1 : 1;
    lowerIndex = Math.min(sourceIndex, targetIndex);
    lowerIndex += movinUp ? 1 : 0;
    upperIndex = Math.max(sourceIndex, targetIndex);
    upperIndex -= movinUp ? 0 : 1;
    console.log("Shifting slides from "+lowerIndex+" to "+upperIndex+" by "+shift+".");
    Slides.update({ind: {$gte: lowerIndex,$lte: upperIndex},owner:Meteor.userId()}, {$inc: {ind:shift}},{multi:true});
    Slides.update(id, {$set: {ind:targetIndex}});
  },

  // removeSlide: function (index) {
  //   var id = Slides.findOne({ind:index})._id;
  //   Slides.remove(id);
  //   Slides.update({ind: {$gt: index}}, {$inc: {ind:-1}},{multi:true});
  // },
  removeSlideId: function(theId) {
    console.log("theId is "+theId+".");
    var index = Slides.findOne(theId).ind;
    Slides.remove(theId);
    Slides.update({ind: {$gt: index}}, {$inc: {ind:-1}},{multi:true});
  },
  // leaving out owner check for now
  removeSlideIdLI: function(theId) {
    console.log("theId is "+theId+".");
    var index = Slides.findOne(theId).ind;
    Slides.remove(theId);
    Slides.update({ind: {$gt: index}}, {$inc: {ind:-1}},{multi:true});
  },
  // incremenet indices of all slides above/including lowerIndex
  shiftUp: function(lowerIndex) {
    // console.log("lowerIndex is "+lowerIndex);
    var theLowerIndex = (lowerIndex===undefined)?0:lowerIndex;
    Slides.update({ind: {$gte:theLowerIndex}},{$inc:{ind:1}},{multi:true});
  },
  shiftUpLI: function(lowerIndex) {
    // console.log("lowerIndex is "+lowerIndex);
    var theLowerIndex = (lowerIndex===undefined)?0:lowerIndex;
    Slides.update({ind: {$gte:theLowerIndex},owner:Meteor.userId()},{$inc:{ind:1}},{multi:true});
  },
  migrateToOrder: function() {
    migrateToOrder();
  },
  migrateToUser: function (userId) {
    migrateToUser(userId);
  },
  fixMyOrder: function() {
    fixMyOrder();
  },
  pruneMalformedUsers: function() {
    pruneMalformedUsers();
  },
  removeUser: function(userId) {
    removeUser(userId);
  }
});

// Accounts.onCreateUser(function(options,user) {
//   // populate collection with user's slides
//   // I was thinking one big collection... 
//   // check that profile/services are non-empty
//   // hopefully it won't be an issue...
// });
