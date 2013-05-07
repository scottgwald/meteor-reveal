getScript = function(scriptName) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', scriptName, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

evalScript = function(scriptName, callback) {
  console.log("evalScript "+scriptName);
  var xhr = new XMLHttpRequest();
  xhr.open('GET',scriptName,false);
  xhr.onreadystatechange = function () {
    if (this.readyState == 2) {
      console.log("Evaluating "+scriptName);
      eval(xhr.responseText);
      callback();
    }
  }
}

// revealInit = function() {
//   Session.set('configLoaded',false);
//   Session.set('configID', Config.findOne({})._id);
//   Session.set('configLoaded',true);  
// }

revealInit = function() {
  Session.set('configLoaded',false);
  Session.set('configID', Config.findOne({})._id);
  Session.set('configLoaded',true);  
}

Template.reveal_arg.autoSlide = function() {
  console.log("Evaluating reveal_arg.autoSlide.");
  return Session.get('publicAutoSlide');
};

Template.reveal.slides = function () {return Slides.find({}, {sort: {ind:1}})};
Template.reveals.slides = function () {return Slides.find({}, {sort: {ind:1}})};
Template.reveal_arg.slides = function () {
  var arg = Session.get('slideDeck');
  switch (arg) {
    case 'onePerUser':
      console.log("Case onePerUser activated.");
      return currentSlides.find({});
      break;
    case 'handSelected':
      console.log("Case handSelected activated");
      // grab three random people
      var crs = Directory.find({},{limit:5});
      var usr = crs.map(function (user) {return user._id});
      Session.set('handSelected',usr);
      return currentSlides.find({owner: {$in: Session.get('handSelected')}});
    default:
      return Slides.find({},{sort: {ind:1}});
      break;
  }
};

dirUserExists = function(userId) {
    return (!(Directory.find(userId).count() === 0));
}

// could check if "this" is undefined..
Template.reveal_arg_slide.user = function () {
  if (this.hasOwnProperty('owner') && dirUserExists(this.owner)) {
    var userObj = Directory.findOne(this.owner);
    if (userObj.hasOwnProperty('displayName')) {
      return userObj.displayName;
    }
  }
  return "No display name available."; //shouldn't happen
}

// Template.reveal_arg_slide.user = function() {
//   if (this.hasOwnProperty('owner') && dirUserExists(this.owner)) {
//     var userObj = Directory.findOne(this.owner);
//     if (userObj.hasOwnProperty('name') && !(userObj.name===undefined)) {
//       return userObj.name;
//     }
//     if (userObj.hasOwnProperty('email')) {
//       return userObj.email;
//     }
//   }
//   return "No user available.";
// }

Template.reveal.ind = function () {return 1};

Template.reveal_panels.text = function () {
  return currentSlideText();
}

Template.reveal_panels.nextText = function () {
  return nextSlideText();
}

Template.current_slide.currentSlide = function () {
  return currentSlideInd();
}

revealCreated = function() {
  console.log("Reveal template instantiated.");
  eval(getScript('/js/reveal.min.js'));
  document.Reveal = Reveal;
  console.log(Reveal);
  // addAutoToggle();  
}

revealsCreated = function() {
  console.log("Reveal template instantiated.");
  eval(getScript('/js/reveal.min.js'));
  Reveal.vrsn = "This is the one.";
  console.log("This is ..."+Reveal.vrsn);
  document.Reveal = Reveal;
  // console.log(Reveal);  
  eval(getScript('/js/reveal.min.js'));
  Reveal.vrsn = "This is the other.";
  document.Reveal1 = Reveal;
}

Template.reveal.created = revealCreated;
Template.reveal_arg.created = revealCreated;
Template.reveals.created = revealsCreated;

// Template.reveal.created = function () {
//   console.log("Reveal template instantiated.");
//   eval(getScript('/js/reveal.min.js'));
//   document.Reveal = Reveal;
//   console.log(Reveal);
// }

initializeButtonPanel = function () {
  console.log("Initializing button panel.");
  // if (!(document.Reveal.getConfig().autoSlide === 0)) {
  if (!(Session.get('publicAutoSlide')===0)) {
      $('.auto-button').addClass('enabled');
  }
}

// Deps.autorun(function() {
//   console.log("Detected change in Session variable 'publicAutoSlide'.");
//   if (!(typeof document.Reveal === 'undefined')){
//     console.log("Setting autoSlide accordingly.");
//     document.Reveal.configure({autoSlide: Session.get('publicAutoSlide')});
//   } else {
//     console.log("But Reveal isn't loaded yet, so maybe next time around.");
//   }
// });

// Template.button_panel.initialize = function () {
//   console.log("Initializing button panel.");
//   if (!(document.Reveal.getConfig().autoSlide === 0)) {
//     $('.auto-button').addClass('enabled');
//   }
// }

Template.button_panel.events({
  'click .button-panel .auto-button': function (event) {
    console.log("Clicked auto-button element.");
    // console.log(event.target);
    // console.log($(event.target).hasClass('auto-button'));
    var self = $(event.target);
    self.toggleClass('enabled');
    if (self.hasClass('enabled')) {
      console.log("Enabling autoSlide.");
      Session.set('publicAutoSlide',20000);
      // document.Reveal.configure({autoSlide: 20000, loop: true});
    } else {
      console.log("Disabling autoslide.");
      Session.set('publicAutoSlide',0);
      // document.Reveal.configure({autoSlide: 0});
    }
  }
    // if (event.target.)
    // $(this.id).toggleClass('enabled');
});

revealRendered = function() {
  /**
      Head JS     The only script in your <HEAD>
      Copyright   Tero Piirainen (tipiirai)
      License     MIT / http://bit.ly/mit-license
      Version     0.96

      http://headjs.com
  */
  (function(a){function z(){d||(d=!0,s(e,function(a){p(a)}))}function y(c,d){var e=a.createElement("script");e.type="text/"+(c.type||"javascript"),e.src=c.src||c,e.async=!1,e.onreadystatechange=e.onload=function(){var a=e.readyState;!d.done&&(!a||/loaded|complete/.test(a))&&(d.done=!0,d())},(a.body||b).appendChild(e)}function x(a,b){if(a.state==o)return b&&b();if(a.state==n)return k.ready(a.name,b);if(a.state==m)return a.onpreload.push(function(){x(a,b)});a.state=n,y(a.url,function(){a.state=o,b&&b(),s(g[a.name],function(a){p(a)}),u()&&d&&s(g.ALL,function(a){p(a)})})}function w(a,b){a.state===undefined&&(a.state=m,a.onpreload=[],y({src:a.url,type:"cache"},function(){v(a)}))}function v(a){a.state=l,s(a.onpreload,function(a){a.call()})}function u(a){a=a||h;var b;for(var c in a){if(a.hasOwnProperty(c)&&a[c].state!=o)return!1;b=!0}return b}function t(a){return Object.prototype.toString.call(a)=="[object Function]"}function s(a,b){if(!!a){typeof a=="object"&&(a=[].slice.call(a));for(var c=0;c<a.length;c++)b.call(a,a[c],c)}}function r(a){var b;if(typeof a=="object")for(var c in a)a[c]&&(b={name:c,url:a[c]});else b={name:q(a),url:a};var d=h[b.name];if(d&&d.url===b.url)return d;h[b.name]=b;return b}function q(a){var b=a.split("/"),c=b[b.length-1],d=c.indexOf("?");return d!=-1?c.substring(0,d):c}function p(a){a._done||(a(),a._done=1)}var b=a.documentElement,c,d,e=[],f=[],g={},h={},i=a.createElement("script").async===!0||"MozAppearance"in a.documentElement.style||window.opera,j=window.head_conf&&head_conf.head||"head",k=window[j]=window[j]||function(){k.ready.apply(null,arguments)},l=1,m=2,n=3,o=4;i?k.js=function(){var a=arguments,b=a[a.length-1],c={};t(b)||(b=null),s(a,function(d,e){d!=b&&(d=r(d),c[d.name]=d,x(d,b&&e==a.length-2?function(){u(c)&&p(b)}:null))});return k}:k.js=function(){var a=arguments,b=[].slice.call(a,1),d=b[0];if(!c){f.push(function(){k.js.apply(null,a)});return k}d?(s(b,function(a){t(a)||w(r(a))}),x(r(a[0]),t(d)?d:function(){k.js.apply(null,b)})):x(r(a[0]));return k},k.ready=function(b,c){if(b==a){d?p(c):e.push(c);return k}t(b)&&(c=b,b="ALL");if(typeof b!="string"||!t(c))return k;var f=h[b];if(f&&f.state==o||b=="ALL"&&u()&&d){p(c);return k}var i=g[b];i?i.push(c):i=g[b]=[c];return k},k.ready(a,function(){u()&&s(g.ALL,function(a){p(a)}),k.feature&&k.feature("domloaded",!0)});if(window.addEventListener)a.addEventListener("DOMContentLoaded",z,!1),window.addEventListener("load",z,!1);else if(window.attachEvent){a.attachEvent("onreadystatechange",function(){a.readyState==="complete"&&z()});var A=1;try{A=window.frameElement}catch(B){}!A&&b.doScroll&&function(){try{b.doScroll("left"),z()}catch(a){setTimeout(arguments.callee,1);return}}(),window.attachEvent("onload",z)}!a.readyState&&a.addEventListener&&(a.readyState="loading",a.addEventListener("DOMContentLoaded",handler=function(){a.removeEventListener("DOMContentLoaded",handler,!1),a.readyState="complete"},!1)),setTimeout(function(){c=!0,s(f,function(a){a()})},300)})(document)

  document.Reveal.initialize({
    controls: true,
    progress: true,
    history: true,
    center: true,
    loop: true,
    // width: "40%",
    idSel: "",

    theme: document.Reveal.getQueryHash().theme, // available themes are in /css/theme
    transition: document.Reveal.getQueryHash().transition || 'default', // default/cube/page/concave/zoom/linear/fade/none

    // Optional libraries used to extend on reveal.js
    dependencies: [
      { src: 'lib/js/classList.js', condition: function() { return !document.body.classList; } }
    ]
  });

  // this could be accelerated if necessary
  if (Session.get("configLoaded")) {
    var curr = currentSlideInd()+1;
    // console.log("setting hash to "+curr);
    window.location.hash = "#/"+curr;  
  }  
  initializeButtonPanel();
  // addAutoToggle();
}

revealArgRendered = function() {
  /**
      Head JS     The only script in your <HEAD>
      Copyright   Tero Piirainen (tipiirai)
      License     MIT / http://bit.ly/mit-license
      Version     0.96

      http://headjs.com
  */
  (function(a){function z(){d||(d=!0,s(e,function(a){p(a)}))}function y(c,d){var e=a.createElement("script");e.type="text/"+(c.type||"javascript"),e.src=c.src||c,e.async=!1,e.onreadystatechange=e.onload=function(){var a=e.readyState;!d.done&&(!a||/loaded|complete/.test(a))&&(d.done=!0,d())},(a.body||b).appendChild(e)}function x(a,b){if(a.state==o)return b&&b();if(a.state==n)return k.ready(a.name,b);if(a.state==m)return a.onpreload.push(function(){x(a,b)});a.state=n,y(a.url,function(){a.state=o,b&&b(),s(g[a.name],function(a){p(a)}),u()&&d&&s(g.ALL,function(a){p(a)})})}function w(a,b){a.state===undefined&&(a.state=m,a.onpreload=[],y({src:a.url,type:"cache"},function(){v(a)}))}function v(a){a.state=l,s(a.onpreload,function(a){a.call()})}function u(a){a=a||h;var b;for(var c in a){if(a.hasOwnProperty(c)&&a[c].state!=o)return!1;b=!0}return b}function t(a){return Object.prototype.toString.call(a)=="[object Function]"}function s(a,b){if(!!a){typeof a=="object"&&(a=[].slice.call(a));for(var c=0;c<a.length;c++)b.call(a,a[c],c)}}function r(a){var b;if(typeof a=="object")for(var c in a)a[c]&&(b={name:c,url:a[c]});else b={name:q(a),url:a};var d=h[b.name];if(d&&d.url===b.url)return d;h[b.name]=b;return b}function q(a){var b=a.split("/"),c=b[b.length-1],d=c.indexOf("?");return d!=-1?c.substring(0,d):c}function p(a){a._done||(a(),a._done=1)}var b=a.documentElement,c,d,e=[],f=[],g={},h={},i=a.createElement("script").async===!0||"MozAppearance"in a.documentElement.style||window.opera,j=window.head_conf&&head_conf.head||"head",k=window[j]=window[j]||function(){k.ready.apply(null,arguments)},l=1,m=2,n=3,o=4;i?k.js=function(){var a=arguments,b=a[a.length-1],c={};t(b)||(b=null),s(a,function(d,e){d!=b&&(d=r(d),c[d.name]=d,x(d,b&&e==a.length-2?function(){u(c)&&p(b)}:null))});return k}:k.js=function(){var a=arguments,b=[].slice.call(a,1),d=b[0];if(!c){f.push(function(){k.js.apply(null,a)});return k}d?(s(b,function(a){t(a)||w(r(a))}),x(r(a[0]),t(d)?d:function(){k.js.apply(null,b)})):x(r(a[0]));return k},k.ready=function(b,c){if(b==a){d?p(c):e.push(c);return k}t(b)&&(c=b,b="ALL");if(typeof b!="string"||!t(c))return k;var f=h[b];if(f&&f.state==o||b=="ALL"&&u()&&d){p(c);return k}var i=g[b];i?i.push(c):i=g[b]=[c];return k},k.ready(a,function(){u()&&s(g.ALL,function(a){p(a)}),k.feature&&k.feature("domloaded",!0)});if(window.addEventListener)a.addEventListener("DOMContentLoaded",z,!1),window.addEventListener("load",z,!1);else if(window.attachEvent){a.attachEvent("onreadystatechange",function(){a.readyState==="complete"&&z()});var A=1;try{A=window.frameElement}catch(B){}!A&&b.doScroll&&function(){try{b.doScroll("left"),z()}catch(a){setTimeout(arguments.callee,1);return}}(),window.attachEvent("onload",z)}!a.readyState&&a.addEventListener&&(a.readyState="loading",a.addEventListener("DOMContentLoaded",handler=function(){a.removeEventListener("DOMContentLoaded",handler,!1),a.readyState="complete"},!1)),setTimeout(function(){c=!0,s(f,function(a){a()})},300)})(document)
  if (Session.get('publicAutoSlide')===undefined) {
    Session.set('publicAutoSlide',20000)
  }
  var autoSlideInt = Session.get('publicAutoSlide');
  document.Reveal.initialize({
    controls: true,
    progress: true,
    history: true,
    center: true,
    // width: "40%",
    idSel: "",
    autoSlide: autoSlideInt,
    loop: true,

    theme: document.Reveal.getQueryHash().theme, // available themes are in /css/theme
    transition: document.Reveal.getQueryHash().transition || 'default', // default/cube/page/concave/zoom/linear/fade/none

    // Optional libraries used to extend on reveal.js
    dependencies: [
      { src: 'lib/js/classList.js', condition: function() { return !document.body.classList; } }
    ]
  });

  // this could be accelerated if necessary
  // if (Session.get("configLoaded")) {
  //   var curr = currentSlideInd()+1;
  //   // console.log("setting hash to "+curr);
  //   window.location.hash = "#/"+curr;  
  // }  
  initializeButtonPanel();
}

revealsRendered = function() {
  /**
      Head JS     The only script in your <HEAD>
      Copyright   Tero Piirainen (tipiirai)
      License     MIT / http://bit.ly/mit-license
      Version     0.96

      http://headjs.com
  */
  (function(a){function z(){d||(d=!0,s(e,function(a){p(a)}))}function y(c,d){var e=a.createElement("script");e.type="text/"+(c.type||"javascript"),e.src=c.src||c,e.async=!1,e.onreadystatechange=e.onload=function(){var a=e.readyState;!d.done&&(!a||/loaded|complete/.test(a))&&(d.done=!0,d())},(a.body||b).appendChild(e)}function x(a,b){if(a.state==o)return b&&b();if(a.state==n)return k.ready(a.name,b);if(a.state==m)return a.onpreload.push(function(){x(a,b)});a.state=n,y(a.url,function(){a.state=o,b&&b(),s(g[a.name],function(a){p(a)}),u()&&d&&s(g.ALL,function(a){p(a)})})}function w(a,b){a.state===undefined&&(a.state=m,a.onpreload=[],y({src:a.url,type:"cache"},function(){v(a)}))}function v(a){a.state=l,s(a.onpreload,function(a){a.call()})}function u(a){a=a||h;var b;for(var c in a){if(a.hasOwnProperty(c)&&a[c].state!=o)return!1;b=!0}return b}function t(a){return Object.prototype.toString.call(a)=="[object Function]"}function s(a,b){if(!!a){typeof a=="object"&&(a=[].slice.call(a));for(var c=0;c<a.length;c++)b.call(a,a[c],c)}}function r(a){var b;if(typeof a=="object")for(var c in a)a[c]&&(b={name:c,url:a[c]});else b={name:q(a),url:a};var d=h[b.name];if(d&&d.url===b.url)return d;h[b.name]=b;return b}function q(a){var b=a.split("/"),c=b[b.length-1],d=c.indexOf("?");return d!=-1?c.substring(0,d):c}function p(a){a._done||(a(),a._done=1)}var b=a.documentElement,c,d,e=[],f=[],g={},h={},i=a.createElement("script").async===!0||"MozAppearance"in a.documentElement.style||window.opera,j=window.head_conf&&head_conf.head||"head",k=window[j]=window[j]||function(){k.ready.apply(null,arguments)},l=1,m=2,n=3,o=4;i?k.js=function(){var a=arguments,b=a[a.length-1],c={};t(b)||(b=null),s(a,function(d,e){d!=b&&(d=r(d),c[d.name]=d,x(d,b&&e==a.length-2?function(){u(c)&&p(b)}:null))});return k}:k.js=function(){var a=arguments,b=[].slice.call(a,1),d=b[0];if(!c){f.push(function(){k.js.apply(null,a)});return k}d?(s(b,function(a){t(a)||w(r(a))}),x(r(a[0]),t(d)?d:function(){k.js.apply(null,b)})):x(r(a[0]));return k},k.ready=function(b,c){if(b==a){d?p(c):e.push(c);return k}t(b)&&(c=b,b="ALL");if(typeof b!="string"||!t(c))return k;var f=h[b];if(f&&f.state==o||b=="ALL"&&u()&&d){p(c);return k}var i=g[b];i?i.push(c):i=g[b]=[c];return k},k.ready(a,function(){u()&&s(g.ALL,function(a){p(a)}),k.feature&&k.feature("domloaded",!0)});if(window.addEventListener)a.addEventListener("DOMContentLoaded",z,!1),window.addEventListener("load",z,!1);else if(window.attachEvent){a.attachEvent("onreadystatechange",function(){a.readyState==="complete"&&z()});var A=1;try{A=window.frameElement}catch(B){}!A&&b.doScroll&&function(){try{b.doScroll("left"),z()}catch(a){setTimeout(arguments.callee,1);return}}(),window.attachEvent("onload",z)}!a.readyState&&a.addEventListener&&(a.readyState="loading",a.addEventListener("DOMContentLoaded",handler=function(){a.removeEventListener("DOMContentLoaded",handler,!1),a.readyState="complete"},!1)),setTimeout(function(){c=!0,s(f,function(a){a()})},300)})(document)

  document.Reveal.initialize({
    controls: true,
    progress: true,
    history: true,
    center: true,
    width: "100%",
    idSel: "#rvl0",

    theme: document.Reveal.getQueryHash().theme, // available themes are in /css/theme
    transition: document.Reveal.getQueryHash().transition || 'concave', // default/cube/page/concave/zoom/linear/fade/none

    // Optional libraries used to extend on reveal.js
    dependencies: [
      { src: 'lib/js/classList.js', condition: function() { return !document.body.classList; } }
    ]
  });

  document.Reveal1.initialize({
    controls: true,
    progress: true,
    history: true,
    center: true,
    width: "100%",
    idSel: "#rvl1",

    theme: document.Reveal1.getQueryHash().theme, // available themes are in /css/theme
    transition: document.Reveal1.getQueryHash().transition || 'default', // default/cube/page/concave/zoom/linear/fade/none

    // Optional libraries used to extend on reveal.js
    dependencies: [
      { src: 'lib/js/classList.js', condition: function() { return !document.body.classList; } }
    ]
  });

  $("#rvl0").css({position:'absolute',left:'500px', top:'0px'});
  $("#rvl1").css({position:'absolute',left:'0px', top:'0px'});

  $(".reveal").css("height","500");
  $(".reveal").css("width","500");

  // this could be accelerated if necessary
  if (Session.get("configLoaded")) {
    var curr = currentSlideInd()+1;
    // console.log("setting hash to "+curr);
    window.location.hash = "#/"+curr;  
  }  
}


Template.reveal.rendered = revealRendered;
Template.reveals.rendered = revealsRendered;
Template.reveal_arg.rendered = revealArgRendered;
