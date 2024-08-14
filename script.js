let scene, camera, renderer, light;
const modelInstances = [];
let objectSize = 1.5; // Adjust this based on your model's actual size
let spacing = 1.5; // Space between objects, adjust as needed

function init() {
    console.log('Initializing scene...');
    scene = new THREE.Scene();
    
    // Set up orthographic camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    const frustumSize = 50; // Adjusted to match previous view
    camera = new THREE.OrthographicCamera(
        frustumSize * aspectRatio / -2,
        frustumSize * aspectRatio / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
    );
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

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

function loadModel() {
    const loader = new THREE.GLTFLoader();
    console.log('Starting to load GLB file...');
    loader.load(
        'QG_1.glb',
        (gltf) => {
            console.log('GLB file loaded successfully', gltf);
            const model = gltf.scene;

            console.log('Model before scaling:', model.scale);
            model.scale.set(1, 1, 1); // Keeping original scale
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
    modelInstances.forEach(instance => scene.remove(instance));
    modelInstances.length = 0;

    const aspectRatio = window.innerWidth / window.innerHeight;
    const frustumSize = 50;
    const width = frustumSize * aspectRatio;
    const height = frustumSize;

    const columns = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;

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

    const frustumSize = 50;
    const aspectRatio = window.innerWidth / window.innerHeight;
    const mouseX = (mouse.x * frustumSize * aspectRatio) / 2;
    const mouseY = (mouse.y * frustumSize) / 2;

    const influenceRadius = 10; // Adjust this to change the size of the affected area
    const maxTiltAngle = 1; // Maximum tilt angle in radians

    modelInstances.forEach(instance => {
        const dx = mouseX - instance.position.x;
        const dy = mouseY - instance.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < influenceRadius) {
            const tiltFactor = 1 - (distance / influenceRadius);
            const tiltX = dy * tiltFactor * maxTiltAngle;
            const tiltY = -dx * tiltFactor * maxTiltAngle;
            
            instance.rotation.x += (tiltX - instance.rotation.x) * 0.1;
            instance.rotation.y += (tiltY - instance.rotation.y) * 0.1;
        } else {
            // Gradually return to neutral position if outside influence radius
            instance.rotation.x += (0 - instance.rotation.x) * 0.1;
            instance.rotation.y += (0 - instance.rotation.y) * 0.1;
        }
    });
}

function onWindowResize() {
    const aspectRatio = window.innerWidth / window.innerHeight;
    const frustumSize = 50;
    camera.left = frustumSize * aspectRatio / -2;
    camera.right = frustumSize * aspectRatio / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    populateScene(modelInstances[0]); // Repopulate with the first instance as a template
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

init();