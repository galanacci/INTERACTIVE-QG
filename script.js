const InteractiveWall = () => {
    const mountRef = React.useRef(null);
  
    React.useEffect(() => {
      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.appendChild(renderer.domElement);
  
      // Camera position
      camera.position.z = 15;
  
      // Lighting
      const light = new THREE.PointLight(0xffffff, 1, 100);
      light.position.set(0, 0, 10);
      scene.add(light);
  
    // GLB model loading
    const loader = new THREE.GLTFLoader();
    const modelInstances = [];

    console.log('Starting to load GLB file...');
    loader.load(
      '/QG_1.glb',  // Replace with the path to your GLB file
      (gltf) => {
        console.log('GLB file loaded successfully', gltf);
        const model = gltf.scene;

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
  
      // Raycaster for mouse interaction
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
  
      // Mouse move event listener
      const onMouseMove = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(modelInstances);
  
        modelInstances.forEach(instance => {
          instance.rotation.x = 0;
          instance.rotation.y = 0;
        });
  
        if (intersects.length > 0) {
          const instance = intersects[0].object;
          instance.rotation.x = mouse.y * 0.5;
          instance.rotation.y = mouse.x * 0.5;
        }
      };
  
      window.addEventListener('mousemove', onMouseMove, false);
  
      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
  
      // Clean up
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        mountRef.current.removeChild(renderer.domElement);
      };
    }, []);
  
    return React.createElement('div', { ref: mountRef });
  };