// this is a big project and has a so much js that i am gonna cry 
//lets see 100 const
const APP = {
    mode:'norm',//small = simpler yaya
    w:0,
    h:0,
    dataPoints:[],
    params:{
        mu:0,
        sigma:1,
        n:20,
        p:0.5,
        rate:1,
        lambda:5,
        min:0, max:10
    },
    view:{
        range:100
    }
};

const cvs = document.getElementById('mainCanvas');
const ctx = cvs.getContext('2d');
const controlsarea = document.getElementById('controls-area');
const tt = document.getElementById('tooltip');

const MathLib = {
    fact: (n) => {
        if(n<0) return 1;
        let r=1;
        for(let i=2;i<=n; i++) r *= i; //one line is simple 
        return r;
    },
    nCr:(n, r) =>{
        if(r<0 || r>n) return 0;
        if(r==0 || r==n) return 1;
        if(r> n/2) r = n-r;
        let res = 1;
        for(let i=1; i<=r;i++) res = res*(n-i+1)/i;
        return res;;
    },
    erf: (x)=>{
        const a1 =  0.254829592;
            const a2 = -0.284496736;
            const a3 =  1.421413741;
            const a4 = -1.453152027;
            const a5 =  1.061405429;
            const p  =  0.3275911;
            const sign = (x<0) ? -1:1;
            x= Math.abs(x);
            const t= 1.0/(1.0+ p*x);
            const y = 1.0 - (((((a5*t + a4)*t)+a3)*t +a2)*t + a1)*t * Math.exp(-x*x);
            return sign* y;
    }
};
const DistLogic ={
    norm: {
        pdf: (x) => (1/(APP.params.sigma* Math.sqrt(2*Math.PI))) * Math.exp(-0.5*Math.pow((x-APP.params.mu)/APP.params.sigma,2)),
        //these are so hard to write as well as understand
        cdf: (x)=> 0.5*(1+ MathLib.erf((x-APP.params.mu)/(APP.params.sigma* Math.sqrt(2)))),
        mean: ()=> APP.params.mu,
        var:()=> APP.params.sigma * APP.params.sigma,
        eq: "f(x) = (1/σ√2π) e^(-(x-μ)²/2σ²)",
        discrete: false
    },
    binom:{
        //wc is coming nearer yay
       pmf: (k) => {
                k = Math.round(k);
                if(k<0 || k>APP.params.n) return 0;
                return MathLib.nCr(APP.params.n, k) * Math.pow(APP.params.p, k) * Math.pow(1-APP.params.p, APP.params.n-k);
            },
            cdf: (k) => {
                let s = 0;
                for(let i=0; i<=k; i++) s += DistLogic.binom.pmf(i);
                return s;
            },
            mean: () => APP.params.n * APP.params.p,
            var: () => APP.params.n * APP.params.p * (1-APP.params.p),
            eq: "P(k) = (nCk) p^k (1-p)^(n-k)",
            discrete:true
    },
    poiss:{
        pmf:(k)=>{
            k = Math.round(k);
            if(k<0) return 0;
            return (Math.pow(APP.params.lambda, k)* Math.exp(-APP.params.lambda)) / MathLib.fact(k);
        },
        cdf: (k)=>{
            let s= 0;
            for(let i = 0;i<=Math.floor(k);i++){
                s+= DistLogic.poiss.pmf(i);
            }
            return s;
        },
        mean: ()=> APP.params.lambda,
        var: ()=> APP.params.lambda,
        eq:"P(k) = (λ^k e^-λ) / k!",
        discrete:true
    },
    exp:{
        pdf: (x) => (x < 0) ? 0 : APP.params.rate * Math.exp(-APP.params.rate * x),
            cdf: (x) => (x < 0) ? 0 : 1 - Math.exp(-APP.params.rate * x),
            mean: () => 1 / APP.params.rate,
            var: () => 1 / (APP.params.rate * APP.params.rate),
            eq: "f(x) = λe^(-λx)",
            discrete: false
        
    },
    geo: {
        pmf: (k) =>{
            k = Math.round(k);
            if(k<1) return 0;
            return Math.pow(1-APP.params.p, k-1)* APP.params.p;
        },
        cdf: (k)=>{
            if(k<1) return 0;
            return 1-Math.pow(1-APP.params.p,k);
        },
        mean:()=> 1/APP.params.p,
        var:() => (1-APP.params.p)/(APP.params.p*APP.params.p),
        eq: "P(k) = (1-p)^(k-1) p",
        discrete:true
    },
    uni:{
        pdf:(x)=> {
            if(x>=APP.params.min && x<= APP.params.max) return 1/(APP.params.max - APP.params.min);
            return 0;
        },
        //man these lgics are so much hard
        cdf: (x) => {
            if(x<APP.params.min) return 0;
            if(x>APP.params.max) return 1;
            return(x-APP.params.min) / (APP.params.max - APP.params.min);
        },
        mean:()=> (APP.params.min + APP.params.max)/2,
        var:()=> Math.pow(APP.params.max - APP.params.min, 2) /12,
        eq: "f(x) = 1/(b-a)",
        discrete: false
 }
};
//finally that scary function is over
function init(){
    resize();
    window.addEventListener('resize', resize);
    const rng = document.getElementById('sl_range');
    rng.oninput = function(){
        APP.view.range = parseInt(this.value);
        draw();
    };
    cvs.addEventListener('mousemove', handleHover);
    cvs.addEventListener('mouseleave', ()=>{
        tt.style.opacity= 0;
    });
    buildControls();
    draw();
}

function setDist(mode, el){
    APP.mode = mode;
    document.querySelectorAll('.dist-card').forEach(c=>c.classList.remove('active'));
    el.classList.add('active');
    buildControls();
    draw();
}
function buildControls(){
    const mode = APP.mode;
    controlsarea.innerHTML = '';
    //here comes the scary part ....
    const configs = {
       norm: [
                { id: 'mu', label: 'Mean (μ)', min: -50, max: 50, step: 0.5, val: 0 },
                { id: 'sigma', label: 'Std Dev (σ)', min: 0.1, max: 20, step: 0.1, val: 5 }
            ],
            binom: [
                { id: 'n', label: 'Trials (n)', min: 1, max: 100, step: 1, val: 20 },
                { id: 'p', label: 'Prob (p)', min: 0.01, max: 1, step: 0.01, val: 0.5 }
            ],
            poiss: [
                { id: 'lambda', label: 'Rate (λ)', min: 0.1, max: 50, step: 0.5, val: 10 }
            ],
            exp: [
                 { id: 'rate', label: 'Rate (λ)', min: 0.1, max: 5, step: 0.1, val: 1 }
            ],
            geo: [
                 { id: 'p', label: 'Prob (p)', min: 0.01, max: 1, step: 0.01, val: 0.5 }
            ],
            uni: [
                { id: 'min', label: 'Min (a)', min: -50, max: 49, step: 1, val: -10 },
                { id: 'max', label: 'Max (b)', min: -49, max: 50, step: 1, val: 10 }
            ]
    };

    //scary part is gone
    configs[mode].forEach(c=>{
        APP.params[c.id] = c.val;
        const div = document.createElement('div');
        div.className = 'slider-group';
        div.innerHTML = `
        <div class="slider-header">
            <span>${c.label}</span>
                    <span class="slider-val" id="val-${c.id}">${c.val}</span>
            </div>
           <input type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.val}"oninput="updateParam('${c.id}', this.value)">
        `;
        controlsarea.appendChild(div);
    });
}
window.updateParam = (key, val) =>{
    APP.params[key] = parseFloat(val);
    document.getElementById(`val-${key}`).innerText = APP.params[key];

    if (APP.mode === 'uni') {
        if (APP.params.min >= APP.params.max) {
            if (key === 'min') {
                 APP.params.max = APP.params.min+1;
            } else APP.params.min = APP.params.max-1;
        }
    }
    draw();
};

function resize(){
    const box = cvs.parentElement;
    APP.w = box.clientWidth;
    APP.h = box.clientHeight;
    cvs.width = APP.w * window.devicePixelRatio;
    cvs.height = APP.h * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    draw();
}
//here comes the verrrrrryyyyyy lnggggg function
function draw(){
    ctx.clearRect(0,0,APP.w, APP.h);
    drawGrid();
    const mod = DistLogic[APP.mode];
    const mean = mod.mean();
    const variance = mod.var();
    const sd = Math.sqrt(variance);
    document.getElementById('stat-mean').innerText = mean.toFixed(4);
    document.getElementById('stat-var').innerText = variance.toFixed(4);
    document.getElementById('stat-sd').innerText = sd.toFixed(4);
    document.getElementById('formula-box').innerText = mod.eq;

    APP.dataPoints = [];
    const discrete = mod.discrete;
    let xMin = -APP.view.range / 2;
    let xMax = APP.view.range / 2;
    if(APP.mode ==='exp' || APP.mode ==='geo'|| APP.mode ==='binom'|| APP.mode ==='poiss'){
        xMin = -10;
        xMax = APP.view.range - 10;
    }
   const padding = 60;
   const chartW = APP.w - padding*2;
   const chartH = APP.h - padding *2;
   let peakY = 0;
   if(discrete){
    peakY = mod.pmf(Math.floor(mean));
   } else{
    peakY = (APP.mode ==='uni') ? mod.pdf(mean): mod.pdf(mean);
   }
   if(!peakY || peakY < 0.01) peakY = 0.5;
   const maxY = peakY * 1.2;
   ctx.strokeStyle = '#3b82f6';
   ctx.lineWidth = 2;
   ctx.fillStyle = 'rgba(59, 130, 246, 0.2';

   if(!discrete){
    ctx.beginPath();
    let started = false;
    const steps = APP.w;
    for(let i=0; i<=steps; i++){
        const px = i;
        const wx = xMin + (px-padding) / chartW * (xMax - xMin);
        const wy = mod.pdf(wx);
        const py = (APP.h - padding) - (wy/maxY) * chartH;
        if(i==0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
        if(i%5===0) APP.dataPoints.push({x:wx, y:wy});
    }
    ctx.stroke();
    ctx.lineTo(APP.w, APP.h - padding);
    ctx.lineTo(0,APP.h - padding);
    ctx.closePath();
    ctx.fill();
   }else{
    const barW = (chartW / (xMax - xMin)) * 0.6;
    for(let k = Math.ceil(xMin); k<= Math.floor(xMax);k++){
        const val = mod.pmf(k);
        if(val>0.0001){
            const px = padding+ ((k - xMin)/(xMax - xMin)) * chartW;
            const hBar = (val/maxY) * chartH;
            const py = (APP.h - padding) - hBar;
            ctx.fillStyle = '#3b82f6';
            drawRoundedRect(px - barW/2, py, barW, hBar, 2);
            APP.dataPoints.push({x:k, y:val});
        }
    }
   }
   drawAxes(padding, xMin, xMax);
   updateTableIfNeeded(mod);
}
//finally this function is also over
function drawGrid(){
    ctx.strokeStyle = '#222';
    ctx.lineWidth= 1;
    
    for(let x=0; x<APP.w; x+=50){
        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x, APP.h);
        ctx.stroke();
    }
    for(let y=0; y<APP.h; y+=50){
        ctx.beginPath();
        ctx.moveTo(0,y);
        ctx.lineTo(APP.w, y);
        ctx.stroke();
    }
}

function drawAxes(pad, min, max){
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.font = "10px monospace";
    ctx.fillStyle = '#888';
    ctx.textAlign = "center";
    const yZero = APP.h - pad;
    ctx.beginPath();
    ctx.moveTo(pad, yZero);
    ctx.lineTo(APP.w -pad, yZero);
    ctx.stroke();
    const range = max - min;
    const steps = 10;
    const inc = range / steps;

    for(let i=0; i<=steps; i++){
        const val = min + i*inc;
        const px = pad + (i/steps)*(APP.w-pad*2);

        ctx.beginPath();
        ctx.moveTo(px, yZero);
        ctx.lineTo(px, yZero+5);
        ctx.stroke();
        ctx.fillText(Math.round(val), px, yZero +15);
    }
}
function drawRoundedRect(x,y,w,h,r){
    if(h < 0) h = 0;
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.lineTo(x+w-r, y);
        ctx.quadraticCurveTo(x+w, y, x+w, y+r);
        ctx.lineTo(x+w, y+h);
        ctx.lineTo(x, y+h);
        ctx.lineTo(x, y+r);
        ctx.quadraticCurveTo(x, y, x+r, y);
        ctx.fill();
}
//another function
function handleHover(e){
    const r = cvs.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    let closest = null;
    let minDist = 100;
    const pad = 60;
    let xMin = -APP.view.range / 2;
    let xMax = APP.view.range/2;
    if(APP.mode ==='exp'|| APP.mode ==='geo'|| APP.mode==='binom'||APP.mode==='poiss'){
        xMin = -10;
        xMax = APP.view.range -10;
    }
    const chartW = APP.w - pad*2;
    const mwx = xMin + (mx - pad)/chartW *(xMax - xMin);
    const mod = DistLogic[APP.mode];
    let valY = 0;
    if(mod.discrete){
        valY = mod.pmf(Math.round(mwx));
        document.getElementById('tt-x').innerText = Math.round(mwx);
    } else{
        valY = mod.pdf(mwx);
        document.getElementById('tt-x').innerText = mwx.toFixed(4);
    }
    document.getElementById('tt-y').innerText = valY.toFixed(4);
    tt.style.left = (e.clientX + 15) + 'px';
    tt.style.top = (e.clientY + 15) + 'px';
    tt.style.opacity = 1;
    draw();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.setLineDash([5,5]);
    ctx.beginPath();
    ctx.moveTo(mx, 0);
    ctx.lineTo(mx, APP.h);
    ctx.stroke();
    ctx.setLineDash([]);
}

//js is tough
function switchTab(t,el){
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    el.classList.add('active');
    if (t==='graph') {
        document.getElementById('view-graph').style.display = 'block';
        document.getElementById('view-data').classList.remove('show');
    } else{
        document.getElementById('view-graph').style.display = 'none';
        document.getElementById('view-data').classList.add('show');
    }
}
function updateTableIfNeeded(mod){
    const tbody = document.querySelector('#dataTable tbody');
    if (!document.getElementById('view-data').classList.contains('show')) {
        return;
    }
    tbody.innerHTML = '';
    let pts = APP.dataPoints;
    if (pts.length>200) {
        pts = pts.filter((_,i)=> i%Math.floor(pts.length/200)===0);
    }
    pts.forEach(p=>{
        const tr = document.createElement('tr');
        const cdf = mod.cdf(p.x);
        tr.innerHTML = `<td>${p.x.toFixed(2)}</td><td>${p.y.toFixed(5)}</td><td>${cdf.toFixed(5)}</td>`;
        tbody.appendChild(tr);
    });
}
function calculateProb(){
    const k = parseFloat(document.getElementById('calc-k').value);
    if(isNaN(k)) return;
    const mod = DistLogic[APP.mode];
    const p = mod.cdf(k);
    const out = document.getElementById('calc-output');
    out.innerHTML = `P(X ≤ ${k}) = <span style="color:white">${p.toFixed(5)}</span>`;
}
//why is code messy
function  showToast(msg){
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add ('show');
    setTimeout(()=>{
        t.classList.remove('show');
    }, 3000);
}
window.exportdata = () =>{
    let csv = "X, Probability_P(x)\n";
    APP.dataPoints.forEach(p=>{
        csv += `${p.x}, ${p.y}\n`;
    });
    const blob = new Blob([csv], {type:'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statflow_${APP.mode}_data.csv`;
    a.click();
    showToast("CSV Downloaded :d enjoy")  
};
window.exportimage = () => {
    const link = document.createElement('a');
    link.download = `statflow_graph.png`;
    link.href = cvs.toDataURL();
    link.click();
    showToast("Image saved enjoyy");
};
init();
