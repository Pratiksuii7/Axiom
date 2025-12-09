//so muchhhhhhhh js meet you after 2 days
//lets declare 1000 variables
    var canvas = document.getElementById('sim');
    var ctx = canvas.getContext('2d');
    
    var gtime = document.getElementById('g_time');
    var ctxtime = gtime.getContext('2d');
    
    var gphase = document.getElementById('g_phase');
    var ctxphase = gphase.getContext('2d');

    var width, height;
    var dragging = false;
    var paused = false;
    var lasttime = 0;
    
    var origin = { x: 0, y: 0 };
    var bob = { x: 0, y: 0 };
    
    var l = 200;
    var theta = Math.PI / 4;
    var omega = 0;
    var alpha = 0;
    var mass = 10;
    var g = 9.8;
    var mu = 0.005;
    
    var trail = [];
    var maxtrail = 100;

    var timedata = [];
    var maxtimepoints = 150;
    //lol didnt took so long

    var ui = {
        len: document.getElementById('in_len'),
        grav: document.getElementById('in_grav'),
        mass: document.getElementById('in_mass'),
        damp: document.getElementById('in_damp'),
        dlen: document.getElementById('disp_len'),
        dgrav: document.getElementById('disp_grav'),
        dmass: document.getElementById('disp_mass'),
        ddamp: document.getElementById('disp_damp'),
        speriod: document.getElementById('st_period'),
        sfreq: document.getElementById('st_freq'),
        senergy: document.getElementById('st_energy'),
        bke: document.getElementById('bar_ke'),
        bpe: document.getElementById('bar_pe'),
        ctrail: document.getElementById('chk_trail'),
        cphase: document.getElementById('chk_phase'),
        btnreset: document.getElementById('btn_reset'),
        btnpause: document.getElementById('btn_pause'),
        fps: document.getElementById('fpscounter') //cool right?
    };

    function init() {
        resize();
        window.addEventListener('resize', resize);
        
        ui.len.addEventListener('input', updateparams);
        ui.grav.addEventListener('input', updateparams);
        ui.mass.addEventListener('input', updateparams);
        ui.damp.addEventListener('input', updateparams);
        
        ui.btnreset.addEventListener('click', resetsim);
        ui.btnpause.addEventListener('click', togglepause);
        
        canvas.addEventListener('mousedown', ondown);
        window.addEventListener('mousemove', onmove);
        window.addEventListener('mouseup', onup);
        
        canvas.addEventListener('touchstart', (e) => ondown(e.touches[0]));
        window.addEventListener('touchmove', (e) => onmove(e.touches[0]));
        canvas.addEventListener('touchend', onup);

        updateparams();
        resetsim();
        loop(0);
    }

    function resize() {
        width = document.getElementById('workspace').offsetWidth;
        height = document.getElementById('workspace').offsetHeight;
        
        canvas.width = width;
        canvas.height = height;
        
        origin.x = width / 2;
        origin.y = height / 4;

        gtime.width = gtime.offsetWidth;
        gtime.height = gtime.offsetHeight;
        gphase.width = gphase.offsetWidth;
        gphase.height = gphase.offsetHeight;
    }

    function updateparams() {
        l = parseFloat(ui.len.value);
        g = parseFloat(ui.grav.value);
        mass = parseFloat(ui.mass.value);
        mu = parseFloat(ui.damp.value);

        ui.dlen.innerText = l + 'px';
        ui.dgrav.innerText = g.toFixed(1);
        ui.dmass.innerText = mass + 'kg';
        ui.ddamp.innerText = mu.toFixed(3);

        var reall = l / 100;
        var t = 2 * Math.PI * Math.sqrt(reall / g);
        var f = 1 / t;

        ui.speriod.innerText = t.toFixed(2) + 's';
        ui.sfreq.innerText = f.toFixed(2) + 'Hz';
    }

    function resetsim() {
        theta = Math.PI / 4;
        omega = 0;
        alpha = 0;
        trail = [];
        timedata = [];
    }

    function togglepause() {
        paused = !paused;
        ui.btnpause.innerText = paused ? "Resume" : "Pause";
        if (!paused) loop(0);
    }

    function updatephysics() {
        if (dragging) return;

        var gscale = g * 10; 
        
        alpha = (-1 * gscale / l) * Math.sin(theta) - (mu * omega);
        
        omega += alpha;
        theta += omega;

    }

    function updateenergy() {
        
        var v = l * omega;
        var scalefactor = 0.001; 
        
        var ke = 0.5 * mass * (v * v) * scalefactor;
        var h = l * (1 - Math.cos(theta));
        var gscale = g * 10;
        var pe = mass * gscale * h * scalefactor;
        
        var total = ke + pe;

        ui.senergy.innerText = total.toFixed(2) + " J";
        
        var maxe = 5000 * scalefactor;
        if (total > maxe) maxe = total;
        if (maxe === 0) maxe = 1;

        var wke = (ke / total) * 100;
        var wpe = (pe / total) * 100;
        
        ui.bke.style.width = wke + "%";
        ui.bpe.style.width = wpe + "%";
    }

    function ondown(e) {
        var rect = canvas.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        
        var bx = origin.x + l * Math.sin(theta);
        var by = origin.y + l * Math.cos(theta);

        var dist = Math.sqrt((mx - bx)**2 + (my - by)**2);
        
        if (dist < 40) {
            dragging = true;
            paused = true;
        }
    }

    //ready for wc 2026

    function onmove(e) {
        if (!dragging) return;
        
        var rect = canvas.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        
        var dx = mx - origin.x;
        var dy = my - origin.y;
        
        theta = Math.atan2(dx, dy);
        
        omega = 0;
        alpha = 0;
        
        trail = [];
        
        draw();
    }

    function onup() {
        if (dragging) {
            dragging = false;
            if(ui.btnpause.innerText === "Pause") paused = false;
        }
    }

    function draw() {
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg');
        ctx.clearRect(0,0,width,height);
        
        drawgrid();

        bob.x = origin.x + l * Math.sin(theta);
        bob.y = origin.y + l * Math.cos(theta);

        if (ui.ctrail.checked) {
            drawtrail();
        }

        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(bob.x, bob.y);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#444';
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#666';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(bob.x, bob.y, 20, 0, Math.PI * 2);
        var grd = ctx.createRadialGradient(bob.x - 5, bob.y - 5, 2, bob.x, bob.y, 20);
        grd.addColorStop(0, '#fff');
        grd.addColorStop(0.3, '#00f2ff');
        grd.addColorStop(1, '#0077aa');
        ctx.fillStyle = grd;
        ctx.fill();
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(0, 242, 255, 0.6)';
        ctx.stroke();
        ctx.shadowBlur = 0;

        updategraphs();
    }

    function drawgrid() {
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        
        for(var x=0; x<width; x+=50) {
            ctx.beginPath();
            ctx.moveTo(x,0);
            ctx.lineTo(x,height);
            ctx.stroke();
        }
        for(var y=0; y<height; y+=50) {
            ctx.beginPath();
            ctx.moveTo(0,y);
            ctx.lineTo(width,y);
            ctx.stroke();
        }
    }

    function drawtrail() {
        if (trail.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        
        for (var i = 1; i < trail.length; i++) {
            var xc = (trail[i].x + trail[i-1].x) / 2;
            var yc = (trail[i].y + trail[i-1].y) / 2;
            ctx.quadraticCurveTo(trail[i-1].x, trail[i-1].y, xc, yc);
        }
        ctx.lineTo(trail[trail.length-1].x, trail[trail.length-1].y);
        
        ctx.lineCap = 'round';
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 0, 85, 0.5)';
        ctx.stroke();
    }

    function updategraphs() {
        if (!paused && !dragging) {
            timedata.push({ t: theta, v: omega });
            if (timedata.length > maxtimepoints) timedata.shift();
        }

        var w = gtime.width;
        var h = gtime.height;
        ctxtime.clearRect(0,0,w,h);
        
        ctxtime.strokeStyle = '#333';
        ctxtime.beginPath();
        ctxtime.moveTo(0, h/2);
        ctxtime.lineTo(w, h/2);
        ctxtime.stroke();

        ctxtime.beginPath();
        ctxtime.strokeStyle = '#00f2ff';
        ctxtime.lineWidth = 2;
        
        var step = w / maxtimepoints;
        for(var i=0; i<timedata.length; i++) {
            var y = (h/2) + (timedata[i].t * 30); 
            var x = i * step;
            if(i===0) ctxtime.moveTo(x,y);
            else ctxtime.lineTo(x,y);
        }
        ctxtime.stroke();

        if (ui.cphase.checked) {
            document.getElementById('box_phase').style.display = 'block';
            var pw = gphase.width;
            var ph = gphase.height;
            var cx = pw / 2;
            var cy = ph / 2;
            
            ctxphase.fillStyle = 'rgba(0,0,0,0.1)';
            ctxphase.fillRect(0,0,pw,ph);
            
            ctxphase.strokeStyle = '#222';
            ctxphase.beginPath();
            ctxphase.moveTo(cx, 0); ctxphase.lineTo(cx, ph);
            ctxphase.moveTo(0, cy); ctxphase.lineTo(pw, cy);
            ctxphase.stroke();

            var px = cx + (theta * 40);
            var py = cy - (omega * 400);
            
            ctxphase.fillStyle = '#ff0055';
            ctxphase.beginPath();
            ctxphase.arc(px, py, 2, 0, Math.PI*2);
            ctxphase.fill();
        } else {
            document.getElementById('box_phase').style.display = 'none';
        }
    }

    //endgame starts

    function loop(timestamp) {
        if (!lasttime) lasttime = timestamp;
        var dt = timestamp - lasttime;
        lasttime = timestamp;

        if (dt > 0) {
            var fps = 1000 / dt;
            if(Math.random() > 0.9) ui.fps.innerText = Math.round(fps) + " FPS";
        }

        if (!paused) {
            updatephysics();
            
            trail.push({ x: bob.x, y: bob.y });
            if (trail.length > maxtrail) trail.shift();
            
            updateenergy();
        }

        draw();

        if (!paused || dragging) {
            requestAnimationFrame(loop);
        }
    }

    init();
    //uffffffffff