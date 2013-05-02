getScript = function(scriptName) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', scriptName, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

menuBodyCreated = function () {
  console.log("Created menu_body.");
  eval(getScript('/js/meny.min.js'));
  document.Meny = Meny;
  Session.set('menyLoaded',false);

}

Template.menu_body.created = menuBodyCreated;

Template.menu_body.rendered = function() {
  console.log("Menu_body loaded.");
  if ($('.meny').css('display')==="none") {
    console.log("Where my meny man?");
    $('body').removeClass('meny-left');
    if (!(typeof meny === 'undefined')) {
      console.log("Clearin out the old meny.");
      delete meny;
    }
    Session.set('menyLoaded',false);
  }
  if (!(Session.get('menyLoaded'))) {
    console.log("Initializing meny.");
    meny = document.Meny.create({
      // The element that will be animated in from off screen
      menuElement: document.querySelector( '.meny' ),

      // The contents that gets pushed aside while Meny is active
      contentsElement: document.querySelector( '.theContents' ),

      // The alignment of the menu (top/right/bottom/left)
      position: 'left',

      // The height of the menu (when using top/bottom position)
      height: 200,

      // The width of the menu (when using left/right position)
      width: 260,
      overlap: 5
    });
    Session.set('menyLoaded',true);
  }
}

Template.slide_list.slides = function () {return Slides.find({},{sort: {ind:1}})};

// Template.slide.events({
//   'mousedown .slide': function () {
//     var sel = '#'+this._id;
//     var oldSel = '#'+Session.get('selectedSlide');
//     $(sel).toggleClass('selected-slide');
//     // logic to "deselect" the session variable
//     if (Session.get('selectedSlide') === this._id) {
//       Session.set('selectedSlide',undefined);
//     } else {
//       $(oldSel).removeClass('selected-slide');
//       Session.set('selectedSlide',this._id);
//     }
//   }
// });

Template.menu.events({
  'click a': function() {
    console.log("Clicked one of the links.");
    meny.close();
  },
  'click h2': function () {
    console.log("Clicked the heading.");
  }
});

Template.slide.events({
  'click .destroy': function () {
    console.log("Clicked destroy element.");
    console.log(this);
    nextSlide();
    Meteor.call('removeSlideId',this._id); //could use id...
      // Slides.remove(this._id);
  },
  'click .show-slide': function () {
    console.log("Clicked show-slide element.");
    gotoSlideId(this._id);
  },
  'click .slide': function () {
    var clicked = this._id;
    var oldSelected = Session.get('selectedSlide');
    if (clicked === oldSelected) {
      console.log("deselecting, now nothing selected 257.");
      Session.set('selectedSlide',undefined);
    } else {
      Session.set('selectedSlide',clicked);
    }
  }
});

// Template.slide.showing = function() {
//   var cs = parseInt(currentSlide()) - 1;
//   if (this.ind === cs) {
//     return "showing-slide";
//   } else {
//     return "";
//   }
// }

Template.slide.showing = function() {
  var cid = getShowingSlideId();
  if (this._id === cid) {
    console.log("Found it! 4757");
    return "showing-slide";
  } else {
    return "";
  }
}

Template.slide.selected = function() {
  if (this._id === Session.get('selectedSlide')) {
    return "selected-slide";
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
  return currentSlideInd();
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
      var spaceAt;
      if (Session.get('selectedSlide') === undefined) {
        spaceAt = 0;
      } else {
        spaceAt = parseInt(slideInd(Session.get('selectedSlide')))+1;
      }
      // insert high, so it goes right to the right place
      var newId = Slides.insert({
        text: text,
        ind: spaceAt-1,
        owner: Meteor.userId()
      });
      // adjust when the remote call returns.
      Meteor.call('shiftUpLI',spaceAt, function(error,result) {
        Slides.update(newId,{$set: {ind:spaceAt}});          
      });
      Session.set('selectedSlide',newId);
      evt.target.value = ''; // I think this was some magic so touch punch would work.
    }
  }
));


