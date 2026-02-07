//lets do js the logical part
const cvs = document.getElementById('simCanvas');
const ctx = cvs.getContext('2d');
const cx =cvs.width/2;
const cy = cvs.height/3;
let isRunning =false;
let framecount=0;
let physicsInterval=null;
let r1 = 100;
let r2 = 100;
let m1 =10;
let m2 = 10;
let a1 = Math.PI/2;
let a2 = Math.PI/2;
let a1_v = 0;
let a2_v =0;
let a1_a = 0;
let a2_a = 0;
let g=1;
let trail = [];
let maxtrail =500;
const color_rod = '#eee';
const color_bob_1 = '#3498db';
const color_bob_2 ='#e74c3c';
const color_trail ='rgba(231,76,60,0.4)';
//its probab more than 1m variables
function updateDisplay(id,val){
    const el=document.getElementById('val-'+ id);
    if(el){
        el.innerText=Math.round(val*10)/10;
    }
}
function log(msg){
    const logdiv = document.getElementById('debug-log');
    const time = new Date().toLocaleTimeString();
    logdiv.innerHTML+= `<div>[${time}] ${msg}</div>`;
    logdiv.scrollTop = logdiv.scrollHeight;
}
function d2r(deg){
    return deg*(Math.PI/180);
}
function r2d(rad){
    return rad*(180/Math.PI);
}
function calculatephysics(){
    if(isNaN(a1)||isNaN(a2)){
        log("Error: Physics broke (NaN detected), Resetting velocities");
        a1_v=0;
        a2_v=0;
        return;
    }
    let num1 = -g*(2*m1+m2)*Math.sin(a1);
    let num2= -m2*g*Math.sin(a1-2*a2);
    let num3 = -2*Math.sin(a1-a2)*m2;
    let num4 = (a2_v*a2_v*r2+a1_v*a1_v*r1*Math.cos(a1-a2));
    let den =r1*(2*m1+m2-m2*Math.cos(2*a1-2*a2));
    if(den===0)den=0.0001;
    a1_a =(num1+num2+num3*num4)/den;
    let num1_2 = 2*Math.sin(a1-a2);
    let num2_2 = (a1_v*a1_v*r1*(m1+m2));
    let num3_2 =g*(m1+m2)*Math.cos(a1);
    let num4_2 = a2_v*a2_v*r2*m2*Math.cos(a1-a2);
    let den_2 = r2*(2*m1+m2-m2*Math.cos(2*a1-2*a2));
    if(den_2===0) den_2=0.0001;
    a2_a= (num1_2*(num2_2+num3_2+num4_2))/den_2;
    a1_v += a1_a;
    a2_v += a2_a;
    a1 +=a1_v;
    a2 +=a2_v;
    a1_v *= 0.999;
    a2_v *= 0.999;
}
//back again today i am gonna finish all
function draw(){
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,cvs.width,cvs.height);
    let x1 = r1*Math.sin(a1);
    let y1 =r1*Math.cos(a1);
    let x2=x1+r2*Math.sin(a2);
    let y2 = y1+ r2*Math.cos(a2);
    x1+=cx;
    y1 += cy;
    x2 += cx;
    y2 += cy;
    if(isRunning){
        trail.push({
            x:x2,
            y:y2
        });
        if(trail.length>maxtrail){
            trail.shift();
        }
    }
    if(trail.length>1){
        ctx.beginPath();
        ctx.strokeStyle=color_trail;
        ctx.lineWidth =1;
        ctx.moveTo(trail[0].x,trail[0].y);
        for(let i=1;i<trail.length;i++){
            ctx.lineTo(trail[i].x,trail[i].y);
        }
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.strokeStyle=color_rod;
    ctx.lineWidth=3;
    ctx.moveTo(cx,cy);
    ctx.lineTo(x1,y1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = color_bob_1;
    let r1_radius = Math.max(5, m1);
    ctx.arc(x1,y1,r1_radius,0,2*Math.PI);
    ctx.fill();
    ctx.beginPath();
    let r2_radius=Math.max(5,m2);
    ctx.arc(x2,y2,r2_radius,0,2*Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle ='#fff';
    ctx.arc(cx,cy,3,0,2*Math.PI);
    ctx.fill();
}
function loop(){
    if(isRunning){
        calculatephysics();
        framecount++;
        if(framecount%600===0){}
    }
    draw();
    requestAnimationFrame(loop);
}
document.getElementById('m1').addEventListener('input',(e)=>{
    m1=parseFloat(e.target.value);
    updateDisplay('m1',m1);
});
document.getElementById('l1').addEventListener('input',(e)=>{
    r1 = parseFloat(e.target.value);
    updateDisplay('l1',r1);
    if(!isRunning)draw();
});
document.getElementById('a1').addEventListener('input',(e)=>{
    let deg=parseFloat(e.target.value);
    a1 = d2r(deg);
    updateDisplay('a1',deg);
    if(!isRunning)draw();
});
document.getElementById('m2').addEventListener('input',(e)=>{
    m2 =parseFloat(e.target.value);
    updateDisplay('m2',m2);
});
document.getElementById('l2').addEventListener('input',(e)=>{
    r2 =parseFloat(e.target.value);
    updateDisplay('l2',r2);
    if(!isRunning) draw();
});
document.getElementById('a2').addEventListener('input',(e)=>{
    let deg=parseFloat(e.target.value);
    a2 = d2r(deg);
    updateDisplay('a2',deg);
    if(!isRunning)draw();
});
document.getElementById('g').addEventListener('input',(e)=>{
    g=parseFloat(e.target.value);
    updateDisplay('g',g);
});
document.getElementById('trailLen').addEventListener('input',(e)=>{
    maxtrail= parseInt(e.target.value);
    updateDisplay('trails',maxtrail);
    if(trail.length>maxtrail){
        trail = trail.slice(trail.length-maxtrail);
    }
});
//tired alrdy
document.getElementById('btn-start').addEventListener('click',()=>{
    isRunning = true;
    log("Simulation started.");
});
document.getElementById('btn-stop').addEventListener('click',()=>{
    isRunning = false;
    log("simulation paused.");
});
document.getElementById('btn-reset').addEventListener('click',()=>{
    isRunning =false;
    a1_v = 0;
    a2_v =0;
    a1_a = 0;
    a2_a =0;
    let sliderA1 = document.getElementById('a1');
    let sliderA2=document.getElementById('a2');
    a1 = d2r(parseFloat(sliderA1.value));
    a2 = d2r(parseFloat(sliderA2.value));
    trail =[];
    draw();
    log("simulation reset");
});
document.getElementById('btn-clear-trails').addEventListener('click',()=>{
    trail=[];
    draw();
});
function loadPreset(name){
    isRunning = false;
    a1_v = 0;
    a2_v=0;
    trail =[];
    switch(name){
        case 'classic':
            setVals(10,10,100,100,90,90,1);
            break;
        case 'balanced':
            setVals(15,15,120,120,180,179,1);
            break;
        case 'heavy-bottom':
            setVals(10,30,100,100,90,0,1);
            break;
        case 'long-short':
            setVals(10,10,150,50,90,90,1);
            break;
        case 'high-energy':
            setVals(10,10,100,100,180,90,1.5);
            break;
        case 'tiny':
            setVals(5,5,40,40,45,45,1);
            break;
        default: 
        log("Unknown preset: " + name);
    }
    draw();
    log("Loaded preset: " + name);
}
function setVals(_m1,_m2,_l1,_l2,_a1,_a2,_g){
    m1 =_m1;
    m2 =_m2;
    r1=_l1;
    r2=_l2;
    a1=d2r(_a1);
    a2= d2r(_a2);
    g=_g;
    document.getElementById('m1').value =m1;
    document.getElementById('m2').value =m2;
    document.getElementById('l1').value = r1;
    document.getElementById('l2').value =r2;
    document.getElementById('a1').value= _a1;
    document.getElementById('a2').value = _a2;
    document.getElementById('g').value = g;
    
    updateDisplay('m1',m1);
    updateDisplay('m2',m2);
    updateDisplay('l1',r1);
    updateDisplay('l2',r2);
    updateDisplay('a1',_a1);
    updateDisplay('a2',_a2);
    updateDisplay('g',g);
}
log("Initializing be ready to enjoy!!");
draw();
requestAnimationFrame(loop);
//finally done the js yaya it works