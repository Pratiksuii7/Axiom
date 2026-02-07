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
        log("Error: Phusics broke (NaN detected), Resetting velocities");
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
    let den_2 = r2*(2*m1*m2-m2-m2*Math.cos(2*a1-2*a2));
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
    ctx.fillRect(0,0,CanvasRenderingContext2D.width,cvs.height);
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
    ctx.arc(x1,y1,r1_raius,0,2*Math.PI);
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

