//les do js now
let canvas,ctx;
let width,height;
let isDrawing =[];
let fourierData =[];
let time = 0;
let path =[];
let dt =0;
let speedMult = 5;
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
    const N = X.length;
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
    document.getElementById('btn-clear').addEventListener('click',resetAll);
    document.getElementById('slider-speed').addEventListener('input',(e)=>{
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
    
})
}