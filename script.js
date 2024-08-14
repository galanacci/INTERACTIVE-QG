let scene, camera, renderer, light;
const modelInstances = [];
let objectSize = 1.5; // Adjust this based on your model's actual size
let spacing = 1.5; // Space between objects, adjust as needed

function init() {
    console.log('Initializing scene...');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // Adjust camera position based on screen size
    updateCameraPosition();

    light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 0, 10);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    loadModel();

    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    animate();
    console.log('Scene initialization complete');
}

function updateCameraPosition() {
    const aspectRatio = window.innerWidth / window.innerHeight;
    const viewportHeight = 20; // Adjust this to change how much of the scene is visible
    const viewportWidth = viewportHeight * aspectRatio;
    camera.position.z = viewportHeight / 2 / Math.tan((camera.fov * Math.PI) / 360);
    console.log('Camera position updated:', camera.position);
}

function loadModel() {
    const loader = new THREE.GLTFLoader();
    console.log('Starting to load GLB file...');
    loader.load(
        'QG_1.glb',
        (gltf) => {
            console.log('GLB file loaded successfully', gltf);
            const model = gltf.scene;

            console.log('Model before scaling:', model.scale);
            model.scale.set(1, 1, 1);
            console.log('Model after scaling:', model.scale);

            populateScene(model);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
            console.error('An error happened while loading the GLB file', error);
        }
    );
}

function populateScene(model) {
    // Clear existing instances
    modelInstances.forEach(instance => scene.remove(instance));
    modelInstances.length = 0;

    const aspectRatio = window.innerWidth / window.innerHeight;
    const viewportHeight = 20; // Should match the value in updateCameraPosition
    const viewportWidth = viewportHeight * aspectRatio;

    const columns = Math.ceil(viewportWidth / spacing) + 1;
    const rows = Math.ceil(viewportHeight / spacing) + 1;

    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            const instance = model.clone();
            instance.position.set(
                (i - (columns - 1) / 2) * spacing,
                (j - (rows - 1) / 2) * spacing,
                0
            );
            scene.add(instance);
            modelInstances.push(instance);
        }
    }
    console.log('Grid created with', modelInstances.length, 'instances');
}

function onMouseMove(event) {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    modelInstances.forEach(instance => {
        const instanceScreenPosition = instance.position.clone().project(camera);
        
        const directionX = mouse.x - instanceScreenPosition.x;
        const directionY = mouse.y - instanceScreenPosition.y;
        
        const distance = Math.sqrt(directionX * directionX + directionY * directionY);
        
        const tiltX = directionY * Math.min(distance, 1) * 0.5;
        const tiltY = -directionX * Math.min(distance, 1) * 0.5;
        
        instance.rotation.x += (tiltX - instance.rotation.x) * 0.1;
        instance.rotation.y += (tiltY - instance.rotation.y) * 0.1;
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateCameraPosition();
    populateScene(modelInstances[0]); // Repopulate with the first instance as a template
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

init();