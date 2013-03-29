Slides = new Meteor.Collection("slides");

Template.slide_list.slides = function () {return Slides.find({})};

var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };

  return events;
};

Template.slide_list.events(okCancelEvents(
  '#new-slide',
  {
    ok: function (text, evt) {
      Slides.insert({
        text: text
      });
      evt.target.value = '';
    }
  }
));

Template.slide.events({
  'click .destroy': function () {
      Slides.remove(this._id);
  }
});

















