// Lists -- {name: String}
Slides = new Meteor.Collection("slides");
Config = new Meteor.Collection("config");

// Publish complete set of lists to all clients.
Meteor.publish('slides', function () {
  return Slides.find({}, {sort: {ind:1}});
});

Meteor.publish('config', function () {
  return Config.find();
})

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

  migrateToOrder();
});

Meteor.methods({
  revealReset: function () {
    Config.remove({});
    Config.insert({n:3});
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
  removeSlide: function (index) {
    var id = Slides.findOne({ind:index})._id;
    Slides.remove(id);
    Slides.update({ind: {$gt: index}}, {$inc: {ind:-1}},{multi:true});
  },
  removeSlideId: function(theId) {
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
  migrateToOrder: function() {
    migrateToOrder();
  }
});
