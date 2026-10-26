(function(){
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches,root=document.documentElement,ring=$("#ring");

/* Spotlight, metallic sheen and cursor ring all follow the mouse */
addEventListener("pointermove",function(e){
  root.style.setProperty("--mx",(e.clientX/innerWidth*100)+"%");
  root.style.setProperty("--sx",e.clientX+"px");root.style.setProperty("--sy",e.clientY+"px");
  if(ring){ring.style.left=e.clientX+"px";ring.style.top=e.clientY+"px"}
});
$$("a,button,.row").forEach(function(el){
  el.addEventListener("pointerenter",function(){ring&&ring.classList.add("big")});
  el.addEventListener("pointerleave",function(){ring&&ring.classList.remove("big")});
});

/* Fade between pages */
$$("a[href]").forEach(function(a){
  var h=a.getAttribute("href");
  if(!h||h.charAt(0)==="#"||/^(https?:|mailto:)/.test(h)||/\.pdf$/.test(h)||a.hasAttribute("download"))return;
  a.addEventListener("click",function(e){e.preventDefault();document.body.classList.add("out");setTimeout(function(){location.href=h},220)});
});

/* Reveal on scroll */
var rv=$$(".rv");
if("IntersectionObserver" in window&&!reduce){
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}})},{threshold:.15});
  rv.forEach(function(el,i){el.style.transitionDelay=(i%6)*70+"ms";io.observe(el)});
}else rv.forEach(function(el){el.classList.add("in")});

/* Filters */
$$(".f button").forEach(function(b){
  b.addEventListener("click",function(){
    $$(".f button").forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});
    var f=b.getAttribute("data-f");
    $$(".row[data-k]").forEach(function(r){r.classList.toggle("hide",f!=="all"&&r.getAttribute("data-k")!==f)});
  });
});

/* Copy email */
var cp=$("#copy");
if(cp)cp.addEventListener("click",function(){
  var t=$("#mail").textContent;
  (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){cp.textContent="Copied"},function(){cp.textContent="Press Ctrl+C"});
  setTimeout(function(){cp.textContent="Copy email"},1800);
});

/* ---------- Music player (keeps its place between pages) ----------
   To add a song: upload an mp3 into a "music" folder in your repo and set src.
   Only use music you own or have permission to share. */
var tracks=[
  {t:"Your song title",a:"Artist",d:200,src:""},
  {t:"Another song",a:"Artist",d:180,src:""}
];
var el=$(".pl");
if(el){
  var i=0,playing=false,pos=0,au=new Audio(),PL="M8 5v14l11-7z",PA="M6 5h4v14H6zM14 5h4v14h-4z";
  try{var s=JSON.parse(sessionStorage.getItem("tp")||"null");if(s){i=s.i;pos=s.t;playing=s.p}}catch(e){}
  function T(){return tracks[i]}
  function dur(){return T().src&&au.duration?au.duration:T().d}
  function cur(){return T().src?au.currentTime:pos}
  function draw(){$(".t b",el).textContent=T().t;$(".t small",el).textContent=T().a;
    $("#pp",el).innerHTML='<path d="'+(playing?PA:PL)+'"/>';
    $(".bar",el).style.width=Math.min(100,cur()/dur()*100)+"%"}
  function load(){pos=0;if(T().src){au.src=T().src;if(playing)au.play().catch(function(){})}draw()}
  function save(){try{sessionStorage.setItem("tp",JSON.stringify({i:i,t:cur(),p:playing}))}catch(e){}}
  if(T().src){au.src=T().src;au.currentTime=pos||0;if(playing)au.play().catch(function(){playing=false;draw()})}
  $("#pp",el).parentNode.addEventListener("click",function(){playing=!playing;if(T().src){playing?au.play():au.pause()}draw();save()});
  $("#nx",el).addEventListener("click",function(){i=(i+1)%tracks.length;load();save()});
  setInterval(function(){if(playing&&!T().src){pos+=.5;if(pos>=T().d){i=(i+1)%tracks.length;load()}}draw();save()},500);
  au.addEventListener("ended",function(){i=(i+1)%tracks.length;load()});
  addEventListener("pagehide",save);draw();
}
})();
