//les do real programming
const PRECALCULATED_PRIMES = new Set([

]);
//gonna add these later
const canvas = document.getElementById('spiral-canvas');
const ctx = canvas.getContext('2d');
const tooltip= document.getElementById('tooltip');
const numPointsInput = document.getElementById('num-points');
const dotSizeInput =document.getElementById('dot-size');
const showLinesCheck = document.getElementById('show-lines');
const showNumbersCheck =document.getElementById('show-numbers');
const highlightCompositesCheck =document.getElementById('highlight-composites');
const pointsValText =document.getElementById('points-val');
const sizeValText =document.getElementById('size-val');
const statsArea =document.getElementById('stats-area');
const colorPrime =document.getElementById('color-prime');
const colorLine =document.getElementById('color-line');
const colorBg =document.getElementById('color-bg');
let camera={
    x:0,
    y:0,
    zoom:1
};
let isDragging =false;
let lastMouseX =0;
let lastMouseY =0;
let generatedPoints = [];
let renderTimer = null;
function init(){
    resizeCanvas();
    window.addEventListener('resize', ()=>{resizeCanvas();
        resizeCanvas();
        requestRender();
    });
    numPointsInput.addEventListener('input',(e)=>{
        pointsValText.innerText= e.target.value;
        requestRender();
    });
    dotSizeInput.addEventListener('input',(e)=>{
        sizeValText.innerText= e.target.value;
        requestRender();
    });
    showLinesCheck.addEventListener('change',requestRender);
    showNumbersCheck.addEventListener('change',requestRender);
    highlightCompositesCheck.addEventListener('change',requestRender);
    colorPrime.addEventListener('input',requestRender);
    colorLine.addEventListener('input',requestRender);
    colorBg.addEventListener('input',(e)=>{
        document.body.style.backgroundColor= e.target.value;
        requestRender();
    });
    document.getElementById('btn-reset').addEventListener('click',()=>{
        camera.zoom =1;
        centerCamera();
        requestRender();
    });
    document.getElementById('btn-center').addEventListener('click',()=>{
        centerCamera();
        requestRender();
    });
    setupMouseEvents();
    centerCamera();
    render();
}
function resizeCanvas(){
    const dpr= window.devicePixelRatio||1;
    const rect = canvas.getBoundingClientRect();
    canvas.style.width = rect.width *dpr;
    canvas.style.height = rect.height*dpr;
    ctx.scale(dpr,dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height =`${rect.height}px`;
}
function centerCamera(){
    const rect= canvas.parentElement.getBoundingClientRect();
    camera.x= rect.width/2;
    camera.y =rect.height/2;
}
function checkIsPrime(n){
    if(n<=1)return false;
    if(n<7919){
        return PRECALCULATED_PRIMES.has(n);
    }
    if(n%2===0||n%3===0)return false;
    let i=5;
    while(i*i<=n){
        if(n%i===0||n%(i+2)===0)return false;
        i+=6;
    }
    return true;
}
function generateSpiralData(maxNum,spacing){
    generatedPoints =[];
    let currentX =0;
    let currentY = 0;
    let stepLength =1;
    let currentStep =0;
    let direction = 'RIGHT';
    let changes =0;
    for(let i=1;i<=maxNum;i++){
        let isItPrime =checkIsPrime(i);
        generatedPoints.push({
            n:i,
            x:currentX,
            y:currentY,
            isPrime:isItPrime
        });
        if(direction==='RIGHT'){
            currentX +=spacing;
        }else if(direction==='UP'){
            currentY -=spacing;
        }else if(direction==='LEFT'){
            currentX -=spacing;
        }else if(direction==='DOWN'){
            currentY +=spacing;
        }
        currentStep++;
        if(currentStep===stepLength){
            currentStep =0;
            changes++;
            if(direction==='RIGHT')direction='UP';
            else if(direction==='UP')direction ='LEFT';
            else if(direction==='LEFT')direction = 'DOWN';
            else if(direction==='DOWN') direction ='RIGHT';
            if(changes===2){
                changes =0;
                stepLength++;
            }
        }
    }
}
