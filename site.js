(function(){
  var props = { accent:'#10AF8B', accentDeep:'#0A6E58', scrollLength:6.2, startZoom:18.5 };
  var E={}, last={}, vw, vh, span, wmW, wmH, pw, bwEnd, pathLen, t, prev, settled;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function q(s){ return document.querySelector(s); }
  function grab(){
    E.inf=q('[data-el="inf"]'); E.trace=q('[data-el="trace"]'); E.dot=q('[data-el="dot"]'); E.line=q('[data-el="line"]'); E.payoff=q('[data-el="payoff"]');
    E.wm=q('[data-el="wm"]'); E.nav=q('[data-el="nav"]'); E.cue=q('[data-el="cue"]');
    E.track=q('[data-el="track"]'); E.stage=q('[data-el="stage"]'); last={};
  }
  function apply(){
    var r=document.documentElement.style;
    r.setProperty('--green', props.accent); r.setProperty('--green-deep', props.accentDeep);
    var n = props.scrollLength*100;
    E.track.style.height = n + 'vh';
    E.track.style.height = n + 'svh';
  }
  function measure(){
    vw = E.stage.offsetWidth || innerWidth;
    vh = E.stage.offsetHeight || innerHeight;
    span = Math.max(1, E.track.offsetHeight - vh);
    wmW = E.wm.offsetWidth || vw*0.46;
    wmH = E.wm.offsetHeight || wmW*0.287;
    pw = E.payoff.scrollWidth || 1;
    var fill = vw < vh ? 0.82 : 0.5;
    bwEnd = Math.max(240, 220.9 * vw / (fill * Math.min(vw, vh)));
    if (E.trace && !pathLen) { pathLen = E.trace.getTotalLength(); E.trace.style.strokeDasharray = pathLen; }
  }
  function cl(v,a,b){ return v<a?a:v>b?b:v; }
  function seg(t,a,b){ return cl((t-a)/(b-a),0,1); }
  function ease(x){ return x<0.5 ? 4*x*x*x : 1-Math.pow(-2*x+2,3)/2; }
  function out(x){ return 1-Math.pow(1-x,3); }
  function mix(a,b,t){ return a+(b-a)*t; }
  function set(el,prop,val){ var k=el.dataset.el+prop; if(last[k]===val) return; last[k]=val; el.style[prop]=val; }

  function write(t){
    if(!vw) return;
    var z=ease(seg(t,0.02,0.72)), drift=ease(seg(t,0.58,1));
    var k620=(bwEnd||620)/620;
    var bw=mix((bwEnd||620)/props.startZoom,(bwEnd||620),z), bh=bw*(vh/vw);
    var cx=mix(46,110.4,z)+drift*46*k620, cy=mix(176,98,z)-drift*40*k620;
    var vb=(cx-bw/2).toFixed(2)+' '+(cy-bh/2).toFixed(2)+' '+bw.toFixed(2)+' '+bh.toFixed(2);
    if(last.vb!==vb){ last.vb=vb; E.inf.setAttribute('viewBox',vb); }
    set(E.inf,'opacity',(1-seg(t,0.86,0.99)).toFixed(3));

    if (pathLen) {
      var L=pathLen, tr2=out(seg(t,0.04,0.82));
      var off=(L*(1-tr2)).toFixed(1);
      if(last.dash!==off){ last.dash=off; E.trace.style.strokeDashoffset=off; }
      var tOp=(seg(t,0.01,0.10)*(1-seg(t,0.80,0.94))*0.6).toFixed(3);
      if(last.tOp!==tOp){ last.tOp=tOp; E.trace.setAttribute('opacity',tOp); }
      var dOp=seg(t,0.02,0.08)*(1-seg(t,0.74,0.86));
      var r=dOp>0.01 ? (2.6*bw/vw).toFixed(3) : 0;
      if(last.r!==r){ last.r=r; E.dot.setAttribute('r',r); }
      if(r!==0){
        var p=E.trace.getPointAtLength(L*tr2);
        E.dot.setAttribute('cx',p.x.toFixed(2));
        E.dot.setAttribute('cy',p.y.toFixed(2));
      }
      E.dot.setAttribute('opacity',dOp.toFixed(3));
    }

    var wp=ease(seg(t,0.06,0.44)), endW=Math.min(190,vw*0.34);
    var s=mix(1,endW/wmW,wp);
    var x=mix((vw-wmW)/2, Math.max(20,vw*0.028), wp);
    var y=mix((vh-wmH)/2, Math.max(18,Math.min(30,vh*0.045)), wp);
    set(E.wm,'transform','translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) scale('+s.toFixed(4)+')');

    var navOp=seg(t,0.30,0.48);
    set(E.nav,'opacity',navOp.toFixed(3));
    set(E.nav,'visibility', navOp>0.02?'visible':'hidden');
    set(E.cue,'opacity',(1-seg(t,0,0.06)).toFixed(3));

    set(E.line,'opacity',(seg(t,0.28,0.40)*(1-seg(t,0.50,0.60))).toFixed(3));
    set(E.line,'transform','translate3d(0,'+mix(30,-20,seg(t,0.24,0.62)).toFixed(1)+'px,0)');

    var pin=out(seg(t,0.54,0.68)), grow=ease(seg(t,0.68,1));
    var fsMax=Math.min((vw*0.86)/(pw/100),84);
    var fs=mix(Math.max(13,vw*0.022), Math.max(20,fsMax), grow), k=fs/100;
    var px=mix(vw*0.56,(vw-pw*k)/2,grow);
    var py=mix(vh*0.62,vh*0.5,grow)-fs*0.62;
    set(E.payoff,'transform','translate3d('+px.toFixed(1)+'px,'+py.toFixed(1)+'px,0) scale('+k.toFixed(4)+')');
    set(E.payoff,'opacity',pin.toFixed(3));
  }

  function loop(){
    requestAnimationFrame(loop);
    var top=E.track.getBoundingClientRect().top;
    var target=cl(-top/span,0,1);
    var now=performance.now(), dt=prev?Math.min(64,now-prev):16; prev=now;
    if(t===undefined||reduce) t=target;
    else t=mix(t,target,1-Math.pow(0.0001,dt/1000));
    if(Math.abs(target-t)<0.00015) t=target;
    if(settled===t) return;
    settled=t; write(t);
  }

  function boot(){
    grab(); apply(); measure(); write(0);
    addEventListener('resize', function(){ measure(); write(t||0); }, {passive:true});
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ measure(); write(t||0); });
    loop();
  }
  if(document.readyState==='loading') addEventListener('DOMContentLoaded',boot); else boot();
})();