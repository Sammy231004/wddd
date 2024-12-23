import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/FBXLoader.js';


const viewerWidth = 800;
const viewerHeight = 600;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, viewerWidth / viewerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(viewerWidth, viewerHeight);

const viewerContainer = document.getElementById('viewer-container');
viewerContainer.appendChild(renderer.domElement);

let loadedModel;
let backgroundTexture;

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

window.addEventListener('resize', () => {
  camera.aspect = viewerWidth / viewerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(viewerWidth, viewerHeight);
});

const handleLoadedModel = (model) => {
  // Удалить предыдущую модель из сцены, если есть
  if (loadedModel) {
    scene.remove(loadedModel);
  }

  // Добавить новую модель в сцену
  loadedModel = model;
  scene.add(model);

  // Вычислить ограничивающую сферу модели
  const boundingSphere = new THREE.Sphere();
  const boundingBox = new THREE.Box3().setFromObject(model);
  boundingBox.getBoundingSphere(boundingSphere);

  // Подгоняем камеру к размерам модели
  const center = boundingSphere.center;
  const radius = boundingSphere.radius;
  const fov = camera.fov * (Math.PI / 180);
  const cameraDistance = Math.abs(radius / Math.sin(fov / 2));

  camera.position.set(center.x, center.y, center.z + cameraDistance);
  controls.target.set(center.x, center.y, center.z);
  controls.maxPolarAngle = Math.PI / 2;
  controls.minPolarAngle = Math.PI / 2;
  controls.update();

  // Обрабатываем текстуры модели
  handleModelTextures(model);
};

const handleModelTextures = (model) => {
  const textures = [];
  gatherTextures(model, textures);

  // Загрузка и применение текстур
  const textureLoader = new THREE.TextureLoader();
  textures.forEach((textureUrl) => {
    const texture = textureLoader.load(textureUrl);
    // Здесь вы можете использовать загруженную текстуру по вашему усмотрению
  });
};

const gatherTextures = (object, textures) => {
  if (object instanceof THREE.Mesh) {
    const material = object.material;

    if (material instanceof THREE.MeshStandardMaterial) {
      // Пример: получение URL текстуры из MeshStandardMaterial
      if (material.map) {
        textures.push(material.map);
      }

      // Добавьте обработку других текстур по вашему усмотрению
    }
  }

  if (object.children) {
    object.children.forEach((child) => {
      gatherTextures(child, textures);
    });
  }
};
const uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(uploadForm);
  const modelFile = formData.get('modelFile');
  const backgroundImageFile = formData.get('backgroundImage');

  if (modelFile && backgroundImageFile) {
    const fileExtension = modelFile.name.split('.').pop().toLowerCase();

    if (fileExtension === 'obj') {
      const objLoader = new OBJLoader();
      objLoader.load(URL.createObjectURL(modelFile), (object) => {
        handleLoadedModel(object);
        animate();
      });
    } else if (fileExtension === 'fbx') {
      const fbxLoader = new FBXLoader();
      fbxLoader.load(URL.createObjectURL(modelFile), (object) => {
        handleLoadedModel(object);
        animate();
      });
    } else if (fileExtension === 'gltf' || fileExtension === 'glb') {
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(URL.createObjectURL(modelFile), (gltf) => {
        handleLoadedModel(gltf.scene);
        animate();
      });
    }  else {
      console.error('Формат модели не поддерживается. Реализуйте логику для конвертации или обработки.');
    }

    const textureLoader = new THREE.TextureLoader();
    backgroundTexture = textureLoader.load(URL.createObjectURL(backgroundImageFile), () => {
      console.log('Фон успешно загружен.');
    });
    scene.background = backgroundTexture;
  }
});


camera.position.z = 10;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
