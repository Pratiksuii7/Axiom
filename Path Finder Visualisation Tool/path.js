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
const canvas = document.getElementById('gridCanvas');
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
        const temp = this.heap[i1];
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
        const item = this.heap[0];
        this.heap[0]=this.heap.pop();
        this.heapifyDown();
        return item;
    }
    isEmpty(){
        return this.heap.length===0;
    }
    heapifyUp(){
        let index = this.heap.length-1;
        while(index>0){
            let parentIndex= this.getParentIndex(index);
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
            if(rightChildIndex<this.heap.length&&this.heap[rightChildIndex].distance<this.heap[smallerChildIndex].distance){
                smallerChildIndex = rightChildIndex;
            }
            if(this.heap[index].distance<=this.heap[smallerChildIndex].distance) break;
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
    }else if(node.isWeight){
        color = CONFIG.weightcolor;
    }else if(node.isVisited){
        color=CONFIG.visitedcolor;
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
    //debugging is so hard ahhhhhhhhhhhhhh
    const node = getNodeFromPos(pos);
    if(!node) return;
    STATE.isMousePressed = true;
    STATE.mouseButton = e.button === 0 ? 'left' : 'right';
    if(node.isStart){
        STATE.draggedNode = 'isStart';
    } else if (node.isEnd){
        STATE.draggedNode = 'isEnd';
    } else {
        handleDrawAction(node);
    }
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
    const start =STATE.grid[STATE.startnode.row][STATE.startnode.col];
    const end = STATE.grid[STATE.endNode.row][STATE.endNode.col];
    logMsg(`Starting ${algo}.toupperCase()............`);
    let visitedNodesInOrder =[];
    const startTime =performance.now();
    switch(algo){
        case 'dijkstra':
            visitedNodesInOrder=dijkstra(start,end);
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
        if(currentNode.isVisited)continue;
        currentNode.isVisited = true;
        visitedOrder.push(currentNode);
        if(currentNode===endNode)return visitedOrder;
        const neighbors = getNeighbors(currentNode);
        //came back after breakfast helo
        for(const neighbor of neighbors){
            if(neighbor.isVisited||neighbor.isWall)continue;
            let moveCost=neighbor.isWeight?CONFIG.weightcost:CONFIG.defaultcost;
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
                neighbor.isVisited = true;
                queue.push(neighbor);
            }
        }

    }
    return visitedOrder;
}
function dfs(startNode,endNode){
    const visitedOrder=[];
    const stack=[startNode];
    startNode.isVisited=true;
    while(stack.length){
        const currentNode=stack.pop();
        visitedOrder.push(currentNode);
        if(currentNode===endNode) return visitedOrder;
        const neighbors=getNeighbors(currentNode);
        for(const neighbor of neighbors){
             if(!neighbor.isVisited&&!neighbor.isWall){
                neighbor.isVisited=true;
                neighbor.previousNode=currentNode;
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
    if(row<STATE.rows-1) neighbors.push(STATE.grid[row+1][col]);
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
    for(let r=0;r<STATE.rows;r++){
        for(let c=0;c<STATE.cols;c++){
            const node = STATE.grid[r][c];
            node.isVisited=false;
            node.isVisited = false;
        }
    }
}
function animateAlgorithm(visitedNodesInOrder,endNode){
    STATE.isRunning = true;
    STATE.isFinished = false;
    const speedSelect=document.getElementById('speed-select').value;
    let delay =10;
    if(speedSelect==='fast')delay=5;
    if(speedSelect==='medium')delay =20;
    if(speedSelect==='slow')delay =50;
    if(speedSelect==='instant')delay=0;
    for(let i=0;i<=visitedNodesInOrder.length;i++){
        if(i===visitedNodesInOrder.length){
            setTimeout(()=>{
                animatePath(endNode);
            },delay*i);
            return;
        }
        setTimeout(()=>{
            const node= visitedNodesInOrder[i];
            if(!node.isStart&&!node.isEnd){
                node.isVisited=true;
                drawNode(node);
            }
        },delay*i);
    }
}
//so mch tired now
function animatePath(endNode){
    const nodeInShortestPathOrder=getNodesInShortestPathOrder(endNode);
    const speedSelect=document.getElementById('speed-select').value;
    let delay=30;
    if(speedSelect==='fast')delay=10;
    for(let i=0;i<nodeInShortestPathOrder.length;i++){
        setTimeout(()=>{
            const node=nodeInShortestPathOrder[i];
            node.isPath=true;
            if(!node.isStart&&!node.isEnd){
                drawNode(node);
            }else{
                drawNode(node);
            }
            if(i===nodeInShortestPathOrder.length-1){
                STATE.isRunning=false;
                STATE.isFinished=true;
                ShowToast('Path found,Distance: '+ nodeInShortestPathOrder.length);
                logMsg('Visualization complete.yayay');
            }
        },delay*i);
    }
    if(nodeInShortestPathOrder.length===0){
       STATE.isRunning=false;
       STATE.isFinished = true;
       ShowToast("huh? No path found!")
       logMsg("No path found it cant be reached :(");
    }
}
function animateInstant(visitedNodes,endNode){
    for(const node of visitedNodes){
        node.isVisited=true;
    }
    const path=getNodesInShortestPathOrder(endNode);
    for(const node of path){
        node.isPath = true;
    }
    drawGrid();
    STATE.isRunning=false;
    STATE.isFinished=true;
}
function getNodesInShortestPathOrder(endNode){
    const nodeInShortestPathOrder=[];
    let currentNode=endNode;
    while(currentNode!==null){
        nodeInShortestPathOrder.unshift(currentNode);//these r so long
        currentNode = currentNode.previousNode;
        if(nodeInShortestPathOrder.length>STATE.rows*STATE.cols)break;
    }
    if(nodeInShortestPathOrder.length===1&&!nodeInShortestPathOrder[0].isStart){
        return[];
    }
    return nodeInShortestPathOrder;
}
//so much code done still have to do more waaaaaa
function generateRandomMaze(){
    if(STATE.isRunning)return;
    clearBoard(false);
    logMsg("generating random maze...........");
    for(let r=0;r<STATE.rows;r++){
        for(let c=0;c<STATE.cols;c++){
            const node = STATE.grid[r][c];
            if(node.isStart||node.isEnd)continue;
            if(Math.random()<0.3){
                node.isWall = true;
            }
        }
    }
    drawGrid();
}
function generateRecursiveMaze(){
    if(STATE.isRunning)return;
    clearBoard(false);
    for(let r=0;r<STATE.rows;r++){
        STATE.grid[r][0].isWall=true;
        STATE.grid[r][STATE.cols-1].isWall=true;
    }
    //lil break
    for(let c=0;c<STATE.cols;c++){
        STATE.grid[0][c].isWall=true;
        STATE.grid[STATE.rows-1][c].isWall=true;
    }
    const start=STATE.grid[STATE.startnode.row][STATE.startnode.col];
    const end=STATE.grid[STATE.endNode.row][STATE.endNode.col];
    start.isWall =false;
    end.isWall = false;
    getNeighbors(start).forEach(n=>n.isWall=false);
    getNeighbors(end).forEach(n=>n.isWall=false);
    addInnerWalls(true, 1, STATE.cols-2, 1, STATE.rows-2);
    drawGrid();
}
    function addInnerWalls(h,minX,maxX,minY,maxY){
        if(h){
            if(maxX-minX<2)return;
            const y = Math.floor(randomInt(minY,maxY)/2)*2;
            addHWall(minX,maxX,y);
            addInnerWalls(!h,minX,minY,y-1);
            addInnerWalls(!h,minX,maxX,y+1,maxY);
        } else{
            if(maxY-minY<2)return;
            const x = Math.floor(randomInt(minX,maxY)/2)*2;
            addVWall(minY,maxY,x);
            addInnerWalls(!h,minX,x-1,minY,maxY);
            addInnerWalls(!h,x+1,maxX,minY,maxY);
        }
    }
    function addHWall(minX,maxX,y){
        const hole= Math.floor(randomInt(minX,maxX)/2)*2;
        for(let i=minX;i<=maxX;i++){
            if(i!==hole&&STATE.grid[y][i].isStart&&!STATE.grid[y][i].isEnd){
                if(!STATE.grid[y][i].isStart&&!STATE.grid[y][i].isEnd){
                    STATE.grid[y][i].isWall = true;
                }
            }
        }
    }
    //so much tired af
   function addVWall(minY,maxY,x){
     const hole = Math.floor(randomInt(minY,maxY)/2)*2+1;
     for(let i=minY;i<=maxY;i++){
        if(i!==hole&&STATE.grid[i]&&STATE.grid[i][x]){
            if(!STATE.grid[i][x].isStart&& !STATE.grid[i][x]){
                STATE.grid[i][x].isWall=true;
            }
        }
     }
   }
   function randomInt(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
   }
   function clearBoard(keepWalls=false){
    if(STATE.isRunning)return;
    for(let r=0;r<STATE.rows;r++){
        for(let c=0;c<STATE.cols;c++){
            const node = STATE.grid[r][c];
            node.isVisited = false;
            node.isPath=false;
            node.distance=Infinity;
            node.totalDistance=Infinity;
            node.previousNode = null;
            if(!keepWalls){
                node.isWall=false;
                node.isWeight=false;
            }
        }
    }
    STATE.isFinished=false;
    logMsg(keepWalls?"Path cleared":"Board reset");
    drawGrid();
   }
   function logMsg(msg){
    const line =document.createElement('div');
    line.innerHTML = `> ${msg}`;
    statslog.prepend(line);
    if(statslog.children.length>20){
   statslog.removeChild(statslog.lastChild);
    }
   }
   //almost done
   function ShowToast(msg){
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(()=>{
        toast.classList.remove('show');
    },3000);
   }
   document.getElementById('visualize-btn').addEventListener('click',()=>{
    if(STATE.isRunning)return;
    clearPathOnly();
    runSelectedAlgorithm();
   });
   document.getElementById('clear-board-btn').addEventListener('click',()=>{
    clearBoard(false);
   });
   document.getElementById('gen-maze-btn').addEventListener('click',()=>{
    generateRandomMaze();
   });
   let resizeTimeout;
   window.addEventListener('resize',()=>{
    clearTimeout(resizeTimeout);
    resizeTimeout=setTimeout(()=>{
        initgrid();
    },200);
   });
   window.onload=()=>{
    initgrid();
    logMsg("Sytem's ready.yay")
   };
   //finally done now lets see it