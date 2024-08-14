let scene, camera, renderer, light;
const modelInstances = [];

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // Camera position
    camera.position.z = 15;

    // Lighting
    light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 0, 10);
    scene.add(light);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Load GLB model
    loadModel();

    // Set up event listeners
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    // Start animation loop
    animate();
}

function loadModel() {
    const loader = new THREE.GLTFLoader();
    console.log('Starting to load GLB file...');
    loader.load(
        'QG_1.glb',  // Assuming the file is in the same directory as the HTML
        (gltf) => {
            console.log('GLB file loaded successfully', gltf);
            const model = gltf.scene;

            // Adjust model if necessary
            model.scale.set(0.1, 0.1, 0.1);  // Scale down if the model is too large
            model.position.set(0, 0, 0);     // Center the model

            // Create a 9x9 grid of model instances
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    const instance = model.clone();
                    instance.position.set(i * 1.5 - 6, j * 1.5 - 6, 0);
                    scene.add(instance);
                    modelInstances.push(instance);
                }
            }
            console.log('Grid created with', modelInstances.length, 'instances');
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
            console.error('An error happened while loading the GLB file', error);
        }
    );
}

function onMouseMove(event) {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(modelInstances, true);

    modelInstances.forEach(instance => {
        instance.rotation.x = 0;
        instance.rotation.y = 0;
    });

    if (intersects.length > 0) {
        let instance = intersects[0].object;
        while (instance.parent && instance.parent !== scene) {
            instance = instance.parent;
        }
        instance.rotation.x = mouse.y * 0.5;
        instance.rotation.y = mouse.x * 0.5;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Start the application
init();