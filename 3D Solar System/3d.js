let scene, camera, renderer, controls;
let clock = new THREE.Clock();

const container = document.getElementById("threeContainer");
const speedControl = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");
const orbitToggle = document.getElementById("orbitToggle");
const pauseBtn = document.getElementById("pauseBtn");
const infoname = document.getElementById("planetName");
const infoData = document.getElementById("planetData");

const planetsData = [
  {
    name: "Mercury",
    size: 0.035,
    distance: 100,
    period: 4,
    color: 0xbdbdbd,
    realDiameter: "4,880km",
    realRotation: "58.6 Earth days",
    realRevolution: "88 Earth days",
  },
  {
    name: "Venus",
    size: 0.087,
    distance: 140.0,
    period: 7,
    color: 0xe0c28b,
    realDiameter: "12,104 km",
    realRotation: "243 Earth Days",
    realRevolution: "225 Earth days",
  },
  {
    name: "Earth",
    size: 0.091,
    distance: 180.0,
    period: 10,
    color: 0x3b82f6,
    realDiameter: "12,756 km",
    realRotation: "24 hours",
    realRevolution: "365.25 Earth days",
  },
  {
    name: "Mars",
    size: 0.048,
    distance: 230.0,
    period: 15,
    color: 0xd9734a,
    realDiameter: "6,779 km",
    realRotation: "24.6 hours",
    realRevolution: "1.88 Earth years",
  },
  {
    name: "Jupiter",
    size: 1.02,
    distance: 350.0,
    period: 30,
    color: 0xd4a96b,
    realDiameter: "142,984 km",
    realRotation: "9.9 hours",
    realRevolution: "11.86 Earth years",
  },
  {
    name: "Saturn",
    size: 0.86,
    distance: 500.0,
    period: 45,
    color: 0xe8d3a6,
    realDiameter: "120,536 km",
    realRotation: "10.7 hours",
    realRevolution: "29.46 Earth years",
    hasRing: true,
  },
  {
    name: "Uranus",
    size: 0.36,
    distance: 600.0,
    period: 60,
    color: 0xa7e3e8,
    realDiameter: "51,118 km",
    realRotation: "17.2 hours",
    realRevolution: "84.01 Earth years",
  },
  {
    name: "Neptune",
    size: 0.35,
    distance: 700.0,
    period: 80,
    color: 0x5b6be6,
    realDiameter: "49,528 km",
    realRotation: "16.1 hours",
    realRevolution: "164.8 Earth years",
  },
];

const state = {
  running: true,
  globalSpeed: 1.0,
  orbitalElements: [],
  raycaster: new THREE.Raycaster(),
  mouse: new THREE.Vector2(),
  intersectable: [],
};

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020210);

  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    5000
  );

  camera.position.set(0, 200, 300);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 1200;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambientLight);

  const sunLight = new THREE.PointLight(0xffffff, 2.5, 0);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  addStars();
  createSun();
  planetsData.forEach((p) => createPlanet(p));
  window.addEventListener("resize", onWindowResize);
  renderer.domElement.addEventListener("click", onPlanetClick);
  speedControl.addEventListener("input", updateSpeed);
  if (orbitToggle) orbitToggle.addEventListener("change", toggleOrbits);
  pauseBtn.addEventListener("click", togglePause);

  updateSpeed();
  showInfo({
    name: "Sun",
    realDiameter: "1,392,000 km",
    realRotation: "25.38 Earth days",
    isSun: true,
  });
}

function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function addStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 10000;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    positions[i * 3 + 0] = THREE.MathUtils.randFloatSpread(4000);
    positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(4000);
    positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(4000);
  }
  starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({ size: 1.0 });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

function createSun() {
  const sunGeometry = new THREE.SphereGeometry(80, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  const glow = new THREE.PointLight(0xffcc66, 1.5, 400);
  sun.add(glow);
}

function createPlanet(data) {
  const geometry = new THREE.SphereGeometry(data.size * 40, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color: data.color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = data.name;

  const points = [];
  for (let i = 0; i < 128; i++) {
    const angle = (i / 128) * Math.PI * 2;
    points.push(
      new THREE.Vector3(Math.cos(angle) * data.distance, 0, Math.sin(angle) * data.distance)
    );
  }

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x444444, linewidth: 2 });
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbit.visible = orbitToggle ? orbitToggle.checked : true;
  scene.add(orbit);

  if (data.hasRing) {
    const ringGeometry = new THREE.RingGeometry(data.size * 50, data.size * 80, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x888888,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    mesh.add(ringMesh);
  }

  scene.add(mesh);
  state.intersectable.push(mesh);

  state.orbitalElements.push({
    mesh: mesh,
    orbit: orbit,
    data: data,
    angle: Math.random() * Math.PI * 2,
  });
}

function onPlanetClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  state.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  state.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  state.raycaster.setFromCamera(state.mouse, camera);

  const intersects = state.raycaster.intersectObjects(state.intersectable);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    const planet = state.orbitalElements.find((e) => e.mesh === hit);

    if (planet) {
      showInfo(planet.data);
      controls.target.copy(hit.position);
      controls.update();
    }
  } else {
    controls.target.set(0, 0, 0);
    controls.update();
    showInfo({
      name: "Sun",
      realDiameter: "1,392,000 km",
      realRotation: "25.38 Earth days",
      isSun: true,
    });
  }
}

function showInfo(data) {
  infoname.textContent = data.name.toUpperCase();

  if (data.isSun) {
    infoData.innerHTML = `
        <div><strong>Real Diameter:</strong> ${data.realDiameter}</div>
        <div><strong>Rotation Time:</strong> ${data.realRotation}</div>
        <div><strong>Type:</strong> G2V Main Sequence</div>
        <div><strong>Instruction:</strong> Use mouse to orbit and zoom.</div>
        `;
  } else {
    infoData.innerHTML = `
    <div><strong>Real Diameter:</strong> ${data.realDiameter}</div>
    <div><strong>Rotation Period:</strong> ${data.realRotation}</div>
    <div><strong>Revolution Period:</strong> ${data.realRevolution}</div>
    <div><strong>Sim. Radius:</strong> ${(data.size * 40).toFixed(2)}</div>
    <div><strong>Sim. Distance:</strong> ${data.distance.toFixed(1)}</div>
    ${data.hasRing ? '<div><strong>Rings:</strong> Present</div>' : '<div><strong>Rings:</strong> Absent</div>'}
    `;
  }
}

function updateSpeed() {
  state.globalSpeed = Number(speedControl.value);
  speedValue.textContent = state.globalSpeed.toFixed(1);
}

function toggleOrbits() {
  const visible = orbitToggle.checked;
  state.orbitalElements.forEach((e) => {
    e.orbit.visible = visible;
  });
}

function togglePause() {
  state.running = !state.running;
  pauseBtn.textContent = state.running ? "Pause Simulation" : "Resume Simulation";
}

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  if (state.running) {
    state.orbitalElements.forEach((el) => {
      const { mesh, data } = el;
      const periodFactor = 1.0 / data.period;
      const orbitalSpeed = periodFactor * state.globalSpeed * 0.5 * Math.PI;
      el.angle += orbitalSpeed * deltaTime;
      const x = data.distance * Math.cos(el.angle);
      const z = data.distance * Math.sin(el.angle);
      mesh.position.set(x, 0, z);
    });
  }

  controls.update();
  renderer.render(scene, camera);
}

init();
animate();