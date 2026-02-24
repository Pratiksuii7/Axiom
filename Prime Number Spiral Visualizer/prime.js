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
//i am so fired up lesss gooooo
function requestRender(){
    if(renderTimer)clearTimeout(renderTimer);
    renderTimer =setTimeout(()=>{
        render();
    },10);
}
function render(){
    const start = performance.now();
    const maxPoints =parseInt(numPointsInput.value);
    const rawDotSize = parseFloat(dotSizeInput.value);
    const drawLines =showLinesCheck.checked;
    const drawText = showNumbersCheck.checked;
    const highlightComposites =highlightCompositesCheck.checked;
    const pColor= colorPrime.value;
    const lColor = colorLine.value;
    const bgColor =colorBg.value;
    const rect =canvas.parentElement.getBoundingClientRect();
    ctx.clearRect(0,0,rect.width,rect.height);
    const baseSpacing =20;
    generateSpiralData(maxPoints,baseSpacing);
    ctx.save();
    ctx.translate(camera.x,camera.y);
    ctx.scale(camera.zoom,camera.zoom);
    let primesFound = 0;
    if(drawLines&&generatedPoints.length>1){
        ctx.beginPath();
        ctx.moveTo(generatedPoints[0].x,generatedPoints[0].y);
        for(let i=1;i<generatedPoints.length;i++){
            ctx.lineTo(generatedPoints[i].x,generatedPoints[i].y);
        }
        ctx.strokeStyle =lColor;
        ctx.lineWidth =1/camera.zoom;
        ctx.stroke();
    }
    const primePoints= [];
    const compositePoints =[];
    for(let i=0;i<generatedPoints.length;i++){
        const pt= generatedPoints[i];
        if(pt.isPrime){
            primePoints.push(pt);
            primesFound++;
        }else{
            compositePoints.push(pt);
        }
    }
    if(highlightComposites){
        ctx.fillStyle= '#475569';
        for(let i=0;i<compositePoints.length;i++){
            const pt = compositePoints[i];
            if(pt.isPrime){
                primePoints.push(pt);
                primesFound++;
            }else{
                compositePoints.push(pt);
            }
        }
        if(highlightComposites){
            ctx.fillStyle= '#475569';
            for(let i=0;i<compositePoints.length;i++){
                const pt = compositePoints[i];
                ctx.beginPath();
                ctx.clearRect(pt.x,pt.y,rawDotSize*0.5,0,Math.PI*2);
                ctx.fill();
            }
        }
        ctx.fillStyle =pColor;
        for(let i=0;i<primePoints.length;i++){
            const pt = primePoints[i];
            ctx.beginPath();
            ctx.arc(pt.x,pt.y,rawDotSize,0,Math.PI*2);
            ctx.fill();
        }
        if(drawText){
            ctx.fillStyle = '#ffffff';
            ctx.textAlign ='center';
            ctx.textBaseline ='middle';
            if(camera.zoom>0.5||maxPoints<1000){
                const fontSize = Math.max(8,12/camera.zoom);
                ctx.font =`${fontSize}px Arial`;
                for(let i=0;i<generatedPoints.length;i++){
                    const pt= generatedPoints[i];
                    ctx.fillText(pt.n,pt.x,pt.y-(rawDotSize+5)/camera.zoom);
                }
            }
        }
        ctx.restore();
        const end =performance.now();
        statsArea.innerText =`
        Render Time: ${(end - start).toFixed(1)} ms<br>
        Total Numbers: ${maxPoints}<br>
        Primes Found: ${primesFound} (${((primesFound/maxPoints)*100).toFixed(1)}%)<br>
        Zoom Level: ${camera.zoom.toFixed(2)}x
        `;
    }
}
function setupMouseEvents(){
    canvas.addEventListener('mousedown',(e)=>{
        isDragging = true;
        lastMouseX =e.clientX;
        lastMouseY = e.clientY;
    });
    window.addEventListener('mouseup',()=>{
        isDragging =false;
    });
    window.addEventListener('mousemove',(e)=>{
        if(isDragging){
            const dx= e.clientX- lastMouseX;
            const dy =e.clientY-lastMouseY;
            camera.x +=dx;
            camera.y +=dy;
            lastMouseX =e.clientX;
            lastMouseY= e.clientY;
            requestRender();
        }
        if(!isDragging){
            handleTooltip(e);
        }
    });
    canvas.addEventListener('wheel',(e)=>{
        e.preventDefault();
        const rect =canvas.getBoundingClientRect();
        const mouseX= e.clientX- rect.left;
        const mouseY =e.clientY- rect.top;
        const worldX= (mouseX-camera.x)/camera.zoom;
        const worldY =(mouseY-camera.y)/camera.zoom;
        const zoomIntensity = 0.1;
        const wheel = e.deltaY<0?1:-1;
        let newZoom= Math.exp(wheel*zoomIntensity)*camera.zoom;
        newZoom =Math.max(0.01,Math.min(newZoom,50));
        camera.zoom= newZoom;
        camera.x= mouseX-worldX*camera.zoom;
        camera.y = mouseY-worldY*camera.zoom;
        requestRender();
    },{passive:false});
}
function handleTooltip(e){
    
}