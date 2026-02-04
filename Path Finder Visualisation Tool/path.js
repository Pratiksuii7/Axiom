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
    ctx.fillStyle=CONFIG.defaultcolor;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    for(let r=0;r<STATE.rows;r++){
        for(let c=0;c<STATE.cols;c++){
            drawNode(STATE.grid[r][c]);
        }
    }
}
function drawNode(node){
    const x=node.col*CONFIG.cellsize;
    const y = node.row*CONFIG.cellsize;
    const size=CONFIG.cellsize-CONFIG.gridgap;
    let color = CONFIG.defaultcolor;
    if(node.isStart){
        color=CONFIG.startcolor;
    }else if(node.isEnd){
        color = CONFIG.endcolor;
    }else if(node.isWall){
        color = CONFIG.wallcolor;
    }else if(node.isPath){
        color = CONFIG.pathcolor;
    }else if(node.isVisited){
        color=CONFIG.weightcolor;
    }
    ctx.fillStyle= color;
    if(node.isVisited&&!node.isStart&&!node.isEnd&&!node.isPath){
         ctx.fillRect(x,y,size,size);
         ctx.fillStyle = 'rgba(0,0,0,0.3)';
         ctx.beginPath();
         ctx.arc(x+size/2,y+size/2,size/3,0,2*Math.PI);
         ctx.fill();
    } else{
        ctx.fillRect(x,y,size,size);
    }
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x,y,size,size);
}
function getMousepos(evt){
    const rect =canvas.getBoundingClientRect();
    return{
        x:evt.clientX-rect.left,
        y:evt.clientY-rect.top,
    };
}
function getNodeFromPos(pos){
    const c = Math.floor(pos.x/CONFIG.cellsize);
    const r = Math.floor(pos.y/CONFIG.cellsize);
    if(r<0||r>=STATE.rows||c<0||c>=STATE.cols) return null;
    return STATE.grid[r][c];
}
canvas.addEventListener('mousedown',(e)=>{
    if(STATE.isRunning) return;
    const pos = getMousepos(e);
});
//i am so cooked its 12am almost
canvas.addEventListener('mousemove',(e)=>{
    if(!STATE.isMousePressed||STATE.isRunning)return;
    const pos = getMousepos(e);
    const node =getNodeFromPos(pos);
    if(!node)return;
    if(STATE.draggedNode){
        if(STATE.draggedNode==='isStart'){
            if(!node.isEnd&&!node.isWall){
                STATE.grid[STATE.startnode.row][STATE.startnode.col].isStart =false;
                drawNode(STATE.grid[STATE.startnode.row][STATE.startnode.col]);
                STATE.startnode ={
                    row:node.row,
                    col:node.col
                };
                node.isStart = true;
                drawNode(node);
                if(STATE.isFinished){
                    clearPathOnly();
                    runSelectedAlgorithm(true);
                }
            }
        } else if(STATE.draggedNode==='isEnd'){
            if(!node.isStart&&!node.isWall){
                STATE.grid[STATE.endNode.row][STATE.endNode.col].isEnd=false;
                drawNode(STATE.grid[STATE.endNode.row][STATE.endNode.col]);
                STATE.endNode={
                    row:node.row,
                    col:node.col
                };
                node.isEnd = true;
                drawNode(node);
                if(STATE.isFinished){
                    clearPathOnly();
                    runSelectedAlgorithm(true);
                }
            }
        }
    }else{
        handleDrawAction(node);
    }
});
//i am back
window.addEventListener('mouseup',()=>{
    STATE.isMousePressed = false;
    STATE.draggedNode=null;
});
canvas.addEventListener('contextmenu',(e)=>e.preventDefault());

function handleDrawAction(node){
    if(node.isStart||node.isEnd) return;
    if(STATE.mouseButton==='left'){
        node.isWeight=false;
        node.isWall = true;
    } else{
        node.isWall=false;
        node.isWeight = true;
    }
    drawNode(node);
}
function runSelectedAlgorithm(instant=false){
    resetDistances();
    const algo = document.getElementById('algo-select').value;
    const start =STATE.grid[STATE.startnode.row][STATE.endNode.col];
    logMsg(`Starting ${algo}.toupperCase()............`);
    let visitedNodesInOrder =[];
    const startTime =performance.now();
    switch(algo){
        case 'dijkstra':
            visitedNodesInOrder=djkstra(start,end);
            break;
        case'astar':
            visitedNodesInOrder =aStar(start,end);
            break;
        case 'bfs':
            visitedNodesInOrder = bfs(start,end);
            break;
        case 'dfs':
            visitedNodesInOrder=dfs(start,end);
            break;
    }
    const duration =(performance.now()-startTime).toFixed(2);
    logMsg(`Algorithm finished in ${duration}ms. Nodes visited: ${visitedNodesInOrder.length}`);
    if(instant){
        animateInstant(visitedNodesInOrder,end);
    }else{
        animateAlgorithm(visitedNodesInOrder,end);
    }
}
function dijkstra(startNode,endNode){
    const visitedOrder=[];
    startNode.distance=0;
    const pq= new PriorityQueue();
    pq.enqueue(startNode);
    const allNodes = getAllNodesFlat();
    while(!pq.isEmpty()){
        const closestNode =pq.dequeue();
        if(closestNode.isWall) continue;
        if(closestNode.distance===Infinity) break;
        closestNode.isVisited = true;
        visitedOrder.push(closestNode);
        if(closestNode===endNode)return visitedOrder;
        updateUnvisitedNeighbors(closestNode,pq);
    }
    return visitedOrder;
}
function aStar(startNode,endNode){
    const visitedOrder =[];
    startNode.distance = 0;
    startNode.totalDistance = 0;
    startNode.heuristic=0;
    const openSet =new PriorityQueue();
    openSet.enqueue(startNode);
    while(!openSet.isEmpty()){
        const currentNode = openSet.dequeue();
        if(currentNode.isWall) continue;
        if(currentNode.visited)continue;
        currentNode.isVisited = true;
        visitedOrder.push(currentNode);
        if(currentNode===endNode)return visitedOrder;
        const neighbors = getNeighbors(currentNode);
        //came back after breakfast helo
        for(const neighbor of neighbors){
            if(neighbor.isVisited||neighbor.isWall)continue;
            let moveCost=neighbor.isWeight?CONFIG.weightCost:CONFIG.defaultcost;
            let tentativeG=currentNode.distance+moveCost;
            if(tentativeG<neighbor.distance){
                neighbor.previousNode =currentNode;
                neighbor.distance = tentativeG;
                neighbor.heuristic=Math.abs(neighbor.col-endNode.col)+Math.abs(neighbor.row-endNode.row);
                neighbor.totalDistance =neighbor.distance+neighbor.heuristic;
                neighbor.priority =neighbor.totalDistance;
                neighbor.realG =tentativeG;
                neighbor.distance=neighbor.totalDistance;
                openSet.enqueue(neighbor)
            }
        }
    }
    return visitedOrder;
}
function bfs(startNode,endNode){
    const visitedOrder = [];
    const queue =[startNode];
    startNode.isVisited = true;
    while(queue.length){
        const currentNode = queue.shift();
        visitedOrder.push(currentNode);
        if(currentNode===endNode)return visitedOrder;
        const neighbors=getNeighbors(currentNode);
        for(const neighbor of neighbors){
            if(!neighbor.isVisited&&!neighbor.isWall){
                neighbor.previousNode = currentNode;
                stack.push(neighbor);
            }
        }

    }
    return visitedOrder;
}
function updateUnvisitedNeighbors(node,pq){
    const neighbors=getNeighbors(node);
    for(const neighbor of neighbors){
        if(neighbor.isVisited)continue;
        const weight =neighbor.isWeight?CONFIG.weightcost:CONFIG.defaultcost;
        const newDist = node.distance+weight;
        if(newDist<neighbor.distance){
            neighbor.distance=newDist;
            neighbor.previousNode =node;
            pq.enqueue(neighbor);
        }
    }
}
function getNeighbors(node){
    const neighbors =[];
    const{col,row}=node;
    if(row>0)neighbors.push(STATE.grid[row-1][col]);
    if(row<STATE.rows-1) neighbors.push(STATE,grid[row+1][col]);
    if(col>0)neighbors.push(STATE.grid[row][col-1]);
    if(col<STATE.cols-1) neighbors.push(STATE.grid[row][col+1]);
    return neighbors;
}
function getAllNodesFlat(){
    const nodes=[];
    for(const row of STATE.grid){
        for(const node of row){
            nodes.push(node);
        }
    }
    return nodes;
}
function resetDistances(){
    for(let r=0;r<STATE.rows;r++){
        for(let c=0;c<STATE.cols;c++){
            const node =STATE.grid[r][c];
            node.distance=Infinity;
            node.totalDistance=Infinity;
            node.isVisited = false;
            node.isPath = false;
            node.previousNode=null;
        }
    }
}
function clearPathOnly(){
    
}