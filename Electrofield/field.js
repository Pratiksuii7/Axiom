// lets see 1m vars now
    var fieldcvs = document.getElementById('fieldcanvas');
    var fieldctx = fieldcvs.getContext('2d');
    var objcvs = document.getElementById('objcanvas');
    var objctx = objcvs.getContext('2d');
    var width = window.innerWidth;
    var height = window.innerHeight;
    var charges = [];
    var particles = [];
    var k = 8990; 
    var particlecount = 1500;
    var flowspeed = 1.0;
    var nextchargeval = 5;
    var showfield = true;
    var showgrid = false;
    var mousedown = false;
    var draggedidx = -1;
    var mousex = 0;
    var mousey = 0;
    var eldens = document.getElementById('densinput');
    var elspeed = document.getElementById('speedinput');
    var elmag = document.getElementById('maginput');
    var elpart = document.getElementById('partcount');
    var elcharges = document.getElementById('chargecount');
    var elenergy = document.getElementById('sysenergy');
    var elreadout = document.getElementById('coursorreadout');
    var btnpos = document.getElementById('addpos');
    var btnneg = document.getElementById('addneg');
    var btnclear = document.getElementById('clearall');
    var chkfield = document.getElementById('chkfield');
    var chkgrid = document.getElementById('chkgrid');
    //1m vars finish

    function init() {
        resize();
        window.addEventListener('resize', resize);
        
        charges.push({x: width/2 - 100, y: height/2, q: 5, r: 20});
        charges.push({x: width/2 + 100, y: height/2, q: -5, r: 20});
        
        spawnparticles(true);
        
        objcvs.addEventListener('mousedown', ondown);
        window.addEventListener('mousemove', onmove);
        window.addEventListener('mouseup', onup);
        
        btnpos.onclick = function() { addcharge(nextchargeval); };
        btnneg.onclick = function() { addcharge(-nextchargeval); };
        btnclear.onclick = function() { charges = []; resetparticles(); };
        
        eldens.oninput = function() { 
            particlecount = parseInt(this.value); 
            document.getElementById('densval').innerText = (particlecount > 2000) ? "Ultra" : "Normal";
            resetparticles();
        };
        
        elspeed.oninput = function() {
            flowspeed = parseFloat(this.value);
            document.getElementById('speedval').innerText = flowspeed.toFixed(1) + "x";
        };

        elmag.oninput = function() {
            nextchargeval = parseInt(this.value);
            document.getElementById('magval').innerText = nextchargeval + "uC";
        };

        chkfield.onclick = function() {
            showfield = !showfield;
            this.className = showfield ? "chk-row checked" : "chk-row";
        };

        chkgrid.onclick = function() {
            showgrid = !showgrid;
            this.className = showgrid ? "chk-row checked" : "chk-row";
        };

        loop();
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        fieldcvs.width = width;
        fieldcvs.height = height;
        objcvs.width = width;
        objcvs.height = height;
        resetparticles();
    }

    function addcharge(val) {
        var rx = (width/2) + (Math.random() - 0.5) * 100;
        var ry = (height/2) + (Math.random() - 0.5) * 100;
        charges.push({x: rx, y: ry, q: val, r: 15 + Math.abs(val)});
    }

    function resetparticles() {
        particles = [];
        spawnparticles(true);
    }

    function spawnparticles(full) {
        var needed = particlecount - particles.length;
        if (needed <= 0) return;

        for(var i=0; i<needed; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: 0,
                vy: 0,
                life: Math.random() * 100
            });
        }
    }

    function getfield(x, y) {
        var ex = 0;
        var ey = 0;
        var v = 0; 

        for(var i=0; i<charges.length; i++) {
            var c = charges[i];
            var dx = x - c.x;
            var dy = y - c.y;
            var rsq = dx*dx + dy*dy;
            var r = Math.sqrt(rsq);
            
            if(r < c.r) r = c.r; 
            
            var e = k * c.q / (r * r);
            
            ex += e * (dx / r);
            ey += e * (dy / r);

            v += k * c.q / r;
        }

        return { x: ex, y: ey, v: v };
    }
    //almost half done
    function updatephysics() {
        for(var i=0; i<particles.length; i++) {
            var p = particles[i];
            
            var f = getfield(p.x, p.y);
            
            var mag = Math.sqrt(f.x*f.x + f.y*f.y);
            if (mag > 0) {
                p.vx = (f.x / mag) * 5 * flowspeed;
                p.vy = (f.y / mag) * 5 * flowspeed;
            }

            p.x += p.vx;
            p.y += p.vy;
            p.life--;

            var dead = false;
            if (p.life <= 0) dead = true;
            if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) dead = true;
            
            for(var j=0; j<charges.length; j++) {
                var c = charges[j];
                var dx = p.x - c.x;
                var dy = p.y - c.y;
                if (dx*dx + dy*dy < c.r*c.r) dead = true;
            }

            if (dead) {
                if (Math.random() > 0.5) {
                    p.x = Math.random() * width;
                    p.y = Math.random() * height;
                } else {
                    var poscharges = charges.filter(z => z.q > 0);
                    if (poscharges.length > 0) {
                        var src = poscharges[Math.floor(Math.random() * poscharges.length)];
                        var angle = Math.random() * Math.PI * 2;
                        p.x = src.x + Math.cos(angle) * (src.r + 2);
                        p.y = src.y + Math.sin(angle) * (src.r + 2);
                    } else {
                        p.x = Math.random() * width;
                        p.y = Math.random() * height;
                    }
                }
                p.life = 100 + Math.random() * 50;
            }
        }
    }

    function calcstats() {
        var u = 0;
        for(var i=0; i<charges.length; i++) {
            for(var j=i+1; j<charges.length; j++) {
                var c1 = charges[i];
                var c2 = charges[j];
                var dx = c1.x - c2.x;
                var dy = c1.y - c2.y;
                var dist = Math.sqrt(dx*dx + dy*dy);
                u += (k * c1.q * c2.q) / dist;
            }
        }
        
        elenergy.innerText = (u / 1000).toFixed(2) + " J";
        elcharges.innerText = charges.length;
        elpart.innerText = particles.length;

        var mfield = getfield(mousex, mousey);
        var emag = Math.sqrt(mfield.x*mfield.x + mfield.y*mfield.y);
        elreadout.innerHTML = `SENSOR [${parseInt(mousex)},${parseInt(mousey)}]<br>` + 
                              `E: <span style="color:#fff">${emag.toFixed(1)}</span> N/C<br>` + 
                              `V: <span style="color:#fff">${mfield.v.toFixed(1)}</span> V`;
    }

    function ondown(e) {
        mousedown = true;
        var rect = objcvs.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;

        for(var i=charges.length-1; i>=0; i--) {
            var c = charges[i];
            var dx = mx - c.x;
            var dy = my - c.y;
            if (dx*dx + dy*dy < (c.r + 10)**2) {
                draggedidx = i;
                return;
            }
        }
    }

    function onmove(e) {
        var rect = objcvs.getBoundingClientRect();
        mousex = e.clientX - rect.left;
        mousey = e.clientY - rect.top;

        if (mousedown && draggedidx !== -1) {
            charges[draggedidx].x = mousex;
            charges[draggedidx].y = mousey;
        }
    }

    function onup() {
        mousedown = false;
        draggedidx = -1;
    }

    function drawall() {
        fieldctx.fillStyle = 'rgba(5, 5, 5, 0.15)'; 
        fieldctx.fillRect(0, 0, width, height);

        if (showfield) {
            fieldctx.fillStyle = '#ffffff';
            for(var i=0; i<particles.length; i++) {
                var p = particles[i];
                var alpha = p.life / 150;
                if (alpha > 0.8) alpha = 0.8;
                
                fieldctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                fieldctx.fillRect(p.x, p.y, 1.5, 1.5);
            }
        }

        if (showgrid) {
            drawgrid();
        }

        objctx.clearRect(0, 0, width, height);
        
        for(var i=0; i<charges.length; i++) {
            var c = charges[i];
            var color = c.q > 0 ? '#ff2e63' : '#08d9d6';
            
            objctx.shadowBlur = 30;
            objctx.shadowColor = color;
            
            objctx.beginPath();
            objctx.fillStyle = color;
            objctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            objctx.fill();

            objctx.shadowBlur = 0;
            objctx.fillStyle = '#fff';
            objctx.beginPath();
            objctx.arc(c.x, c.y, c.r * 0.3, 0, Math.PI * 2);
            objctx.fill();
            
            objctx.fillStyle = '#fff';
            objctx.font = "bold 12px Arial";
            objctx.textAlign = "center";
            objctx.textBaseline = "middle";

            if (i === draggedidx) {
                objctx.strokeStyle = '#fff';
                objctx.lineWidth = 2;
                objctx.beginPath();
                objctx.arc(c.x, c.y, c.r + 5, 0, Math.PI * 2);
                objctx.stroke();
            }
        }

        drawcursor();
    }
    //endgame begin
    function drawgrid() {
        fieldctx.fillStyle = '#222';
        for(var x=0; x<width; x+=40) {
            for(var y=0; y<height; y+=40) {
                fieldctx.fillRect(x, y, 1, 1);
                
                var f = getfield(x, y);
                var mag = Math.sqrt(f.x*f.x + f.y*f.y);
                if (mag > 0.1) {
                    var len = Math.min(20, mag * 2);
                    var nx = f.x / mag;
                    var ny = f.y / mag;
                    
                    fieldctx.strokeStyle = '#333';
                    fieldctx.beginPath();
                    fieldctx.moveTo(x, y);
                    fieldctx.lineTo(x + nx*len, y + ny*len);
                    fieldctx.stroke();
                }
            }
        }
    }

    function drawcursor() {
        if (mousex == 0 && mousey == 0) return;
        
        objctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        objctx.beginPath();
        objctx.arc(mousex, mousey, 10, 0, Math.PI * 2);
        objctx.moveTo(mousex - 15, mousey);
        objctx.lineTo(mousex + 15, mousey);
        objctx.moveTo(mousex, mousey - 15);
        objctx.lineTo(mousex, mousey + 15);
        objctx.stroke();

        var f = getfield(mousex, mousey);
        var mag = Math.sqrt(f.x*f.x + f.y*f.y);
        if (mag > 0.1) {
            var len = Math.min(50, mag * 5);
            objctx.strokeStyle = '#f9ed69';
            objctx.lineWidth = 2;
            objctx.beginPath();
            objctx.moveTo(mousex, mousey);
            objctx.lineTo(mousex + (f.x/mag)*len, mousey + (f.y/mag)*len);
            objctx.stroke();
        }
    }

    function loop() {
        spawnparticles(false);
        updatephysics();
        drawall();
        calcstats();
        requestAnimationFrame(loop);
    }

    init();
    //finished