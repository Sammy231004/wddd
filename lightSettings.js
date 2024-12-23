// lightSettings.js

import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js';
import { DragControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/DragControls.js';

export const setupLights = (scene, camera, renderer, viewerWidth, viewerHeight) => {
  // Ambient light to provide overall illumination
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  // Directional light for shadows
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 1, 0);
  directionalLight.castShadow = true; // Включаем генерацию теней
  scene.add(directionalLight);

  const numberOfLights = 3;

  // Point lights for additional lighting
  const lights = [directionalLight, ...Array.from({ length: numberOfLights }, () => new THREE.PointLight(0xffffff, 1, 100))];

  // Drag controls for lights
  const dragControls = new DragControls(lights, camera, renderer.domElement);
  dragControls.addEventListener('drag', () => {
    updateLights(lights);
  }, { passive: true });

  // Resize listener to handle aspect ratio changes
  window.addEventListener('resize', () => {
    camera.aspect = viewerWidth / viewerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewerWidth, viewerHeight);
  }, { passive: true });

  return lights;
};

export const updateLights = (lights) => {
  lights.forEach((light) => {
    light.target.position.copy(light.position);
    light.target.updateMatrixWorld();
  });
};

const addLight = (scene, lights, camera, renderer, viewerWidth, viewerHeight) => {
  console.log('Функция addLight вызвана');
  const newLight = new THREE.PointLight(0xffffff, 1, 100);
  newLight.position.set(0, 0, 0); // Начальное положение нового света

  // Добавление нового света в сцену и в список источников света
  scene.add(newLight);
  lights.push(newLight);

  // Обновление списка источников света для управления перетаскиванием
  const dragControls = new DragControls(lights, camera, renderer.domElement);
  dragControls.addEventListener('drag', () => {
    updateLights(lights);
  }, { passive: true });

  // Обработка изменений размеров окна
  window.addEventListener('resize', () => {
    camera.aspect = viewerWidth / viewerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewerWidth, viewerHeight);
  }, { passive: true });
};

export default addLight;
