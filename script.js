(function(){
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches,root=document.documentElement;

/* Spotlight and metallic sheen follow the mouse */
addEventListener("pointermove",function(e){
  root.style.setProperty("--mx",(e.clientX/innerWidth*100)+"%");
  root.style.setProperty("--sx",e.clientX+"px");root.style.setProperty("--sy",e.clientY+"px");
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

/* Copy email */
var cp=$("#copy");
if(cp)cp.addEventListener("click",function(){
  var t=$("#mail").textContent;
  (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){cp.textContent="Copied"},function(){cp.textContent="Press Ctrl+C"});
  setTimeout(function(){cp.textContent="Copy email"},1800);
});
})();
