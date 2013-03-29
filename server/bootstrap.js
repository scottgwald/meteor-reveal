// Lists -- {name: String}
Slides = new Meteor.Collection("slides");

// // Publish complete set of lists to all clients.
// Meteor.publish('slides', function () {
//   return Slides.find();
// });

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
});
