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
    })
}