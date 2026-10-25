(function(){
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches,root=document.documentElement;

/* Cursor glow + holo colour follows the mouse */
var glow=$(".glow");
addEventListener("pointermove",function(e){
  root.style.setProperty("--mx",(e.clientX/innerWidth*100)+"%");
  if(glow&&!reduce){glow.style.left=e.clientX+"px";glow.style.top=e.clientY+"px"}
});

/* Split the wordmark into letters */
var mk=$(".mark");
if(mk){var w=mk.textContent;mk.textContent="";mk.setAttribute("aria-label",w);
  w.split("").forEach(function(c){var s=document.createElement("span");s.textContent=c;s.setAttribute("aria-hidden","true");s.className="holo";mk.appendChild(s)});
  mk.classList.remove("holo")}

/* Smooth page fade when clicking between pages */
$$("a[href]").forEach(function(a){
  var h=a.getAttribute("href");
  if(!h||h.charAt(0)==="#"||/^(https?:|mailto:)/.test(h))return;
  a.addEventListener("click",function(e){e.preventDefault();document.body.classList.add("out");setTimeout(function(){location.href=h},200)});
});

/* Draggable stickers */
$$(".st").forEach(function(el){
  var dx,dy,drag=false;
  el.addEventListener("pointerdown",function(e){drag=true;el.setPointerCapture(e.pointerId);
    var r=el.getBoundingClientRect(),p=el.offsetParent.getBoundingClientRect();
    dx=e.clientX-r.left;dy=e.clientY-r.top;el.style.right="auto";el.style.left=(r.left-p.left)+"px";el.style.top=(r.top-p.top)+"px"});
  el.addEventListener("pointermove",function(e){if(!drag)return;var p=el.offsetParent.getBoundingClientRect();
    el.style.left=(e.clientX-p.left-dx)+"px";el.style.top=(e.clientY-p.top-dy)+"px"});
  el.addEventListener("pointerup",function(){drag=false});
});

/* Card tilt */
if(!reduce)$$(".card").forEach(function(c){
  c.addEventListener("pointermove",function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    c.style.transform="rotateY("+x*10+"deg) rotateX("+-y*10+"deg)"});
  c.addEventListener("pointerleave",function(){c.style.transform=""});
});

/* Filter chips */
$$(".chip[data-f]").forEach(function(b){
  b.addEventListener("click",function(){
    $$(".chip[data-f]").forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});
    var f=b.getAttribute("data-f");
    $$(".card[data-k]").forEach(function(c){c.classList.toggle("hide",f!=="all"&&c.getAttribute("data-k")!==f)});
  });
});

/* Copy email */
var cp=$("#copy");
if(cp)cp.addEventListener("click",function(){
  var t=$("#mail").textContent;
  (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){cp.textContent="Copied!"},function(){cp.textContent="Press Ctrl+C"});
  setTimeout(function(){cp.textContent="Copy email"},1800);
});

/* ---------- Music player (keeps its place between pages) ----------
   Add real songs by uploading an mp3 to the "music" folder and filling in src.
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
