/* MU Lifting Engineering - Scroll Crane Hook Animation */
(function(){
'use strict';
var canvas=document.getElementById("craneCanvas");
if(!canvas)return;
var hookGroup=document.getElementById("hookGroup");
var sheaves=document.querySelectorAll(".sheave-rot");
var ropes=document.querySelectorAll(".rope-line");
var plate=document.getElementById("steelPlate");
var heroContent=document.getElementById("heroContent");
var heroScrollHint=document.getElementById("heroScrollHint");
var progress=0,targetProgress=0,sheaveAngle=0,swingPhase=0,rafId=null,introDone=false;
var SCROLL_RANGE=0.55,LOWER_DURATION=1800,SWING_AMP=2.2,LIFT_START_Y=18,LIFT_END_Y=38;

function runIntro(){
  var start=performance.now();
  function frame(now){
    var t=Math.min((now-start)/LOWER_DURATION,1);
    var eased=1-Math.pow(1-t,3);
    canvas.style.opacity=String(eased);
    if(t<1){rafId=requestAnimationFrame(frame);}
    else{introDone=true;canvas.style.opacity="1";startLoop();}
  }
  canvas.style.opacity="0";
  rafId=requestAnimationFrame(frame);
}

function startLoop(){
  function loop(now){
    swingPhase=now*0.0012;
    progress+=(targetProgress-progress)*0.08;
    if(Math.abs(targetProgress-progress)<0.0005)progress=targetProgress;
    applyTransform(progress);
    rafId=requestAnimationFrame(loop);
  }
  rafId=requestAnimationFrame(loop);
}

function applyTransform(p){
  var yPercent=LIFT_START_Y+(LIFT_END_Y-LIFT_START_Y)*p;
  var swing=Math.sin(swingPhase)*SWING_AMP*(0.4+0.6*(1-p));
  if(hookGroup){
    hookGroup.setAttribute("transform","translate(0,"+(yPercent*4.5)+") rotate("+swing.toFixed(2)+" 200 0)");
  }
  sheaveAngle=p*720;
  sheaves.forEach(function(s,i){
    var dir=(i%2===0)?1:-1;
    var cx=s.getAttribute("data-cx")||"0";
    var cy=s.getAttribute("data-cy")||"0";
    s.setAttribute("transform","rotate("+(sheaveAngle*dir).toFixed(1)+" "+cx+" "+cy+")");
  });
  ropes.forEach(function(r,i){
    var tension=Math.sin(swingPhase*1.3+i)*3*(1-p*0.5);
    r.style.strokeDashoffset=String(tension);
  });
  if(plate){
    plate.style.opacity=String(Math.min(1,p*2.5));
    var scale=0.7+p*0.3;
    plate.setAttribute("transform","scale("+scale.toFixed(3)+")");
  }
  if(heroContent){
    var textOpacity=Math.max(0,Math.min(1,(p-0.72)/0.22));
    heroContent.style.opacity=String(textOpacity);
    heroContent.style.transform="translateY("+((1-textOpacity)*28)+"px)";
    if(textOpacity>0.95)heroContent.classList.add("hero-visible");
  }
  if(heroScrollHint){
    heroScrollHint.style.opacity=String(Math.max(0,1-p*4));
  }
}

function onScroll(){
  if(!introDone)return;
  var hero=document.getElementById("home");
  if(!hero)return;
  var rect=hero.getBoundingClientRect();
  var heroH=hero.offsetHeight;
  var scrolled=Math.max(0,-rect.top);
  targetProgress=Math.min(1,scrolled/(heroH*SCROLL_RANGE));
}
window.addEventListener("scroll",onScroll,{passive:true});
window.addEventListener("resize",onScroll,{passive:true});
if(document.readyState==="complete"){runIntro();}
else{window.addEventListener("load",runIntro);}
})();
