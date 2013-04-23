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

// Meteor.publish("directory", function () {
//     // return Meteor.users.find({});
//   return Meteor.users.find({}, {fields: {'profile.name':1, 'services.google.email': 1}});
// });

Meteor.publish("userInDetail", function() {
  return Meteor.users.find(this.userId);
  // return Meteor.users.find({_id:this.userId}).fetch(); //, {fields: {'createdAt':1, 'services.password':1}});
})
 
Meteor.publish("directory-email", function () {
  var self = this;
  var initializing = true;
  var handle = Meteor.users.find({}).observeChanges({
    added: function (doc, idx) {
      console.log("doc is "+doc);
      console.log("idx is "+idx);
      self.added("directory", doc, {user: doc, email: idx.emails[0].address});
    },
    removed: function (doc, idx) {
      self.removed("directory", doc._id); // correct syntax?
    }
    // ignore changed for now
  });
  initializing = false;
  self.ready();
  self.onStop( function() {
    handle.stop();
  });
});

Meteor.publish("directory-name-email", function () {
  var self = this;
  var initializing = true;
  var handle = Meteor.users.find().observeChanges({
    added: function (doc, idx) {
      self.added("directory",doc, {user: doc, name: idx.profile.name, email: idx.services.google.email});
    },
    removed: function (doc, idx) {
      self.removed("directory", doc._id); // correct syntax?
    }
    // ignore changed for now
  });
  initializing = false;
  self.ready();
  self.onStop( function() {
    handle.stop();
  });
});

// downside of this as we scale is that each user needs its own process
// but is that the case anyway when you're keeping a socket alive for each user?
//
// changes happen when someone changes their current slide
Meteor.publish("all-users-current-slides", function () {
  var self = this;
  var initializing = true; 
  // fields prevents future additional config fields from triggering
  var handle = Config.find({},{fields: {owner:1, ind: 1,id: 1}}).observeChanges({
    // added: initialization, or when a new user is created.
    added: function (doc, idx) {
      //this doc is the id of a config object.
      var defaultSlide = {owner: idx.owner, text: "Nothing to say yet.", ind:1729};
      try {
        var theSlide = Slides.findOne(idx.id);
      }  catch(e) {
        console.log("No slide found for user "+idx.owner+".");
        console.log("Using default.");
        var theSlide = {owner: idx.owner, text: "Nothing to say yet.", ind:1729};
      }
      if (theSlide === undefined || theSlide.owner === undefined || theSlide.text === undefined) {
        console.log("Got a bad slide, argh! "+theSlide+".");
        theSlide = defaultSlide;
      }
      // probably want some error-catching here.
      // forget about index for now
      console.log("This is the slide "+JSON.stringify(theSlide)+".");
      self.added("current-slides", theSlide.owner /* will be `doc` */ , theSlide);
    },
    // when a user is removed ... will almost never happen
    removed: function (doc, idx) {
      if (!(idx.owner === undefined)) {
        self.removed("current-slides", idx.owner);
      }
    },
    // just rewrite the whole slide object if there are any changes
    // remember, doc and idx are the Config object, not the slide.
    changed: function (doc, idx) {
      var theSlide = Slides.findOne(idx.id); // probably want some error-catching here.
      console.log("About to change slide "+theSlide.owner+".");
      try {
        self.changed("current-slides", theSlide.owner /* will be `doc` */, theSlide);              
      } catch(e) {
        console.log(e);
        self.added("current-slides", theSlide.owner /* will be `doc` */, theSlide);                      
      }
    }
  });
  initializing = false;
  self.ready();
  self.onStop( function() {
    handle.stop();
  });
});

// Config.findOne(Session.get('configID')).id;

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

function pruneMalformedConfigs() {
  var configs = Config.find();
  configs.map(function (conf) {
    if (conf.owner === undefined || conf.id === undefined) {
      console.log("Removing malformed config object with id "+conf._id+".");
      Config.remove(conf._id);
    };
    if (Meteor.users.findOne(conf.owner) === undefined) {
      console.log("Removing orphaned config object with id "+conf._id+".");
      Config.remove(conf._id);
    };
    if (Slides.findOne(conf.id) === undefined) {
      console.log("Removing config object that refers to unknown slide"+conf._id+".");
      Config.remove(conf._id);      
    }
  })
}

// todo: remove config object also
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
  },
  getUsers: function() {
    return Meteor.users.find().fetch();
    // use Meteor.call('getUsers',function(err,data) {Session.set('meteorUsers',data)}) on the client
  },
  getConfigs: function() {
    return Config.find().fetch();
    // use Meteor.call('getConfigs',function(err,data) {Session.set('meteorConfig',data)})
  },
  pruneMalformedConfigs: function () {
    pruneMalformedConfigs();
  }
});

// Accounts.onCreateUser(function(options,user) {
//   // populate collection with user's slides
//   // I was thinking one big collection... 
// });
