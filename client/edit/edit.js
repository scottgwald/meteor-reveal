Template.slide_list.slides = function () {return Slides.find({},{sort: {ind:1}})};

Template.slide.events({
  'mousedown .slide': function () {
    var sel = '#'+this._id;
    var oldSel = '#'+Session.get('selectedSlide');
    $(sel).toggleClass('selected-slide');
    if (Session.get('selectedSlide') === this._id) {
      Session.set('selectedSlide',undefined);
    } else {
      $(oldSel).removeClass('selected-slide');
      Session.set('selectedSlide',this._id);
    }
  }
});

Template.slide.showing = function() {
  var cs = parseInt(currentSlide()) - 1;
  if (this.ind === cs) {
    return "showing-slide";
  } else {
    return "";
  }
}

Template.slide_list.rendered = function () {
  $('#'+Session.get('selectedSlide')).addClass('selected-slide');
  $('#slide-list').sortable({
    axis:'y',
    update: function(event,ui) {
      // var item = ui.item[0];
      // console.log(item);
      // NEED TO ADJUST THIS FOR INDEX REVERSAL...
      // ALTERNATIVE WOULD BE TO GIVE NEW SLIDES INDEX = 0
      // INSTEAD OF HAVE REVERSE SORTED INDS IN THE DOM
      moveSlide(parseInt(ui.item.attr('ind')),parseInt(ui.item.index()));
      if (ui.item.hasClass('showing-slide')) {
        console.log("Moved the showing slide.");
        gotoSlide(parseInt(ui.item.index()));
      }
      console.log("Moved item with id "+ui.item.attr('id')+" and index "+ui.item.attr('ind')+" to new position "+ui.item.index()+"."); 
    }});
}

Template.show_nav.currentSlide = function () {
  return currentSlide();
}

Template.show_nav.events({
  'click .button-left': function () {
    previousSlide();
  },
  'click .button-right': function () {
    nextSlide();
  },
  'click .shift-up': function () {
    //move selected slide up
    var thisInd = parseInt($(".selected-slide").attr('ind'));
    console.log("current index is "+thisInd+".");
    swapSlides(thisInd,thisInd-1);
  },
  'click .shift-down': function () {
    //move selected slide down
    var thisInd = parseInt($(".selected-slide").attr('ind'));
    var thisId = $(".selected-slide").attr('id');    
    swapSlides(thisInd,thisInd+1);
    $("#"+thisId).addClass('selected-slide'); //select slide after swap. Might need session var?
  }
});

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
      Meteor.call('shiftUp');
      Slides.insert({
        text: text,
        ind: 0 //Slides.find().count()
      });
      evt.target.value = '';
    }
  }
));

Template.slide.events({
  'click .destroy': function () {
      Meteor.call('removeSlide',this.ind); //could use id...
      // Slides.remove(this._id);
  },
  'click .show-slide': function () {
    gotoSlide(this.ind);
  }
});
