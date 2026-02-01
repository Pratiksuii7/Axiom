//les dp js yay now i can write comments with // YAYAYAY
const CONFIG = {
    cellsize:25,
    gridgap:1,
    wallcolor: '#393e46',
    pathcolor: '#ffd369',
    startcolor: '#00ff66',
    endcolor: '#ff0055',
    visitedcolor: 'rgba(0,173,181,0.4)',
    defaultcolor:'#1a1a1a',
    weightcolor:'#5c4b37',
    defaultcost:1,
    weightcost:5
};
const STATE = {
    isRunning:false,
    isFinished:false,
    grid:[],
    cols:0,
    rows:0,
    startnode:{
        row:10,
        col:10
    },
    endNode:{
        row:10,
        col:40
    },
    isMousePressed:false,
    mouseButton: 'left',
    draggedNode:null,
    selectedalgo:'dijkstra',
    animationspeed:10,
};
const canvas = document.getElementById('gridcanvas');
const ctx = canvas.getContext('2d');
const statslog =document.getElementById('stats-log');
const toast = document.getElementById('toast');
class PriorityQueue{
    constructor(){
        this.heap = [];
    }
    getParentIndex(i){
        return Math.floor((i-1)/2);
    }
    getLeftChildIndex(i){
        return 2*i+1;
    }
    getRightChildIndex(i){
        return 2*i+2;
    }
    //lil break time
    //i am back
    swap(i1,i2){
        const temp = this.head[i1];
        this.heap[i1]=this.heap[i2];
        this.heap[i2]=temp;
    }
    enqueue(node){
        this.heap.push(node);
        this.heapifyUp();
    }
    dequeue(){
        if(this.heap.length===0)return null;
        if(this.heap.length===1) return this.heap.pop();
        const item = this.hrap[0];
        this.heap[0]=this.heap.pop();
        return item;
    }
    isEmpty(){
        return this.heap.length===0;
    }
    heapifyUp(){
        let index = this.heap.length-1;
        while(index>0){
            let parentIndex= this.heap.length-1;
            if(this.heap[parentIndex].distance<=this.heap[index].distance) break;
            this.swap(index,parentIndex);
            index=parentIndex;
        }
    }
    heapifyDown(){
        let index = 0;
        while(this.getLeftChildIndex(index)<this.heap.length){
            let smallerChildIndex =this.getLeftChildIndex(index);
            let rightChildIndex=this.getRightChildIndex(index);
            if(rightChildIndex<this.heap.length&&this.heap[rightChildIndex].distance<this.heap[smallerChildIndex].distance) break;
            this.swap(index,smallerChildIndex);
            index= smallerChildIndex;
        }
    }
}
function initgrid(){
    const container =document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height=container.clientHeight;
    canvas.width=width;
    canvas.height=height;
    STATE.cols = Math.floor(width/CONFIG.cellsize);
    STATE.rows =Math.floor(height/CONFIG.cellsize);
    logMsg(`Resizing grid: ${STATE.cols}x${STATE.rows}`);
    const newGrid=[];
    for(let r=0;r<STATE.rows;r++){
        let currentRow =[];
        for(let c=0;c<STATE.cols;c++){
            currentRow.push(createNode(r,c));
        }
        newGrid.push(currentRow);
    }
    STATE.grid=newGrid;
    if(STATE.startnode.row>=STATE.rows||STATE.startnode.col>=STATE.cols){
        STATE.startnode={
            row:Math.floor(STATE.rows/2),
            col:Math.floor(STATE.cols/4)
        };
    }
        if(STATE.endNode.row>=STATE.rows||STATE.endNode.col>=STATE.cols){
            STATE.endNode={
                row:Math.floor(STATE.rows/2),
                col:Math.floor(STATE.cols*0.75)
            };
    }
    const start=STATE.grid[STATE.startnode.row][STATE.startnode.col];
    const end = STATE.grid[STATE.endNode.row][STATE.endNode.col];
    start.isStart = true;
    end.isEnd = true;
    drawGrid();
}
function createNode(row,col){
    return{
        row:row,
        col:col,
        isStart:false,
        isEnd:false,
        isWall:false,
        isWeight:false,
        isVisited:false,
        isPath:false,//lmao so much is.....? 
        distance:Infinity,
        totalDistance:Infinity,
        heuristic:0,
        previousNode:null
    };
}
function drawGrid(){
    
}