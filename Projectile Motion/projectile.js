const CANVAS = document.getElementById('trajectorycanvas');
const CONTEXT = CANVAS.getContext('2d');
const OUTPUTPANEL = document.getElementById('outputpanel');

const WIDTH = 600;
const HEIGHT = 400;

let animationid = null;
let currenttime = 0;
const ANIMATION_TIMESTEP = 0.05;
let trajectorydata = {
    points: [],
    timeofflight: 0,
    range: 0,
    maxheight: 0,
    inputs: null
};
let currentmaxheight = 0;

function getInputs() {
    const angledegrees = parseFloat(document.getElementById('angle').value);
    const initialvelocity = parseFloat(document.getElementById('velocity').value);
    const gravity = parseFloat(document.getElementById('gravity').value);
    const hasDrag = document.getElementById('drag').checked;

    const angleradians = angledegrees * (Math.PI / 180);

    return {
        angle: angleradians,
        velocity: initialvelocity,
        gravity: gravity,
        dragEnabled: hasDrag
    };
}

function updateFinalOutputs(maxheight, timeofflight, range) {
    document.getElementById('maxheight').textContent = `${maxheight.toFixed(2)} m`;
    document.getElementById('timeofflight').textContent = `${timeofflight.toFixed(2)} s`;
    document.getElementById('range').textContent = `${range.toFixed(2)} m`;
    OUTPUTPANEL.classList.add('simulation-complete');
}

function updateInstantaneousOutputs(x, y, t) {
    currentmaxheight = Math.max(currentmaxheight, y);
    document.getElementById('maxheight').textContent = `${currentmaxheight.toFixed(2)} m`;
    document.getElementById('timeofflight').textContent = `${t.toFixed(2)} s`;
    document.getElementById('range').textContent = `${x.toFixed(2)} m`;
}

function calculateNoDrag(inputs) {
    const { angle, velocity, gravity } = inputs;
    const vy = velocity * Math.sin(angle);

    const timeofflight = (2 * vy) / gravity;
    const maxheight = (vy * vy) / (2 * gravity);
    const range = (velocity * velocity * Math.sin(2 * angle)) / gravity;

    return { timeofflight, maxheight, range };
}

function calculateWithDrag(inputs) {
    const { angle, velocity, gravity } = inputs;
    const DRAG_COEFFICIENT = 0.03;
    const DELTA_TIME = 0.02;

    let x = 0;
    let y = 0;
    let vx = velocity * Math.cos(angle);
    let vy = velocity * Math.sin(angle);
    let time = 0;

    let trajectorypoints = [];
    let maxheight = 0;
    let timeofflight = 0;
    let finalrange = 0;
    let maxiterations = 5000;

    while (y >= 0 || time === 0) {
        if (maxiterations-- <= 0) break;

        const speed = Math.sqrt(vx * vx + vy * vy);

        const dragforcex = DRAG_COEFFICIENT * vx * speed;
        const dragforcey = DRAG_COEFFICIENT * vy * speed;

        const ax = -dragforcex;
        const ay = -gravity - dragforcey;

        vx += ax * DELTA_TIME;
        vy += ay * DELTA_TIME;

        x += vx * DELTA_TIME;
        y += vy * DELTA_TIME;
        time += DELTA_TIME;

        if (y >= 0) {
            trajectorypoints.push({ x: x, y: y });
            maxheight = Math.max(maxheight, y);
            finalrange = x;
        } else if (y < 0 && timeofflight === 0) {
            timeofflight = time;
        }
    }

    timeofflight = timeofflight || time;

    return { timeofflight, maxheight, range: finalrange, points: trajectorypoints };
}

function toCanvasCoords(x, y, totalrange, maxheight) {
    const maxphysicsdim = Math.max(totalrange, maxheight) * 1.1;
    if (maxphysicsdim === 0) return { px: 0, py: HEIGHT };

    const padding = 50;
    const usablewidth = WIDTH - 2 * padding;
    const usableheight = HEIGHT - 2 * padding;

    const scalex = usablewidth / maxphysicsdim;
    const scaley = usableheight / maxphysicsdim;

    const offsetx = padding;
    const groundy = HEIGHT - padding;

    const px = x * scalex + offsetx;
    const py = groundy - (y * scaley);
    return { px, py };
}

function drawStaticPath(points, totalrange, maxheight) {
    const padding = 50;
    const groundy = HEIGHT - padding;
    const offsetx = padding;

    CONTEXT.strokeStyle = '#64748b';
    CONTEXT.lineWidth = 2;
    CONTEXT.beginPath();
    CONTEXT.moveTo(offsetx, groundy);
    CONTEXT.lineTo(WIDTH, groundy);
    CONTEXT.moveTo(offsetx, groundy);
    CONTEXT.lineTo(offsetx, 0);
    CONTEXT.stroke();

    CONTEXT.strokeStyle = '#ef444433';
    CONTEXT.lineWidth = 4;
    CONTEXT.lineCap = 'round';
    CONTEXT.beginPath();

    if (points && points.length > 0) {
        let { px, py } = toCanvasCoords(points[0].x, points[0].y, totalrange, maxheight);
        CONTEXT.moveTo(px, py);

        for (const p of points) {
            ({ px, py } = toCanvasCoords(p.x, p.y, totalrange, maxheight));
            CONTEXT.lineTo(px, py);
        }
    }

    CONTEXT.stroke();

    CONTEXT.fillStyle = '#e2e8f0';
    CONTEXT.font = '12px sans-serif';
    CONTEXT.textAlign = 'center';
    CONTEXT.fillText(`Range (${totalrange.toFixed(1)} m)`, WIDTH / 2, groundy + 25);

    CONTEXT.textAlign = 'right';
    CONTEXT.fillText(`Height (${maxheight.toFixed(1)} m)`, offsetx - 5, toCanvasCoords(0, maxheight, totalrange, maxheight).py);
}

function drawProjectile(x, y, totalrange, maxheight) {
    CONTEXT.fillStyle = '#facc15';
    CONTEXT.beginPath();
    let coords = toCanvasCoords(x, y, totalrange, maxheight);
    CONTEXT.arc(coords.px, coords.py, 8, 0, 2 * Math.PI);
    CONTEXT.fill();
}

function animateProjectile() {
    if (animationid) {
        cancelAnimationFrame(animationid);
    }

    const { points, timeofflight, range, maxheight, inputs } = trajectorydata;

    if (!points || points.length === 0 || timeofflight === 0) {
        CONTEXT.clearRect(0, 0, WIDTH, HEIGHT);
        drawStaticPath([], 0, 0);
        return;
    }

    OUTPUTPANEL.classList.remove('simulation-complete');

    const totalsteps = points.length;
    const stepduration = totalsteps > 0 ? timeofflight / totalsteps : 0;

    function getPositionAtTime(t) {
        if (inputs.dragEnabled) {
            let pointindex = Math.floor(t / stepduration);
            pointindex = Math.min(pointindex, totalsteps - 1);
            return points[pointindex];
        } else {
            const vx = inputs.velocity * Math.cos(inputs.angle);
            const vy = inputs.velocity * Math.sin(inputs.angle);
            const g = inputs.gravity;

            const x = vx * t;
            const y = vy * t - 0.5 * g * t * t;

            return { x, y: Math.max(0, y) };
        }
    }

    function loop() {
        if (currenttime > timeofflight) {
            cancelAnimationFrame(animationid);

            document.getElementById('maxheight').textContent = `${maxheight.toFixed(2)} m`;
            document.getElementById('timeofflight').textContent = `${timeofflight.toFixed(2)} s`;
            document.getElementById('range').textContent = `${range.toFixed(2)} m`;

            OUTPUTPANEL.classList.add('simulation-complete');

            CONTEXT.clearRect(0, 0, WIDTH, HEIGHT);
            drawStaticPath(points, range, maxheight);
            drawProjectile(range, 0, range, maxheight);
            return;
        }

        CONTEXT.clearRect(0, 0, WIDTH, HEIGHT);
        drawStaticPath(points, range, maxheight);

        const { x, y } = getPositionAtTime(currenttime);

        updateInstantaneousOutputs(x, y, currenttime);

        drawProjectile(x, y, range, maxheight);

        currenttime += ANIMATION_TIMESTEP;

        animationid = requestAnimationFrame(loop);
    }

    currenttime = 0;
    loop();
}

function simulateMotion() {
    const inputs = getInputs();
    let results = { maxheight: 0, timeofflight: 0, range: 0 };
    let points = [];

    if (animationid) {
        cancelAnimationFrame(animationid);
    }

    if (inputs.velocity <= 0 || inputs.gravity <= 0) {
        updateFinalOutputs(0, 0, 0);
        drawStaticPath([], 0, 0);
        return;
    }

    if (inputs.dragEnabled) {
        const dragresults = calculateWithDrag(inputs);
        results = dragresults;
        points = dragresults.points;
    } else {
        const nodragresults = calculateNoDrag(inputs);
        results = nodragresults;

        const vx = inputs.velocity * Math.cos(inputs.angle);
        const vy = inputs.velocity * Math.sin(inputs.angle);
        const g = inputs.gravity;

        for (let t = 0; t <= results.timeofflight; t += results.timeofflight / 100) {
            const x = vx * t;
            const y = vy * t - 0.5 * g * t * t;
            if (y >= 0) {
                points.push({ x: x, y: y });
            }
        }
    }

    trajectorydata.points = points;
    trajectorydata.timeofflight = results.timeofflight;
    trajectorydata.range = results.range;
    trajectorydata.maxheight = results.maxheight;
    trajectorydata.inputs = inputs;

    currentmaxheight = 0;
    updateInstantaneousOutputs(0, 0, 0);

    animateProjectile();
}

window.onload = simulateMotion;
