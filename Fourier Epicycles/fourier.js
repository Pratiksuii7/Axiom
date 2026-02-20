//les do js now
let canvas,ctx;
let width,height;
let isDrawing =false;
let fourierData =[];
let time = 0;
let path =[];
let userPoints = []; //debugging is tough
let dt =0;
let speedMult = 1;
let maxCirclesPercent =1.0;
let showCircles =true;
let animId =null;
class Complex{
    constructor(re,im){
        this.re =re;
        this.im = im;
    }
    add(other){
        return new Complex(this.re+other.re,this.im+other.im);
    }
    mult(other){
        const real =this.re*other.re-this.im*other.im;
        const imag =this.re*other.im+this.im*other.re;
        return new Complex(real,imag);
    }
    amp(){
        return Math.sqrt(this.re*this.re+this.im*this.im);
    }
    phase(){
        return Math.atan2(this.im,this.re); 
    }
}
function dft(x){
    const X =[];
    const N = x.length;
    console.time('dft');
    for(let k=0;k<N;k++){
        let sum = new Complex(0,0);
        for(let n=0;n<N;n++){
            const phi =(2*Math.PI*k*n)/N;
            const c = new Complex(Math.cos(phi),-Math.sin(phi));
            sum = sum.add(x[n].mult(c));
        }
        sum.re =sum.re/N;
        sum.im = sum.im/N;
        X[k]={
            re:sum.re,
            im:sum.im,
            freq:k,
            amp:sum.amp(),
            phase:sum.phase()
        };
    }
    console.timeEnd('dft');
    return X;
}
function init(){
    canvas =document.getElementById('myCanvas');
    ctx =canvas.getContext('2d');
    window.addEventListener('resize',handleResize);
    handleResize();
    setupEvents();
    document.getElementById('btn-clear').addEventListener('click',() => {
        resetAll();
        userPoints = [];
    });
    document.getElementById('slider-speed').addEventListener('input',(e)=>{
        speedMult = parseInt(e.target.value);
    });
    document.getElementById('slider-circles').addEventListener('input',(e)=>{
        let val =parseInt(e.target.value);
        maxCirclesPercent =val/100;
        document.getElementById('circle-count-display').innerText =val + '%';
        path =[];
    });
    document.getElementById('check-show-circles').addEventListener('change',(e)=>{
        showCircles =e.target.checked;
    });
    document.getElementById('btn-demo').addEventListener('click',loadDemoData);
    console.log("App inited Waitinfg for user input.....");
    requestAnimationFrame(drawLoop);
}
function handleResize(){
    const wrapper = document.getElementById('canvas-wrapper');
    width =wrapper.clientWidth;
    height =wrapper.clientHeight;
    canvas.width = width;
    canvas.height = height;
}
function setupEvents(){
    canvas.addEventListener('mousedown',startDrawing);
    canvas.addEventListener('mousemove',keepDrawing);
    canvas.addEventListener('mouseup',stopDrawing);
    canvas.addEventListener('mouseleave',stopDrawing);
    canvas.addEventListener('touchstart', (e)=>{
        e.preventDefault();
        const touch =e.touches[0];
        const mouseEvent = new MouseEvent("mousedown",{
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
},{passive:false});
canvas.addEventListener('touchmove',(e)=>{
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent =new MouseEvent("mousemove",{
        clientX: touch.clientX,
        clientY:touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
},{passive:false});
canvas.addEventListener('touchend',(e)=>{
    const mouseEvent =new MouseEvent("mouseup",{});
    canvas.dispatchEvent(mouseEvent);
});
}
function getMousePos(evt){
    const rect =canvas.getBoundingClientRect();
    return{
        x:evt.clientX-rect.left,
        y:evt.clientY-rect.top
    };
}
function startDrawing(evt){
    isDrawing =true;
    resetAll();
    document.getElementById('drawing-indicator').style.display ='block';
    userPoints = []; 
    const pos =getMousePos(evt);
    userPoints.push(pos);
}
function keepDrawing(e){
    if(!isDrawing) return;
    const pos =getMousePos(e);
    const lastPoint =userPoints[userPoints.length-1];
    const dist= Math.hypot(pos.x-lastPoint.x,pos.y-lastPoint.y);
    if(dist>2){
        userPoints.push(pos);
    }
}
function stopDrawing(e){
    if(!isDrawing)return;
    isDrawing = false;
    document.getElementById('drawing-indicator').style.display = 'none';
    console.log("Drawing Finished. Total Points: ", userPoints.length);
    if(userPoints.length<5){
        console.warn("Not enough points to do anything useful.");
        resetAll();
        return;
    }
    processDrawing();
}
//tired of implementing the logic
function resetAll(){
    fourierData = [];
    path = [];
    time = 0;
    ctx.clearRect(0,0,width,height);
    updateStatus("Cleared...");
}
function processDrawing(){
    updateStatus("Calculating fourier transform... wait....");
    const complexPoints = [];
    for(let i=0;i<userPoints.length;i++){
        complexPoints.push(new Complex(userPoints[i].x,userPoints[i].y));
    }
    fourierData = dft(complexPoints);
    fourierData.sort((a,b)=>b.amp-a.amp);
    dt = (2*Math.PI)/fourierData.length;
    time = 0;
    path = [];
    console.log("DFT complete. sorted epicycles ready");
    updateStatus("Playing animation......");
}
let frameCounter = 0;
function drawLoop(){
    ctx.clearRect(0,0,width,height);
    if(isDrawing){
        drawUserPath();
        updateStatus(`Recording Points: ${userPoints.length}`);
    }else if(fourierData.length>0){
        let currentTip = drawEpicycles(0,0,0,fourierData);
        path.unshift(currentTip);
        ctx.beginPath();
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2;
        for(let i=0;i<path.length;i++){
            if(i===0) ctx.moveTo(path[i].x,path[i].y);
            else ctx.lineTo(path[i].x,path[i].y);
        }
        ctx.stroke();
        time +=dt*speedMult;
        if(time > Math.PI * 2){
            time = 0;
            path = [];
        }
        if(path.length>2000){ 
             path.pop(); 
        }
        frameCounter++;
        if(frameCounter%10===0){
            updateStatus(`Drawing Epicycles: ${Math.floor(fourierData.length*maxCirclesPercent)}`);
        }
    }else{
        ctx.fillStyle ='#333';
        ctx.font = '20px sans-serif';
        ctx.textAlign ='center';
        ctx.fillText("Draw something on the screen and wait for the magic hehe...", width/2,height/2);
    }
    animId =requestAnimationFrame(drawLoop);
}
function drawUserPath(){
    ctx.beginPath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth =2;
    for(let i=0;i<userPoints.length;i++){
        if(i===0)ctx.moveTo(userPoints[i].x,userPoints[i].y);
        else ctx.lineTo(userPoints[i].x,userPoints[i].y);
    }
    ctx.stroke();
}
function drawEpicycles(x,y,rotation,fourier){
    let limit =Math.floor(fourier.length*maxCirclesPercent);
    if(limit<1)limit =1;
    for(let i=0;i<limit;i++){
        let prevX =x;
        let prevY = y;
        let freq = fourier[i].freq;
        let radius = fourier[i].amp;
        let phase = fourier[i].phase;
        let currentAngle =freq*time+phase+rotation;
        x +=radius*Math.cos(currentAngle);
        y += radius*Math.sin(currentAngle);
        if(showCircles){
            ctx.beginPath();
            ctx.strokeStyle ='rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            ctx.arc(prevX,prevY,radius,0,2*Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(prevX,prevY);
            ctx.lineTo(x,y);
            ctx.strokeStyle ='rgba(255,255,255,0.5)';
            ctx.stroke();
        }
    }
    return{
        x:x,
        y:y
    };
}
function updateStatus(msg){
    document.getElementById('status-bar').innerText = `Status: ${msg}`;
}
function loadDemoData(){
    console.log("Loading hardcoded demo data...");
    resetAll();
    userPoints = []; 
    //okie now THIS IS THE END HOLD YOUR BREATH AND COUNT TO 10
    const fallbackPath = [
            {x: 436, y: 153}, {x: 435, y: 153}, {x: 433, y: 153}, {x: 431, y: 154}, {x: 428, y: 155}, 
            {x: 425, y: 156}, {x: 421, y: 158}, {x: 418, y: 161}, {x: 414, y: 164}, {x: 411, y: 168}, 
            {x: 408, y: 172}, {x: 405, y: 177}, {x: 402, y: 182}, {x: 399, y: 188}, {x: 397, y: 194}, 
            {x: 395, y: 201}, {x: 394, y: 208}, {x: 393, y: 216}, {x: 393, y: 224}, {x: 394, y: 232}, 
            {x: 395, y: 240}, {x: 398, y: 247}, {x: 400, y: 254}, {x: 404, y: 260}, {x: 408, y: 265}, 
            {x: 412, y: 269}, {x: 417, y: 272}, {x: 422, y: 274}, {x: 427, y: 275}, {x: 432, y: 274}, 
            {x: 437, y: 272}, {x: 442, y: 269}, {x: 446, y: 265}, {x: 450, y: 260}, {x: 454, y: 254}, 
            {x: 457, y: 247}, {x: 459, y: 240}, {x: 461, y: 232}, {x: 462, y: 224}, {x: 462, y: 216}, 
            {x: 461, y: 208}, {x: 460, y: 201}, {x: 457, y: 194}, {x: 454, y: 188}, {x: 450, y: 182}, 
            {x: 446, y: 177}, {x: 441, y: 172}, {x: 436, y: 168}, {x: 431, y: 164}, {x: 426, y: 161}, 
            {x: 421, y: 158}, {x: 415, y: 156}, {x: 409, y: 155}, {x: 404, y: 154}, {x: 398, y: 153}, 
            {x: 393, y: 153}, {x: 387, y: 153}, {x: 382, y: 154}, {x: 377, y: 155}, {x: 372, y: 156}, 
            {x: 367, y: 158}, {x: 362, y: 161}, {x: 357, y: 164}, {x: 353, y: 168}, {x: 349, y: 172}, 
            {x: 345, y: 177}, {x: 342, y: 182}, {x: 339, y: 188}, {x: 337, y: 194}, {x: 335, y: 201}, 
            {x: 334, y: 208}, {x: 333, y: 216}, {x: 333, y: 224}, {x: 334, y: 232}, {x: 336, y: 240}, 
            {x: 338, y: 247}, {x: 341, y: 254}, {x: 344, y: 260}, {x: 348, y: 265}, {x: 353, y: 269}, 
            {x: 358, y: 272}, {x: 363, y: 274}, {x: 368, y: 275}, {x: 374, y: 274}, {x: 380, y: 272}, 
            {x: 385, y: 269}, {x: 391, y: 265}, {x: 396, y: 260}, {x: 401, y: 254}, {x: 406, y: 247}, 
            {x: 411, y: 240}, {x: 416, y: 232}, {x: 421, y: 224}, {x: 425, y: 216}, {x: 430, y: 208}, 
            {x: 435, y: 201}, {x: 439, y: 194}, {x: 444, y: 188}, {x: 448, y: 182}, {x: 453, y: 177}, 
            {x: 457, y: 172}, {x: 462, y: 168}, {x: 466, y: 164}, {x: 470, y: 161}, {x: 474, y: 158}, 
            {x: 478, y: 156}, {x: 482, y: 155}, {x: 486, y: 154}, {x: 490, y: 153}, {x: 494, y: 153},
    ];
    //ahhh <nothing>
    userPoints =[];
    let cx =width/2;
    let cy = height/2;
    if(!cx || cx===0) cx=400; 
    if(!cy || cy===0) cy=300;
    let scale = 150;
    for(let t=0;t<Math.PI*4;t+=0.02){
        let dx = scale*Math.sin(3*t+Math.PI/4)+(scale/2)*Math.cos(t);
        let dy = scale * Math.sin(2*t)+(scale/3)*Math.sin(4*t);
        userPoints.push({
            x:cx+dx,
            y:cy+dy
        });
    }
    for(let i=0;i<userPoints.length;i++){
        userPoints[i].x +=(Math.random()-0.5)*3;
        userPoints[i].y +=(Math.random()-0.5)*3;
    }
    console.log(`Generated ${userPoints.length} points for the demo shape.`);
    processDrawing();
}
function distance(p1,p2){
    return Math.sqrt(Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2));
}
window.requestAnimationFrame = (function(){
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           function(callback){
            window.setTimeout(callback,1000/60);
           };
})();
document.addEventListener("DOMContentLoaded",init);
//done man i am tired