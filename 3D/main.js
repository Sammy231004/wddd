// Инициализируем сцену, камеру и рендерер
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.querySelector('.main-content').appendChild(renderer.domElement);

// Добавляем освещение
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Добавляем куб для примера
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Добавляем функцию анимации
function animate() {
    requestAnimationFrame(animate);

    // Вращаем куб
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}

// Добавляем функцию загрузки модели
function loadModel() {
    const input = document.getElementById('modelInput');
    input.addEventListener('change', handleFile);

    input.click();
}

function handleFile(event) {
    const file = event.target.files[0];

    if (file) {
        // Загружаем GLTFLoader
        const loader = new THREE.GLTFLoader();

        loader.load(
            URL.createObjectURL(file),
            (gltf) => {
                // Удаляем предыдущие объекты из сцены
                scene.children.forEach((child) => {
                    if (child.type === 'Mesh') {
                        scene.remove(child);
                    }
                });

                // Добавляем новую модель в сцену
                scene.add(gltf.scene);

                // Опционально устанавливаем положение камеры для просмотра модели
                const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
                const center = boundingBox.getCenter(new THREE.Vector3());
                const size = boundingBox.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = camera.fov * (Math.PI / 180);
                camera.position.z = maxDim / (2 * Math.tan(fov / 2));

                animate();
            },
            undefined,
            (error) => {
                console.error('Error loading 3D model', error);
            }
        );
    }
}

// Запускаем анимацию
animate();
