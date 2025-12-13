// lets see 1000000000 var's
var simcanvas = document.getElementById('maincanvas');
var simctx = simcanvas.getContext('2d');
var graphcanvas = document.getElementById('graphcanvas');
var graphctx = graphcanvas.getContext('2d');
var m1input = document.getElementById('m1slider');
var m2input = document.getElementById('m2slider');
var v1input = document.getElementById('v1slider');
var v2input = document.getElementById('v2slider');
var m1label = document.getElementById('labelm1');
var v1label = document.getElementById('labelv1');
var m2label = document.getElementById('labelm2');
var v2label = document.getElementById('labelv2');
var v1curr = document.getElementById('curv1');
var v2curr = document.getElementById('curv2');
var momdisp = document.getElementById('totalmom');
var energydisp = document.getElementById('totalenergy');
var logger = document.getElementById('logbox');
var statusdisp = document.getElementById('simstatus');
var startbtn = document.getElementById('startbtn');
var resetbtn = document.getElementById('resetbtn');
var active = false;
var simtime = 0;
var lastframe = 0;
var cw = 0;
var ch = 0;
var gw = 0;
var gh = 0;
var particles = [];
var historylimit = 300; //lol
var v1history = [];
var v2history = [];
var box1 = {
    x: 100,
    y:0,
    w:50,
    h:50,
    m:5,
    v:4,
    color:'#ff0055'
};
var box2 = {
    x:400,
    y:0,
    w:70,
    h:70, //7 is the best fr
    m:10,
    v: -2,
    color:'#00ccff'
}
//was i lying about that much variables lol

function boot(){
    resize();
    window.addEventListener('resize', resize);
    m1input.addEventListener('input', updateinputs);
    v1input.addEventListener('input', updateinputs);
    m2input.addEventListener('input', updateinputs);
    v2input.addEventListener('input', updateinputs);
    startbtn.addEventListener('click', toggleplay);
    resetbtn.addEventListener('click', resetall);
    resetall();
    loop(0);
}
function resize(){
    var container = simcanvas.parentElement;
    simcanvas.width = container.clientWidth;
    simcanvas.height = container.clientHeight;
    cw = simcanvas.width;
    ch = simcanvas.height;

    box1.y = ch / 2 - box1.h / 2;
    box2.y = ch / 2 - box2.h / 2;

    var graphcont = graphcanvas.parentElement;
    graphcanvas.width = graphcont.clientWidth;
    graphcanvas.height = graphcont.clientHeight;
    gw = graphcanvas.width;
    gh = graphcanvas.height;
}
function updateinputs(){
    if(active) return; 
    box1.m = parseFloat(m1input.value);
    box1.v = parseFloat(v1input.value);
    box2.m = parseFloat(m2input.value);
    box2.v = parseFloat(v2input.value);
    box1.w = box1.h = 40 + (box1.m * 2);
    box2.w = box2.h = 40 + (box2.m * 2);

    m1label.innerText = box1.m.toFixed(1);
    v1label.innerText = box1.v.toFixed(1);
    m2label.innerText = box2.m.toFixed(1);
    v2label.innerText = box2.v.toFixed(1);

    box1.y = ch / 2 - box1.h  / 2;
    box2.y = ch / 2 - box2.h/ 2;
    calcstats();
    drawscene();
}

function resetall(){
    active = false;
    startbtn.innerText = "Start Simulation";
    statusdisp.innerText = "Ready";
    box1.x = cw * 0.2;
    box2.x = cw * 0.8;
    updateinputs();
    v1history = [];
    v2history = [];
    particles = [];

    logger.innerHTML = "<div class=\"log-entry\">System Reset.</div>";
}

function toggleplay(){
    active = !active;
    if (active) {
        startbtn.innerText = "Pause?";
        statusdisp.innerText = "Running";

        m1input.disabled = true;
        v1input.disabled = true;
        m2input.disabled = true;
        v2input.disabled = true;
    } else{
        startbtn.innerText = "Resume";
        statusdisp.innerText = "Paused";

        m1input.disabled = false;
        m2input.disabled = false;
        v1input.disabled = false;
        v2input.disabled = false;
    }
}

function physics(){
    box1.x += box1.v;
    //boringgggggggggggggggggggg
    box2.x += box2.v;

    if (box1.x <= 0) {
        box1.v *= -1;
        box1.x = 0;

        spawnsparks(box1.x, box1.y + box1.h/2, '#fff');
        logmsg("Box A hit left wall.");
    }
    if (box1.x + box1.w >= cw) {
        box1.v *= -1;
        box1.x = cw - box1.w;
        
    }
    if (box2.x <= 0) {
        box2.v *= -1;
        box2.x = 0;
    }
    if (box2.x + box2.w >= cw) {
        box2.v *= -1;
        box2.x = cw - box2.w;
        spawnsparks(box2.x + box2.w, box2.y + box2.h/2, '#fff');
        logmsg("Box B hit right wall.");
    }
    if(checkcol(box1, box2)){
        solveelastic();
    }
}

function checkcol(a, b){
    return (a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y);
    
}
function solveelastic(){
    var v1 = box1.v;
    var v2 = box2.v;
    var m1 = box1.m;
    var m2 = box2.m;

    var v1final = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
    var v2final = ((m2-m1) * v2 + 2 * m1 * v1) / (m1 + m2);

    box1.v = v1final;
    box2.v = v2final; 
    var center1 = box1.x + box1.w/2;
    var center2 = box2.x + box2.w/2;
    if(box1.x < box2.x){
        box1.x -= 2;
        box2.x += 2;
        spawnsparks(box1.x, box1.y + box1.h/2, '#ffff00');
    } else {
        box1.x += 2;
        box2.x -= 2;
        spawnsparks(box1.x, box1.y + box1.h/2, '#ffff00');
    }

    logmsg (`Collision!!! New vels: A=${v1final.toFixed(2)}, B=${v2final.toFixed(2)}`);
}
// ah it is a drag to code all these stuffs ufff
function spawnsparks(x, y, color){
    for (var i = 0; i < 15; i++) {
        particles.push({
            x:x,
            y:y,
            vx: (Math.random()- 0.5) * 10,
            vy: (Math.random()- 0.5) * 10,
            life: 1.0,
            color: color
        });
    }
}

function updateparticles(){
    for (var i =particles.length-1; i>=0; i--) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}
function logmsg(txt){
    var div = document.createElement('div');
    div.className = 'log-entry';
    div.innerHTML = `<span style="color:#666;">[${simtime}]</span> ${txt}`;
    logger.insertBefore(div, logger.firstChild);
    if (logger.children.length>20) {
        logger.removeChild(logger.lastChild);
    }
}

function calcstats(){
    var p = (box1.m * box1.v) + (box2.m * box2.v);
    var k = (0.5 * box1.m * box1.v * box1.v) + (0.5 * box2.m * box2.v * box2.v);
    momdisp.innerText = p.toFixed(2);
    energydisp.innerText = k.toFixed(2);
    v1curr.innerText = box1.v.toFixed(2) + 'm/s';
    v2curr.innerText = box2.v.toFixed(2) + 'm/s';
}
//ahh so much codew
function recordgraph(){
    v1history.push(box1.v);
    v2history.push(box2.v);
    if(v1history.length > historylimit) v1history.shift();
    if(v2history.length > historylimit) v2history.shift();
//one line is short and sweet
}
function drawscene(){
    simctx.fillStyle = '#000';
    simctx.fillRect(0, 0, cw, ch);
    simctx.beginPath();
    //this is my 7th tool yay i love 7!!!!!!!!!!!!!!!!!!!!!!!
    simctx.strokeStyle = '#333';
    simctx.lineWidth = 2;
    simctx.moveTo(0, ch/2 + 100);
    simctx.lineTo(cw, ch/2 +100);
    simctx.stroke();

    for (var i = 0; i < cw; i+=50) {
        simctx.beginPath();
        simctx.moveTo(i, ch/2 + 100);
        simctx.lineTo(i, ch/2 + 110);
        simctx.stroke();
    }
    simctx.fillStyle = box1.color;
    simctx.shadowColor = '#fff';
    simctx.shadowBlur = 10;
    simctx.fillRect(box1.x, box1.y, box1.w, box1.h);
    simctx.shadowBlur = 0;
    simctx.fillStyle = '#fff';
    simctx.font = 'bold 14px Arial';
    simctx.textAlign = 'center';
    simctx.fillText("A", box1.x + box1.w/2, box1.y + box1.h/2 + 5);
    simctx.fillStyle = box2.color;
    simctx.shadowColor = box2.color;
    simctx.shadowBlur = 10;
    simctx.fillRect(box2.x, box2.y, box2.w, box2.h);
    simctx.shadowBlur = 0;
    simctx.fillStyle = '#fff';
    simctx.fillText("B", box2.x + box2.w/2, box2.y + box2.h/2 + 5);
    drawarrow(box1.x + box1.w/2, box1.y - 20, box1.v * 10, box1.color);
    drawarrow(box2.x + box2.w/2, box2.y - 20, box2.v * 10, box2.color);

    for (var p of particles) {
        simctx.globalAlpha = p.life;
        simctx.fillStyle = p.color;
        simctx.fillRect(p.x, p.y, 3, 3);
    }
    simctx.globalAlpha = 1.0;
}
//lumbini lions won the npl s2 yayayayayayayayayayaya
function drawarrow(x, y, len, color){
    if(Math.abs(len)<1) return;
    simctx.beginPath();
    simctx.strokeStyle = color;
    simctx.lineWidth = 3;
    simctx.moveTo(x, y);
    simctx.lineTo(x + len, y);
    simctx.stroke();//simctx and variable same same but different lol

    simctx.beginPath();
    simctx.fillStyle = color;
    var head = 5;
    if (len > 0) {
        simctx.moveTo(x + len, y);
        simctx.lineTo(x + len - head, y - head);
        simctx.lineTo(x + len - head, y + head);
    } else {
        simctx.moveTo(x + len, y);
        simctx.lineTo(x + len + head, y - head);
        simctx.lineTo(x + len + head, y + head);
    }
    simctx.fill();
}
function drawgraph(){
    graphctx.clearRect(0, 0, gw, gh);
    graphctx.strokeStyle = '#222';
    graphctx.lineWidth = 1;
    graphctx.beginPath();
    graphctx.moveTo(0, gh/2);
    graphctx.lineTo(gw, gh/2);
    graphctx.stroke();

    if(v1history.length < 2) return;
    graphctx.beginPath();
    graphctx.strokeStyle = box1.color;
    var step = gw / historylimit;
    for(var i=0; i<v1history.length; i++){
        var val = v1history[i];
        var y = (gh/2) - (val * 5);
        if(i==0) graphctx.moveTo(0, y);
        else graphctx.lineTo(i*step, y);
    }
    graphctx.stroke();
    graphctx.beginPath();
    graphctx.strokeStyle = box2.color;
    for (var i = 0; i < v2history.length; i++) {
        var val = v2history[i];
        var y = (gh/2) - (val * 5);
        if (i==0) graphctx.moveTo(0, y);
        else graphctx.lineTo(i*step, y);
    }
    graphctx.stroke();
}
//main loop finallyyyyyyy
function loop(timestamp){
    if (active) {
        physics();
        updateparticles();
        calcstats();
        recordgraph();
        simtime++;
    }
    drawscene();
    drawgraph();
    requestAnimationFrame(loop);
}
boot();
