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

/* Water ripples: the background reacts to the mouse */
if(!reduce){
  var cv=document.createElement("canvas");cv.id="water";cv.setAttribute("aria-hidden","true");
  document.body.insertBefore(cv,document.body.firstChild);
  var cx=cv.getContext("2d"),S=5,w,h,a,b,img,last=null,rt;
  function init(){w=Math.ceil(innerWidth/S);h=Math.ceil(innerHeight/S);cv.width=w;cv.height=h;a=new Float32Array(w*h);b=new Float32Array(w*h);img=cx.createImageData(w,h)}
  function drop(px,py,v,r){var x=Math.round(px/S),y=Math.round(py/S);
    for(var j=-r;j<=r;j++)for(var i=-r;i<=r;i++){var X=x+i,Y=y+j;if(X>0&&X<w-1&&Y>0&&Y<h-1&&i*i+j*j<=r*r)a[Y*w+X]-=v}}
  function step(){
    for(var y=1;y<h-1;y++){var o=y*w;for(var x=1;x<w-1;x++){var i=o+x;b[i]=((a[i-1]+a[i+1]+a[i-w]+a[i+w])/2-b[i])*.985}}
    var t=a;a=b;b=t;
    var d=img.data;
    for(var y2=1;y2<h-1;y2++){for(var x2=1;x2<w-1;x2++){var k=y2*w+x2,l=(a[k+1]-a[k-1]+a[k+w]-a[k-w])*.5,p=k*4;
      if(l>0){d[p]=185;d[p+1]=196;d[p+2]=255;d[p+3]=Math.min(110,l*1.3)}else{d[p]=0;d[p+1]=0;d[p+2]=0;d[p+3]=Math.min(90,-l*1.3)}}}
    cx.putImageData(img,0,0);
    requestAnimationFrame(step);
  }
  init();requestAnimationFrame(step);
  addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(init,200)});
  addEventListener("pointermove",function(e){
    if(last){var s=Math.hypot(e.clientX-last.x,e.clientY-last.y);if(s>1)drop(e.clientX,e.clientY,Math.min(30+s*4,260),2)}
    last={x:e.clientX,y:e.clientY};
  });
  addEventListener("pointerdown",function(e){drop(e.clientX,e.clientY,500,4)});
  setInterval(function(){drop(Math.random()*innerWidth,Math.random()*innerHeight,150,3)},2800);
}
})();
