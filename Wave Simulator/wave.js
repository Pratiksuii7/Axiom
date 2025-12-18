//lllets declare 1000 variables yayay
var maincanv = document.getElementById('maincanvas');
var mainctx = maincanv.getContext('2d');
var heatcanv = document.getElementById('intensitycanvas');
var heatctx = heatcanv.getContext('2d');
var amp1sl = document.getElementById('amp1input');
var len1sl = document.getElementById('len1input');
var amp2sl = document.getElementById('amp2input');
var len2sl = document.getElementById('len2input');
var phasesl = document.getElementById('phaseinput');
var speedsl = document.getElementById('speedinput');
var amp1disp = document.getElementById('amp1val');
var len1disp = document.getElementById('len1val');
var amp2disp = document.getElementById('amp2val');
var len2disp = document.getElementById('len2val');
var phasedisp = document.getElementById('phaseval');
var speeddisp = document.getElementById('speedval');
var cwidth = 0;
var cheight = 0;
var hheight = 0;
var time = 0;
var simstate = {
    a1:50,
    l1:100,
    a2:50,
    l2:100,
    pd:0,
    spd:0.05
};
//my first rule in js declare everything at first then it will be easy to use later kinda cool right?
function init(){
    window.addEventListener('resize', resizegraphs);
    resizegraphs();
    bindcontrols();
    animloop();
}
function resizegraphs(){
    cwidth = maincanv.offsetWidth;
    cheight = maincanv.offsetHeight;
    hheight = heatcanv.offsetHeight;
    maincanv.width = cwidth;
    maincanv.height = cheight;
    heatcanv.width = cwidth;
    heatcanv.height = hheight;
}
function bindcontrols(){
    amp1sl.addEventListener('input', function(e){
        simstate.a1 = parseInt(e.target.value);
        amp1disp.textContent = simstate.a1;
    });
    len1sl.addEventListener('input', function(e){
        simstate.l1 = parseInt(e.target.value);
        len1disp.textContent = simstate.l1;
    });
    amp2sl.addEventListener('input', function(e){
        simstate.a2 = parseInt(e.target.value);
        amp2disp.textContent = simstate.a2;
    });
    len2sl.addEventListener('input', function(e){
        simstate.l2 = parseInt(e.target.value);
        len2disp.textContent = simstate.l2;
    });
    phasesl.addEventListener('input', function(e){
        simstate.pd = parseInt(e.target.value);
        phasedisp.textContent = simstate.pd + '°';
    });
    speedsl.addEventListener('input', function(e){
        var rawval = parseInt(e.target.value);
        simstate.spd = rawval * 0.002;
        speeddisp.textContent = rawval + '%';
    });
    //that was quite complicated ig
    simstate.a1 = parseInt(amp1sl.value);
    simstate.l1 = parseInt(len1sl.value);
    simstate.a2 = parseInt(amp2sl.value);
    simstate.l2 = parseInt(len2sl.value);
    simstate.pd = parseInt(phasesl.value);
    var rawspd = parseInt(speedsl.value);
    simstate.spd = rawspd * 0.002;
    amp1disp.textContent = simstate.a1;
    len1disp.textContent = simstate.l1;
    amp2disp.textContent = simstate.a2;
    len2disp.textContent = simstate.l2;
    phasedisp.textContent = simstate.pd + '°';
    speeddisp.textContent = rawspd + '%'; /* this was also quite complicated but nah idk */
}
function drawaxes(ctx, w, h){
    ctx.beginPath();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);
    ctx.stroke();
}
function getwavey(xx, amp, len, phaseoffset){
    var k = (Math.PI * 2)/ len;
    var omega = (Math.PI * 2) * (simstate.spd * 2);
    var pbrad = phaseoffset * (Math.PI / 180);
    return amp * Math.sin(k*xx-omega*time+pbrad);
}
function drawwaves(){
    mainctx.clearRect(0,0, cwidth, cheight);
    drawaxes(mainctx, cwidth, cheight);
    var midy = cheight / 2;

    mainctx.beginPath();
    mainctx.strokeStyle = 'rgba(187,134,252,0.5)';
    mainctx.lineWidth = 2;
    for (var i=0;i<cwidth;i++){
        var y1=getwavey(i,simstate.a1, simstate.l1,0);
        if(i==0){
            mainctx.moveTo(i,midy-y1);
        } else{
            mainctx.lineTo(i,midy-y1);
        }
    }
    mainctx.stroke();
    mainctx.shadowBlur = 0;
}
/* i am tired lol*/
function drawheat(){
    heatctx.clearRect(0,0,cwidth,hheight);
    var imgdat = heatctx.createImageData(cwidth,hheight);
    var pix= imgdat.data;
    var maxpossibleamp = 200;
    for(var p=0;p<cwidth;p++){
        var wy1 = getwavey(p, simstate.a1, simstate.l1,0);
        var wy2 = getwavey(p, simstate.a2, simstate.l2, simstate.pd);
        var resy = wy1+wy2;
        var intensity = Math.abs(resy)/maxpossibleamp;
        intensity = Math.min(Math.max(intensity,0),1);
        var r = Math.floor(intensity*255);
        var g = Math.floor(Math.sin(intensity*Math.PI)*100);
        var b = Math.floor((1-intensity)*200);
        for(var y=0;y<hheight;y++){
            var idx = (y*cwidth + p)*4;
            pix[idx] = r;
            pix[idx+1] = g;
            pix[idx+2] = b;
            pix[idx+3]=255;
        }
    }
    heatctx.putImageData(imgdat, 0,0);
}
//finally last function its 11pm
function animloop(){
    drawwaves();
    drawheat();
    time++;
    requestAnimationFrame(animloop);
}
init();