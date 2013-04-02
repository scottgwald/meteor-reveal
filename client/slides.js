Session.set('configLoaded',false);
Slides = new Meteor.Collection('slides');
Config = new Meteor.Collection('config');

Meteor.subscribe('slides');

Meteor.subscribe('config', function onComplete() {
  revealInit();
})

function revealInit() {
  Session.set('configLoaded',false);
  Session.set('configID', Config.findOne({})._id);
  Session.set('configLoaded',true);  
}

function nextSlide() {
  Config.update(Session.get('configID'),{$inc: {n:1}});
  return currentSlide();
}

function previousSlide() {
  Config.update(Session.get('configID'),{$inc: {n:-1}});
  return currentSlide();
}

function currentSlide() {
  if (! Session.get("configLoaded")) {
    return -1;
  }  else {
    return Config.findOne(Session.get('configID')).n;
  }
}

function revealReset() {
  Session.set('configLoaded',false);
  Meteor.call('revealReset', function (error, result) {
    revealInit();    
  });
  // Config.remove({});
  // Config.insert({n:3});
}

Template.slide_list.slides = function () {return Slides.find({})};
Template.reveal.slides = function () {return Slides.find({})};

Template.slide.events({
  'click .slide': function () {
    console.log(this._id);
    var sel = '#'+this._id;
    $('.selected-slide').removeClass('selected-slide');
    $(sel).addClass('selected-slide');
  }
});

// Template.current_slide.configLoaded = function () {
//   return Session.get('configLoaded');
// }

Template.current_slide.currentSlide = function () {
  return currentSlide();
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
  }
});

// Template.current_slide.currentSlide = function () {
//   return Config.find().count();
// }

// Template.current_slide.currentSlide = function () {
//   // Session.setDefault("configID", Config.findOne({})._id);
//   // return Config.findOne({_id: Session.get("configID")}).currentSlide;
//   return Config.findOne({}).currentSlide;
// }

// For now:
// next: Config.insert({});
// previous: Config.remove(Config.findOne()._id)
// current: Config.find().count();

// Config.update({_id: Config.findOne({})._id}, {$set: {currentSlide: 2}})
// Config.findOne({}).currentSlide

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
      // Config.insert({});
      // TODO: why doesn't this work?
      // Config.update({}, {$inc: {currentSlide: 1}});
    }
  }
));

Template.slide.events({
  'click .destroy': function () {
      Slides.remove(this._id);
  }
});

// function revealHashChange() {
//   $('window').console.log("yoohoo! hash changed "+window.location.hash)
// }

// Template.reveal.bindHashChange = function () {
//   $('window').on('hashchange', revealHashChange);
// }
Template.reveal.created = function () {
  $(window).bind('hashchange', function () {
    console.log("hash changed "+window.location.hash);
  });
}

Template.reveal.rendered = function () {
// Template.reveal.rendered = function () {
  // $('<script>',{'src': 'js/reveal.min.js'}).appendTo('body');
  // $('<script>',{'src': 'lib/js/head.min.js'}).appendTo('body');

  /**
      Head JS     The only script in your <HEAD>
      Copyright   Tero Piirainen (tipiirai)
      License     MIT / http://bit.ly/mit-license
      Version     0.96

      http://headjs.com
  */
  (function(a){function z(){d||(d=!0,s(e,function(a){p(a)}))}function y(c,d){var e=a.createElement("script");e.type="text/"+(c.type||"javascript"),e.src=c.src||c,e.async=!1,e.onreadystatechange=e.onload=function(){var a=e.readyState;!d.done&&(!a||/loaded|complete/.test(a))&&(d.done=!0,d())},(a.body||b).appendChild(e)}function x(a,b){if(a.state==o)return b&&b();if(a.state==n)return k.ready(a.name,b);if(a.state==m)return a.onpreload.push(function(){x(a,b)});a.state=n,y(a.url,function(){a.state=o,b&&b(),s(g[a.name],function(a){p(a)}),u()&&d&&s(g.ALL,function(a){p(a)})})}function w(a,b){a.state===undefined&&(a.state=m,a.onpreload=[],y({src:a.url,type:"cache"},function(){v(a)}))}function v(a){a.state=l,s(a.onpreload,function(a){a.call()})}function u(a){a=a||h;var b;for(var c in a){if(a.hasOwnProperty(c)&&a[c].state!=o)return!1;b=!0}return b}function t(a){return Object.prototype.toString.call(a)=="[object Function]"}function s(a,b){if(!!a){typeof a=="object"&&(a=[].slice.call(a));for(var c=0;c<a.length;c++)b.call(a,a[c],c)}}function r(a){var b;if(typeof a=="object")for(var c in a)a[c]&&(b={name:c,url:a[c]});else b={name:q(a),url:a};var d=h[b.name];if(d&&d.url===b.url)return d;h[b.name]=b;return b}function q(a){var b=a.split("/"),c=b[b.length-1],d=c.indexOf("?");return d!=-1?c.substring(0,d):c}function p(a){a._done||(a(),a._done=1)}var b=a.documentElement,c,d,e=[],f=[],g={},h={},i=a.createElement("script").async===!0||"MozAppearance"in a.documentElement.style||window.opera,j=window.head_conf&&head_conf.head||"head",k=window[j]=window[j]||function(){k.ready.apply(null,arguments)},l=1,m=2,n=3,o=4;i?k.js=function(){var a=arguments,b=a[a.length-1],c={};t(b)||(b=null),s(a,function(d,e){d!=b&&(d=r(d),c[d.name]=d,x(d,b&&e==a.length-2?function(){u(c)&&p(b)}:null))});return k}:k.js=function(){var a=arguments,b=[].slice.call(a,1),d=b[0];if(!c){f.push(function(){k.js.apply(null,a)});return k}d?(s(b,function(a){t(a)||w(r(a))}),x(r(a[0]),t(d)?d:function(){k.js.apply(null,b)})):x(r(a[0]));return k},k.ready=function(b,c){if(b==a){d?p(c):e.push(c);return k}t(b)&&(c=b,b="ALL");if(typeof b!="string"||!t(c))return k;var f=h[b];if(f&&f.state==o||b=="ALL"&&u()&&d){p(c);return k}var i=g[b];i?i.push(c):i=g[b]=[c];return k},k.ready(a,function(){u()&&s(g.ALL,function(a){p(a)}),k.feature&&k.feature("domloaded",!0)});if(window.addEventListener)a.addEventListener("DOMContentLoaded",z,!1),window.addEventListener("load",z,!1);else if(window.attachEvent){a.attachEvent("onreadystatechange",function(){a.readyState==="complete"&&z()});var A=1;try{A=window.frameElement}catch(B){}!A&&b.doScroll&&function(){try{b.doScroll("left"),z()}catch(a){setTimeout(arguments.callee,1);return}}(),window.attachEvent("onload",z)}!a.readyState&&a.addEventListener&&(a.readyState="loading",a.addEventListener("DOMContentLoaded",handler=function(){a.removeEventListener("DOMContentLoaded",handler,!1),a.readyState="complete"},!1)),setTimeout(function(){c=!0,s(f,function(a){a()})},300)})(document)

  /*!
   * reveal.js 2.3.0 (2013-03-08, 19:28)
   * http://lab.hakim.se/reveal-js
   * MIT licensed
   *
   * Copyright (C) 2013 Hakim El Hattab, http://hakim.se
   */
  Reveal=function(){"use strict";function e(e){return At||St?(window.addEventListener("load",h,!1),c(ht,e),n(),r(),void 0):(document.body.setAttribute("class","no-transforms"),void 0)}function t(){if(Et.theme=document.querySelector("#theme"),Et.wrapper=document.querySelector(".reveal"),Et.slides=document.querySelector(".reveal .slides"),!Et.wrapper.querySelector(".progress")&&ht.progress){var e=document.createElement("div");e.classList.add("progress"),e.innerHTML="<span></span>",Et.wrapper.appendChild(e)}if(!Et.wrapper.querySelector(".controls")&&ht.controls){var t=document.createElement("aside");t.classList.add("controls"),t.innerHTML='<div class="navigate-left"></div><div class="navigate-right"></div><div class="navigate-up"></div><div class="navigate-down"></div>',Et.wrapper.appendChild(t)}if(!Et.wrapper.querySelector(".state-background")){var n=document.createElement("div");n.classList.add("state-background"),Et.wrapper.appendChild(n)}if(!Et.wrapper.querySelector(".pause-overlay")){var r=document.createElement("div");r.classList.add("pause-overlay"),Et.wrapper.appendChild(r)}Et.progress=document.querySelector(".reveal .progress"),Et.progressbar=document.querySelector(".reveal .progress span"),ht.controls&&(Et.controls=document.querySelector(".reveal .controls"),Et.controlsLeft=l(document.querySelectorAll(".navigate-left")),Et.controlsRight=l(document.querySelectorAll(".navigate-right")),Et.controlsUp=l(document.querySelectorAll(".navigate-up")),Et.controlsDown=l(document.querySelectorAll(".navigate-down")),Et.controlsPrev=l(document.querySelectorAll(".navigate-prev")),Et.controlsNext=l(document.querySelectorAll(".navigate-next")))}function n(){/iphone|ipod|android/gi.test(navigator.userAgent)&&!/crios/gi.test(navigator.userAgent)&&(window.addEventListener("load",u,!1),window.addEventListener("orientationchange",u,!1))}function r(){function e(){n.length&&head.js.apply(null,n),o()}for(var t=[],n=[],r=0,s=ht.dependencies.length;s>r;r++){var a=ht.dependencies[r];(!a.condition||a.condition())&&(a.async?n.push(a.src):t.push(a.src),"function"==typeof a.callback&&head.ready(a.src.match(/([\w\d_\-]*)\.?js$|[^\\\/]*$/i)[0],a.callback))}t.length?(head.ready(e),head.js.apply(null,t)):e()}function o(){t(),a(),s(),O(),setTimeout(function(){v("ready",{indexh:gt,indexv:wt,currentSlide:ut})},1)}function s(e){if(Et.wrapper.classList.remove(ht.transition),"object"==typeof e&&c(ht,e),St===!1&&(ht.transition="linear"),Et.wrapper.classList.add(ht.transition),Et.controls&&(Et.controls.style.display=ht.controls&&Et.controls?"block":"none"),Et.progress&&(Et.progress.style.display=ht.progress&&Et.progress?"block":"none"),ht.rtl?Et.wrapper.classList.add("rtl"):Et.wrapper.classList.remove("rtl"),ht.center?Et.wrapper.classList.add("center"):Et.wrapper.classList.remove("center"),ht.mouseWheel?(document.addEventListener("DOMMouseScroll",J,!1),document.addEventListener("mousewheel",J,!1)):(document.removeEventListener("DOMMouseScroll",J,!1),document.removeEventListener("mousewheel",J,!1)),ht.rollingLinks?f():p(),ht.theme&&Et.theme){var t=Et.theme.getAttribute("href"),n=/[^\/]*?(?=\.css)/,r=t.match(n)[0];ht.theme!==r&&(t=t.replace(n,ht.theme),Et.theme.setAttribute("href",t))}h(),yt=ht.autoSlide,I()}function a(){Pt=!0,window.addEventListener("hashchange",it,!1),window.addEventListener("resize",ct,!1),ht.touch&&(Et.wrapper.addEventListener("touchstart",$,!1),Et.wrapper.addEventListener("touchmove",Z,!1),Et.wrapper.addEventListener("touchend",Q,!1),window.navigator.msPointerEnabled&&(Et.wrapper.addEventListener("MSPointerDown",V,!1),Et.wrapper.addEventListener("MSPointerMove",B,!1),Et.wrapper.addEventListener("MSPointerUp",G,!1))),ht.keyboard&&document.addEventListener("keydown",K,!1),ht.progress&&Et.progress&&Et.progress.addEventListener("click",et,!1),ht.controls&&Et.controls&&["touchstart","click"].forEach(function(e){Et.controlsLeft.forEach(function(t){t.addEventListener(e,tt,!1)}),Et.controlsRight.forEach(function(t){t.addEventListener(e,nt,!1)}),Et.controlsUp.forEach(function(t){t.addEventListener(e,rt,!1)}),Et.controlsDown.forEach(function(t){t.addEventListener(e,ot,!1)}),Et.controlsPrev.forEach(function(t){t.addEventListener(e,st,!1)}),Et.controlsNext.forEach(function(t){t.addEventListener(e,at,!1)})})}function i(){Pt=!1,document.removeEventListener("keydown",K,!1),window.removeEventListener("hashchange",it,!1),window.removeEventListener("resize",ct,!1),ht.touch&&(Et.wrapper.removeEventListener("touchstart",$,!1),Et.wrapper.removeEventListener("touchmove",Z,!1),Et.wrapper.removeEventListener("touchend",Q,!1),window.navigator.msPointerEnabled&&(Et.wrapper.removeEventListener("MSPointerDown",V,!1),Et.wrapper.removeEventListener("MSPointerMove",B,!1),Et.wrapper.removeEventListener("MSPointerUp",G,!1))),ht.progress&&Et.progress&&Et.progress.removeEventListener("click",et,!1),ht.controls&&Et.controls&&["touchstart","click"].forEach(function(e){Et.controlsLeft.forEach(function(t){t.removeEventListener(e,tt,!1)}),Et.controlsRight.forEach(function(t){t.removeEventListener(e,nt,!1)}),Et.controlsUp.forEach(function(t){t.removeEventListener(e,rt,!1)}),Et.controlsDown.forEach(function(t){t.removeEventListener(e,ot,!1)}),Et.controlsPrev.forEach(function(t){t.removeEventListener(e,st,!1)}),Et.controlsNext.forEach(function(t){t.removeEventListener(e,at,!1)})})}function c(e,t){for(var n in t)e[n]=t[n]}function l(e){return Array.prototype.slice.call(e)}function d(e,t){var n=e.x-t.x,r=e.y-t.y;return Math.sqrt(n*n+r*r)}function u(){0===window.orientation?(document.documentElement.style.overflow="scroll",document.body.style.height="120%"):(document.documentElement.style.overflow="",document.body.style.height="100%"),setTimeout(function(){window.scrollTo(0,1)},10)}function v(e,t){var n=document.createEvent("HTMLEvents",1,2);n.initEvent(e,!0,!0),c(n,t),Et.wrapper.dispatchEvent(n)}function f(){if(St&&!("msPerspective"in document.body.style))for(var e=document.querySelectorAll(vt+" a:not(.image)"),t=0,n=e.length;n>t;t++){var r=e[t];if(!(!r.textContent||r.querySelector("*")||r.className&&r.classList.contains(r,"roll"))){var o=document.createElement("span");o.setAttribute("data-title",r.text),o.innerHTML=r.innerHTML,r.classList.add("roll"),r.innerHTML="",r.appendChild(o)}}}function p(){for(var e=document.querySelectorAll(vt+" a.roll"),t=0,n=e.length;n>t;t++){var r=e[t],o=r.querySelector("span");o&&(r.classList.remove("roll"),r.innerHTML=o.innerHTML)}}function m(e){var t=l(e);return t.forEach(function(e,t){e.hasAttribute("data-fragment-index")||e.setAttribute("data-fragment-index",t)}),t.sort(function(e,t){return e.getAttribute("data-fragment-index")-t.getAttribute("data-fragment-index")}),t}function h(){if(Et.wrapper){var e=Et.wrapper.offsetWidth,t=Et.wrapper.offsetHeight;e-=t*ht.margin,t-=t*ht.margin;var n=ht.width,r=ht.height;if("string"==typeof n&&/%$/.test(n)&&(n=parseInt(n,10)/100*e),"string"==typeof r&&/%$/.test(r)&&(r=parseInt(r,10)/100*t),Et.slides.style.width=n+"px",Et.slides.style.height=r+"px",bt=Math.min(e/n,t/r),bt=Math.max(bt,ht.minScale),bt=Math.min(bt,ht.maxScale),void 0===Et.slides.style.zoom||navigator.userAgent.match(/(iphone|ipod|ipad|android)/gi)){var o="translate(-50%, -50%) scale("+bt+") translate(50%, 50%)";Et.slides.style.WebkitTransform=o,Et.slides.style.MozTransform=o,Et.slides.style.msTransform=o,Et.slides.style.OTransform=o,Et.slides.style.transform=o}else Et.slides.style.zoom=bt;for(var s=l(document.querySelectorAll(vt)),a=0,i=s.length;i>a;a++){var c=s[a];"none"!==c.style.display&&(c.style.top=ht.center?c.classList.contains("stack")?0:Math.max(-(c.offsetHeight/2)-20,-r/2)+"px":"")}}}function y(e,t){"object"==typeof e&&"function"==typeof e.setAttribute&&e.setAttribute("data-previous-indexv",t||0)}function g(e){return"object"==typeof e&&"function"==typeof e.setAttribute&&e.classList.contains("stack")?parseInt(e.getAttribute("data-previous-indexv")||0,10):0}function w(){if(ht.overview){R();var e=Et.wrapper.classList.contains("overview");Et.wrapper.classList.add("overview"),Et.wrapper.classList.remove("exit-overview"),clearTimeout(xt),clearTimeout(Mt),xt=setTimeout(function(){for(var t=document.querySelectorAll(ft),n=0,r=t.length;r>n;n++){var o=t[n],s="translateZ(-2500px) translate("+105*(n-gt)+"%, 0%)";if(o.setAttribute("data-index-h",n),o.style.display="block",o.style.WebkitTransform=s,o.style.MozTransform=s,o.style.msTransform=s,o.style.OTransform=s,o.style.transform=s,o.classList.contains("stack"))for(var a=o.querySelectorAll("section"),i=0,c=a.length;c>i;i++){var l=n===gt?wt:g(o),d=a[i],u="translate(0%, "+105*(i-l)+"%)";d.setAttribute("data-index-h",n),d.setAttribute("data-index-v",i),d.style.display="block",d.style.WebkitTransform=u,d.style.MozTransform=u,d.style.msTransform=u,d.style.OTransform=u,d.style.transform=u,d.addEventListener("click",lt,!0)}else o.addEventListener("click",lt,!0)}h(),e||v("overviewshown",{indexh:gt,indexv:wt,currentSlide:ut})},10)}}function L(){if(ht.overview){clearTimeout(xt),clearTimeout(Mt),Et.wrapper.classList.remove("overview"),Et.wrapper.classList.add("exit-overview"),Mt=setTimeout(function(){Et.wrapper.classList.remove("exit-overview")},10);for(var e=l(document.querySelectorAll(vt)),t=0,n=e.length;n>t;t++){var r=e[t];r.style.display="",r.style.WebkitTransform="",r.style.MozTransform="",r.style.msTransform="",r.style.OTransform="",r.style.transform="",r.removeEventListener("click",lt,!0)}x(gt,wt),I(),v("overviewhidden",{indexh:gt,indexv:wt,currentSlide:ut})}}function b(e){"boolean"==typeof e?e?w():L():E()?L():w()}function E(){return Et.wrapper.classList.contains("overview")}function S(){var e=document.body,t=e.requestFullScreen||e.webkitRequestFullScreen||e.mozRequestFullScreen||e.msRequestFullScreen;t&&t.apply(e)}function A(){var e=Et.wrapper.classList.contains("paused");R(),Et.wrapper.classList.add("paused"),e===!1&&v("paused")}function q(){var e=Et.wrapper.classList.contains("paused");I(),Et.wrapper.classList.remove("paused"),e&&v("resumed")}function T(){k()?q():A()}function k(){return Et.wrapper.classList.contains("paused")}function x(e,t,n,r){dt=ut;var o=document.querySelectorAll(ft);void 0===t&&(t=g(o[e])),dt&&dt.parentNode&&dt.parentNode.classList.contains("stack")&&y(dt.parentNode,wt);var s=Lt.concat();Lt.length=0;var a=gt,i=wt;gt=M(ft,void 0===e?gt:e),wt=M(pt,void 0===t?wt:t),h();e:for(var c=0,d=Lt.length;d>c;c++){for(var u=0;s.length>u;u++)if(s[u]===Lt[c]){s.splice(u,1);continue e}document.documentElement.classList.add(Lt[c]),v(Lt[c])}for(;s.length;)document.documentElement.classList.remove(s.pop());E()&&w(),C(1500);var f=o[gt],p=f.querySelectorAll("section");if(ut=p[wt]||f,n!==void 0){var L=m(ut.querySelectorAll(".fragment"));l(L).forEach(function(e,t){n>t?e.classList.add("visible"):e.classList.remove("visible")})}gt!==a||wt!==i?v("slidechanged",{indexh:gt,indexv:wt,previousSlide:dt,currentSlide:ut,origin:r}):dt=null,dt&&(dt.classList.remove("present"),document.querySelector(mt).classList.contains("present")&&setTimeout(function(){var e,t=l(document.querySelectorAll(ft+".stack"));for(e in t)t[e]&&y(t[e],0)},0)),D(),P()}function M(e,t){var n=l(document.querySelectorAll(e)),r=n.length;if(r){ht.loop&&(t%=r,0>t&&(t=r+t)),t=Math.max(Math.min(t,r-1),0);for(var o=0;r>o;o++){var s=n[o];if(E()===!1){var a=Math.abs((t-o)%(r-3))||0;s.style.display=a>3?"none":"block"}n[o].classList.remove("past"),n[o].classList.remove("present"),n[o].classList.remove("future"),t>o?n[o].classList.add("past"):o>t&&n[o].classList.add("future"),s.querySelector("section")&&n[o].classList.add("stack")}n[t].classList.add("present");var i=n[t].getAttribute("data-state");i&&(Lt=Lt.concat(i.split(" ")));var c=n[t].getAttribute("data-autoslide");yt=c?parseInt(c,10):ht.autoSlide}else t=0;return t}function P(){if(ht.progress&&Et.progress){var e=l(document.querySelectorAll(ft)),t=document.querySelectorAll(vt+":not(.stack)").length,n=0;e:for(var r=0;e.length>r;r++){for(var o=e[r],s=l(o.querySelectorAll("section")),a=0;s.length>a;a++){if(s[a].classList.contains("present"))break e;n++}if(o.classList.contains("present"))break;o.classList.contains("stack")===!1&&n++}Et.progressbar.style.width=n/(t-1)*window.innerWidth+"px"}}function D(){if(ht.controls&&Et.controls){var e=N();Et.controlsLeft.concat(Et.controlsRight).concat(Et.controlsUp).concat(Et.controlsDown).concat(Et.controlsPrev).concat(Et.controlsNext).forEach(function(e){e.classList.remove("enabled")}),e.left&&Et.controlsLeft.forEach(function(e){e.classList.add("enabled")}),e.right&&Et.controlsRight.forEach(function(e){e.classList.add("enabled")}),e.up&&Et.controlsUp.forEach(function(e){e.classList.add("enabled")}),e.down&&Et.controlsDown.forEach(function(e){e.classList.add("enabled")}),(e.left||e.up)&&Et.controlsPrev.forEach(function(e){e.classList.add("enabled")}),(e.right||e.down)&&Et.controlsNext.forEach(function(e){e.classList.add("enabled")})}}function N(){var e=document.querySelectorAll(ft),t=document.querySelectorAll(pt);return{left:gt>0||ht.loop,right:e.length-1>gt||ht.loop,up:wt>0,down:t.length-1>wt}}function O(){var e=window.location.hash,t=e.slice(2).split("/"),n=e.replace(/#|\//gi,"");if(isNaN(parseInt(t[0],10))&&n.length){var r=document.querySelector("#"+n);if(r){var o=Reveal.getIndices(r);x(o.h,o.v)}else x(gt,wt)}else{var s=parseInt(t[0],10)||0,a=parseInt(t[1],10)||0;x(s,a)}}function C(e){if(ht.history)if(clearTimeout(kt),"number"==typeof e)kt=setTimeout(C,e);else{var t="/";ut&&"string"==typeof ut.getAttribute("id")?t="/"+ut.getAttribute("id"):((gt>0||wt>0)&&(t+=gt),wt>0&&(t+="/"+wt)),window.location.hash=t}}function Y(e){var t=gt,n=wt;if(e){var r=!!e.parentNode.nodeName.match(/section/gi),o=r?e.parentNode:e,s=l(document.querySelectorAll(ft));t=Math.max(s.indexOf(o),0),r&&(n=Math.max(l(e.parentNode.querySelectorAll("section")).indexOf(e),0))}return{h:t,v:n}}function X(){if(document.querySelector(pt+".present")){var e=m(document.querySelectorAll(pt+".present .fragment:not(.visible)"));if(e.length)return e[0].classList.add("visible"),v("fragmentshown",{fragment:e[0]}),!0}else{var t=m(document.querySelectorAll(ft+".present .fragment:not(.visible)"));if(t.length)return t[0].classList.add("visible"),v("fragmentshown",{fragment:t[0]}),!0}return!1}function H(){if(document.querySelector(pt+".present")){var e=m(document.querySelectorAll(pt+".present .fragment.visible"));if(e.length)return e[e.length-1].classList.remove("visible"),v("fragmenthidden",{fragment:e[e.length-1]}),!0}else{var t=m(document.querySelectorAll(ft+".present .fragment.visible"));if(t.length)return t[t.length-1].classList.remove("visible"),v("fragmenthidden",{fragment:t[t.length-1]}),!0}return!1}function I(){clearTimeout(Tt),!yt||k()||E()||(Tt=setTimeout(j,yt))}function R(){clearTimeout(Tt)}function z(){N().left&&(E()||H()===!1)&&x(gt-1)}function U(){N().right&&(E()||X()===!1)&&x(gt+1)}function W(){(N().up&&E()||H()===!1)&&x(gt,wt-1)}function _(){(N().down&&E()||X()===!1)&&x(gt,wt+1)}function F(){if(H()===!1)if(N().up)W();else{var e=document.querySelector(ft+".past:nth-child("+gt+")");e&&(wt=e.querySelectorAll("section").length+1||void 0,gt--,x())}}function j(){X()===!1&&(N().down?_():U()),I()}function K(e){document.activeElement;var t=!(!document.activeElement||!document.activeElement.type&&!document.activeElement.href&&"inherit"===document.activeElement.contentEditable);if(!(t||e.shiftKey||e.altKey||e.ctrlKey||e.metaKey)){var n=!0;if(k()&&-1===[66,190,191].indexOf(e.keyCode))return!1;switch(e.keyCode){case 80:case 33:F();break;case 78:case 34:j();break;case 72:case 37:z();break;case 76:case 39:U();break;case 75:case 38:W();break;case 74:case 40:_();break;case 36:x(0);break;case 35:x(Number.MAX_VALUE);break;case 32:E()?L():j();break;case 13:E()?L():n=!1;break;case 66:case 190:case 191:T();break;case 70:S();break;default:n=!1}n?e.preventDefault():27===e.keyCode&&St&&(b(),e.preventDefault()),I()}}function $(e){Dt.startX=e.touches[0].clientX,Dt.startY=e.touches[0].clientY,Dt.startCount=e.touches.length,2===e.touches.length&&ht.overview&&(Dt.startSpan=d({x:e.touches[1].clientX,y:e.touches[1].clientY},{x:Dt.startX,y:Dt.startY}))}function Z(e){if(Dt.handled)navigator.userAgent.match(/android/gi)&&e.preventDefault();else{var t=e.touches[0].clientX,n=e.touches[0].clientY;if(2===e.touches.length&&2===Dt.startCount&&ht.overview){var r=d({x:e.touches[1].clientX,y:e.touches[1].clientY},{x:Dt.startX,y:Dt.startY});Math.abs(Dt.startSpan-r)>Dt.threshold&&(Dt.handled=!0,Dt.startSpan>r?w():L()),e.preventDefault()}else if(1===e.touches.length&&2!==Dt.startCount){var o=t-Dt.startX,s=n-Dt.startY;o>Dt.threshold&&Math.abs(o)>Math.abs(s)?(Dt.handled=!0,z()):-Dt.threshold>o&&Math.abs(o)>Math.abs(s)?(Dt.handled=!0,U()):s>Dt.threshold?(Dt.handled=!0,W()):-Dt.threshold>s&&(Dt.handled=!0,_()),e.preventDefault()}}}function Q(){Dt.handled=!1}function V(e){e.pointerType===e.MSPOINTER_TYPE_TOUCH&&(e.touches=[{clientX:e.clientX,clientY:e.clientY}],$(e))}function B(e){e.pointerType===e.MSPOINTER_TYPE_TOUCH&&(e.touches=[{clientX:e.clientX,clientY:e.clientY}],Z(e))}function G(e){e.pointerType===e.MSPOINTER_TYPE_TOUCH&&(e.touches=[{clientX:e.clientX,clientY:e.clientY}],Q(e))}function J(e){clearTimeout(qt),qt=setTimeout(function(){var t=e.detail||-e.wheelDelta;t>0?j():F()},100)}function et(e){e.preventDefault();var t=l(document.querySelectorAll(ft)).length,n=Math.floor(e.clientX/Et.wrapper.offsetWidth*t);x(n)}function tt(e){e.preventDefault(),z()}function nt(e){e.preventDefault(),U()}function rt(e){e.preventDefault(),W()}function ot(e){e.preventDefault(),_()}function st(e){e.preventDefault(),F()}function at(e){e.preventDefault(),j()}function it(){O()}function ct(){h()}function lt(e){if(Pt&&E()){e.preventDefault();for(var t=e.target;t&&!t.nodeName.match(/section/gi);)t=t.parentNode;if(t&&!t.classList.contains("disabled")&&(L(),t.nodeName.match(/section/gi))){var n=parseInt(t.getAttribute("data-index-h"),10),r=parseInt(t.getAttribute("data-index-v"),10);x(n,r)}}}var dt,ut,vt=".reveal .slides section",ft=".reveal .slides>section",pt=".reveal .slides>section.present>section",mt=".reveal .slides>section:first-child",ht={width:960,height:700,margin:.1,minScale:.2,maxScale:1,controls:!0,progress:!0,history:!1,keyboard:!0,overview:!0,center:!0,touch:!0,loop:!1,rtl:!1,autoSlide:0,mouseWheel:!1,rollingLinks:!0,theme:null,transition:"default",dependencies:[]},yt=0,gt=0,wt=0,Lt=[],bt=1,Et={},St="WebkitPerspective"in document.body.style||"MozPerspective"in document.body.style||"msPerspective"in document.body.style||"OPerspective"in document.body.style||"perspective"in document.body.style,At="WebkitTransform"in document.body.style||"MozTransform"in document.body.style||"msTransform"in document.body.style||"OTransform"in document.body.style||"transform"in document.body.style,qt=0,Tt=0,kt=0,xt=0,Mt=0,Pt=!1,Dt={startX:0,startY:0,startSpan:0,startCount:0,handled:!1,threshold:80};return{initialize:e,configure:s,slide:x,left:z,right:U,up:W,down:_,prev:F,next:j,prevFragment:H,nextFragment:X,navigateTo:x,navigateLeft:z,navigateRight:U,navigateUp:W,navigateDown:_,navigatePrev:F,navigateNext:j,layout:h,toggleOverview:b,togglePause:T,isOverview:E,isPaused:k,addEventListeners:a,removeEventListeners:i,getIndices:Y,getSlide:function(e,t){var n=document.querySelectorAll(ft)[e],r=n&&n.querySelectorAll("section");return t!==void 0?r?r[t]:void 0:n},getPreviousSlide:function(){return dt},getCurrentSlide:function(){return ut},getScale:function(){return bt},getConfig:function(){return ht},getQueryHash:function(){var e={};return location.search.replace(/[A-Z0-9]+?=(\w*)/gi,function(t){e[t.split("=").shift()]=t.split("=").pop()}),e},isFirstSlide:function(){return null==document.querySelector(vt+".past")?!0:!1},isLastSlide:function(){return ut&&ut.classList.contains(".stack")?null==ut.querySelector(vt+".future")?!0:!1:null==document.querySelector(vt+".future")?!0:!1},addEventListener:function(e,t,n){"addEventListener"in window&&(Et.wrapper||document.querySelector(".reveal")).addEventListener(e,t,n)},removeEventListener:function(e,t,n){"addEventListener"in window&&(Et.wrapper||document.querySelector(".reveal")).removeEventListener(e,t,n)}}}();



  Reveal.initialize({
    controls: true,
    progress: true,
    history: true,
    center: true,

    theme: Reveal.getQueryHash().theme, // available themes are in /css/theme
    transition: Reveal.getQueryHash().transition || 'default', // default/cube/page/concave/zoom/linear/fade/none

    // Optional libraries used to extend on reveal.js
    dependencies: [
      { src: 'lib/js/classList.js', condition: function() { return !document.body.classList; } }
    ]
  });

  // Reveal.addEventListener('slidechanged', function(event) {
  //   Config.update({_id: Config.findOne({})._id}, {$set: {currentSlide: event.currentSlide}});
  //   // Config.update({_id: Session.get("configID")},{$set: {currentSlide: event.currentSlide}});
  // });

  // Both of these work:
  // Reveal.slide(Config.find().count());
  // Reveal.slide($('#current-slide').attr('value'));
  if (Session.get("configLoaded")) {
    var curr = currentSlide();
    console.log("setting hash to "+curr);
    // var currentSlide = Config.find(Session.get("configID")).currentSlide;
    window.location.hash = "#/"+curr;  
  }
  // var currentSlide = Config.find().count();
  // window.location.hash = "#/"+currentSlide;
  console.log("Config loaded "+Session.get("configLoaded"));

  // $(window).bind('hashchange', function () {console.log("hash changed "+window.location.hash)});
}
