(function(){
/* Turn any feature off by changing its 1 to a 0 */
var F={dots:1,water:1,magnetic:1,scramble:1,tilt:1,wipe:1,scroll:1};

var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches,root=document.documentElement;
var mx=-9999,my=-9999;

/* Mouse position drives the spotlight, the silver sheen and every effect below */
addEventListener("pointermove",function(e){
  mx=e.clientX;my=e.clientY;
  root.style.setProperty("--mx",(e.clientX/innerWidth*100)+"%");
  root.style.setProperty("--sx",e.clientX+"px");root.style.setProperty("--sy",e.clientY+"px");
});

/* ---------- 5. Page wipe (falls back to a quick fade) ---------- */
var wp=$("#wipe"),wipeOn=F.wipe&&!reduce&&wp;
if(wipeOn){
  if(root.classList.contains("wi")){
    try{sessionStorage.removeItem("wipe")}catch(e){}
    wp.offsetWidth;root.classList.remove("wi");
  }
  addEventListener("pageshow",function(e){if(e.persisted){wp.style.transition="none";wp.style.transform="translateX(100%)"}});
}
$$("a[href]").forEach(function(a){
  var h=a.getAttribute("href");
  if(!h||h.charAt(0)==="#"||/^(https?:|mailto:)/.test(h)||/\.pdf$/.test(h)||a.hasAttribute("download"))return;
  a.addEventListener("click",function(e){
    e.preventDefault();
    if(wipeOn){
      wp.style.transition="none";wp.style.transform="translateX(-100%)";wp.offsetWidth;
      wp.style.transition="";wp.style.transform="translateX(0)";
      try{sessionStorage.setItem("wipe","1")}catch(x){}
      setTimeout(function(){location.href=h},520);
    }else{document.body.classList.add("out");setTimeout(function(){location.href=h},220)}
  });
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

if(reduce)return; /* everything below is motion, so skip it for people who asked for less */

/* ---------- 6. Scroll progress line ---------- */
if(F.scroll){
  var pr=document.createElement("div");pr.id="prog";document.body.appendChild(pr);
  var sp=function(){var m=document.documentElement.scrollHeight-innerHeight;pr.style.width=(m>0?scrollY/m*100:0)+"%"};
  addEventListener("scroll",sp,{passive:true});addEventListener("resize",sp);sp();
}

/* ---------- 3. Text scramble on headings ---------- */
if(F.scramble){
  var CH="abcdefghijklmnopqrstuvwxyz0123456789";
  var scramble=function(el){
    if(el._busy)return;
    if(!el._nodes){el._nodes=[];var tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),n;
      while((n=tw.nextNode()))el._nodes.push({n:n,t:n.nodeValue});
      el.setAttribute("aria-label",el.textContent);}
    var total=el._nodes.reduce(function(s,x){return s+x.t.length},0),f=0,steps=22;el._busy=true;
    (function tick(){
      f++;var shown=Math.floor(total*f/steps),idx=0;
      el._nodes.forEach(function(o){var out="";
        for(var i=0;i<o.t.length;i++,idx++){var c=o.t.charAt(i);out+=(idx<shown||c===" ")?c:CH.charAt(Math.floor(Math.random()*CH.length))}
        o.n.nodeValue=out});
      if(f<steps)setTimeout(tick,32);else el._busy=false;
    })();
  };
  $$(".title,.mark").forEach(function(el){scramble(el);el.addEventListener("pointerenter",function(){scramble(el)})});
}

/* ---------- 1. Dot grid that gets pushed away from the cursor ---------- */
var dctx,pts=[],DW,DH,G=34;
if(F.dots){
  var dc=document.createElement("canvas");dc.id="dots";dc.setAttribute("aria-hidden","true");
  document.body.insertBefore(dc,document.body.firstChild);dctx=dc.getContext("2d");
  var dinit=function(){var r=Math.min(devicePixelRatio||1,2);DW=innerWidth;DH=innerHeight;dc.width=DW*r;dc.height=DH*r;dctx.setTransform(r,0,0,r,0,0);
    pts=[];for(var y=G/2;y<DH;y+=G)for(var x=G/2;x<DW;x+=G)pts.push({x:x,y:y,ox:0,oy:0})};
  dinit();addEventListener("resize",dinit);
}

/* ---------- 2. Magnetic buttons + 4. Name tilt ---------- */
var mags=F.magnetic?$$(".cta,.btn,.top nav a,.brand").map(function(el){return{el:el,x:0,y:0}}):[];
var mk=F.tilt?$(".mark"):null,rx=0,ry=0;
(function loop(){
  if(dctx){
    dctx.clearRect(0,0,DW,DH);
    for(var i=0;i<pts.length;i++){var p=pts[i],ddx=p.x-mx,ddy=p.y-my,d=Math.hypot(ddx,ddy),tx=0,ty=0,near=0;
      if(d<150&&d>.1){var f=Math.pow(1-d/150,2)*48;tx=ddx/d*f;ty=ddy/d*f;near=1-d/150}
      p.ox+=(tx-p.ox)*.14;p.oy+=(ty-p.oy)*.14;
      dctx.fillStyle="rgba(185,196,255,"+(.2+near*.6).toFixed(2)+")";
      dctx.beginPath();dctx.arc(p.x+p.ox,p.y+p.oy,1.2+near*1.6,0,6.283);dctx.fill();}
  }
  mags.forEach(function(m){
    var r=m.el.getBoundingClientRect(),cx=r.left+r.width/2-m.x,cy=r.top+r.height/2-m.y,dx2=mx-cx,dy2=my-cy,tx=0,ty=0;
    if(Math.hypot(dx2,dy2)<90){tx=Math.max(-14,Math.min(14,dx2*.3));ty=Math.max(-14,Math.min(14,dy2*.3))}
    m.x+=(tx-m.x)*.18;m.y+=(ty-m.y)*.18;m.el.style.translate=m.x.toFixed(1)+"px "+m.y.toFixed(1)+"px";
  });
  if(mk){
    var trx=mx<0?0:(my/innerHeight-.5)*-10,try_=mx<0?0:(mx/innerWidth-.5)*14;
    rx+=(trx-rx)*.08;ry+=(try_-ry)*.08;
    mk.style.transform="perspective(1000px) rotateX("+rx.toFixed(2)+"deg) rotateY("+ry.toFixed(2)+"deg)";
  }
  requestAnimationFrame(loop);
})();

/* ---------- 7. Soft water ripples (gentler rewrite) ---------- */
if(F.water){
  var wc=document.createElement("canvas");wc.id="water";wc.setAttribute("aria-hidden","true");
  document.body.insertBefore(wc,document.body.firstChild);
  var wx=wc.getContext("2d"),S=4,w,h,a,b,img,last=null,rt;
  var winit=function(){w=Math.ceil(innerWidth/S);h=Math.ceil(innerHeight/S);wc.width=w;wc.height=h;a=new Float32Array(w*h);b=new Float32Array(w*h);img=wx.createImageData(w,h);
    for(var q=0;q<w*h;q++){img.data[q*4]=185;img.data[q*4+1]=196;img.data[q*4+2]=255}};
  var drop=function(px,py,v,r){var x=Math.round(px/S),y=Math.round(py/S);
    for(var j=-r;j<=r;j++)for(var i=-r;i<=r;i++){var X=x+i,Y=y+j;if(X>0&&X<w-1&&Y>0&&Y<h-1&&i*i+j*j<=r*r)a[Y*w+X]-=v*(1-(i*i+j*j)/(r*r+1))}};
  winit();
  (function step(){
    for(var y=1;y<h-1;y++){var o=y*w;for(var x=1;x<w-1;x++){var i=o+x;b[i]=((a[i-1]+a[i+1]+a[i-w]+a[i+w])/2-b[i])*.988}}
    var t=a;a=b;b=t;var d=img.data;
    for(var y2=1;y2<h-1;y2++){for(var x2=1;x2<w-1;x2++){var k=y2*w+x2,l=(a[k+1]-a[k-1]+a[k+w]-a[k-w])*.5;d[k*4+3]=l>0?Math.min(70,l*.9):0}}
    wx.putImageData(img,0,0);requestAnimationFrame(step);
  })();
  addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(winit,200)});
  addEventListener("pointermove",function(e){
    if(last){var s=Math.hypot(e.clientX-last.x,e.clientY-last.y);if(s>2)drop(e.clientX,e.clientY,Math.min(25+s*2,130),3)}
    last={x:e.clientX,y:e.clientY};
  });
  addEventListener("pointerdown",function(e){drop(e.clientX,e.clientY,320,5)});
}
})();
