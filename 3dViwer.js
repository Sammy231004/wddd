//3dViwer.js

import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/FBXLoader.js';
import { DragControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/DragControls.js';
import { RGBELoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/RGBELoader.js';
import { TrackballControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/TrackballControls.js';
import * as materialFunctions from './materialFunctions.js';
import { setupLights, updateLights} from './lightSettings.js';
import * as lightSettings from './lightSettings.js';
import addLight from './materialFunctions.js'; 



let controls;
let lights; 

const viewerWidth = 1600;
const viewerHeight = 1000;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, viewerWidth / viewerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(viewerWidth, viewerHeight);

const viewerContainer = document.getElementById('viewer-container');
viewerContainer.appendChild(renderer.domElement);

const cubeTextureLoader = new THREE.CubeTextureLoader();
const pmremGenerator = new THREE.PMREMGenerator(renderer);

const rgbeLoader = new RGBELoader();
// Устанавливаем тип данных для загрузчика HDR текстур
rgbeLoader.setDataType(THREE.UnsignedByteType);

// Загружаем текстуру HDR
rgbeLoader.load(
    '1.hdr',
    (texture) => {
        // Логируем успешную загрузку текстуры
        console.log('Текстура окружения успешно загружена:', texture);

        // Настраиваем параметры текстуры
        texture.encoding = THREE.RGBEEncoding; // Устанавливаем кодировку текстуры
        texture.generateMipmaps = false; // Отключаем генерацию mipmap'ов
        texture.format = THREE.RGBAFormat; // Устанавливаем формат текстуры
        texture.magFilter = THREE.LinearFilter; // Устанавливаем магнификационный фильтр
        texture.minFilter = THREE.LinearFilter; // Устанавливаем минификационный фильтр
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Устанавливаем анизотропию

        // Создаем текстуру окружения HDR из изображения сферической проекции
        const envMapHDR = pmremGenerator.fromEquirectangular(texture, { resolution: 8192, generateMipmaps: true });

        // Устанавливаем кодировку текстуры окружения
        envMapHDR.texture.encoding = THREE.RGBEEncoding;

        // Применяем текстуру окружения к сцене и фону
        scene.environment = envMapHDR.texture;
        scene.background = envMapHDR.texture;
    },
    undefined,
    // Обрабатываем ошибку загрузки
    (error) => {
        console.error('Ошибка загрузки HDR файла:', error);
    }
);




// Проверьте, что параметры отрисовки правильно настроены
renderer.setSize(viewerWidth, viewerHeight);

// Проверьте, что параметры камеры правильно настроены
camera.aspect = viewerWidth / viewerHeight;
camera.updateProjectionMatrix();


let loadedModel;
let backgroundTexture;
let partsDropdown;

renderer.shadowMap.enabled = true;
let lightColorInput = document.getElementById('lightColor');
let backgroundColorInput = document.getElementById('backgroundColor');
let toggleShadowsCheckbox = document.getElementById('toggleShadows');
controls = new TrackballControls(camera, renderer.domElement);


function applySettings() {
  const lightColor = new THREE.Color(lightColorInput.value);
  directionalLight.color.copy(lightColor);
  scene.background = new THREE.Color(backgroundColorInput.value);
  directionalLight.castShadow = toggleShadowsCheckbox.checked;
}

let uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(uploadForm);
  const modelFile = formData.get('modelFile');


  if (modelFile ) {
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
        createPartDropdown(gltf.scene); // Добавленная строка для создания выпадающего списка частей
        animate();
      });
    } else {
      console.error('Формат модели не поддерживается. Реализуйте логику для конвертации или обработки.');
    }

    uploadForm.style.display = 'none';
  }

  materialFunctions.updateBaseColor(loadedModel);
  materialFunctions.updateBaseColorIntensity(loadedModel);
  materialFunctions.updateMetalnessMap(loadedModel);
  materialFunctions.updateMetalnessIntensity(loadedModel);
  materialFunctions.updateOcclusionIntensity(loadedModel);
  materialFunctions.updateEmissionIntensity(loadedModel);
});

function createPartDropdown(model) {
  const partsDropdown = document.createElement('select');
  partsDropdown.id = 'partsDropdown';
  document.body.appendChild(partsDropdown);

  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const option = document.createElement('option');
      option.value = child.name;
      option.text = child.name;
      partsDropdown.appendChild(option);
    }
  });

  partsDropdown.addEventListener('change', (event) => {
    const selectedPartName = event.target.value;
    handlePartSelection(model, selectedPartName);
  });
}

function handlePartSelection(model, selectedPartName) {
  const selectedPart = model.getObjectByName(selectedPartName);

  if (selectedPart) {
    console.log('Выбранная часть:', selectedPart);
    materialFunctions.updateBaseColor(selectedPart);
    materialFunctions.updateBaseColorIntensity(selectedPart);
    materialFunctions.updateMetalnessMap(selectedPart);
    materialFunctions.updateMetalnessIntensity(selectedPart);
    materialFunctions.updateOcclusionIntensity(selectedPart);
    materialFunctions.updateEmissionIntensity(selectedPart);
  } else {
    console.error('Выбранная часть не найдена:', selectedPartName);
  }
}


function toggleSettingsMenu() {
  const controlsContainer = document.getElementById('controls-container');
  uploadForm.style.display = 'none';
}


camera.position.z = 10;

controls.enableDamping = true;
controls.dampingFactor = 0;
controls.rotateSpeed = 5;
controls.addEventListener('change', () => {},);

function handleLoadedModel(model) {
  if (loadedModel) {
    scene.remove(loadedModel);
  }

  
  loadedModel = model;
  scene.add(model);

  const boundingSphere = new THREE.Sphere();
  const boundingBox = new THREE.Box3().setFromObject(model);
  boundingBox.getBoundingSphere(boundingSphere);

  const center = boundingSphere.center;
  const radius = boundingSphere.radius;
  const fov = camera.fov * (Math.PI / 180);
  const cameraDistance = Math.abs(radius / Math.sin(fov / 2));

  camera.position.set(center.x, center.y, center.z + cameraDistance);
  controls.target.copy(center);
  controls.update();

  // Размеры пола равны размерам модели
  const floorGeometry = new THREE.PlaneGeometry(boundingBox.getSize().x, boundingBox.getSize().z);
  const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });

  // Создание объекта пола
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2; // Поворот пола, чтобы он был параллелен плоскости Y
  floor.position.y = boundingBox.min.y; // Пол позиционируется на уровне нижней грани модели

  // Включение генерации теней для пола
  floor.receiveShadow = true;

  // Добавление пола к сцене
  scene.add(floor);

  controls.update();
  handleModelTextures(model);

  // Внутри handleLoadedModel
model.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    if (child.material instanceof THREE.Material) {
      // Переопределение материала на MeshStandardMaterial
      child.material = new THREE.MeshStandardMaterial({
        color: child.material.color,
        map: child.material.map,
        // Другие свойства материала, которые вы хотите сохранить
      });
    }
  }
});




partsDropdown = document.getElementById('partsDropdown');

// Очистка списка перед добавлением новых элементов
partsDropdown.innerHTML = '';

// Проход по всем частям модели
model.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    // Добавление каждой части в список
    const option = document.createElement('option');
    option.text = child.name; // Имя части модели
    partsDropdown.add(option);
  }
});

  // Вывести информацию о материалах в консоль
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      console.log(child.material); // Проверьте консоль после загрузки модели
    }
  });

  
}

function handleModelTextures(model) {
  const textures = [];
  gatherTextures(model, textures);

  const textureLoader = new THREE.TextureLoader();
  textures.forEach((textureUrl) => {
    try {
      const texture = textureLoader.load(textureUrl);
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    } catch (error) {
      console.error('Ошибка при загрузке текстуры:', error);
    }
  });
}
function gatherTextures(object, textures) {
  if (object instanceof THREE.Mesh) {
    const material = object.material;

    if (material instanceof THREE.MeshStandardMaterial) {
      if (material.map) {
        textures.push(material.map);
      }
    }
  }

  if (object.children) {
    object.children.forEach((child) => {
      gatherTextures(child, textures);
    });
  }
}

function animate() {

  let isDragging = false;

   
    const dragControls = new DragControls(lights, camera, renderer.domElement);
    dragControls.addEventListener('dragstart', () => {
      isDragging = true;
    }, { passive: false });
  
    dragControls.addEventListener('dragend', () => {
      isDragging = false;
    }, { passive: true });
  

  // Удаляем предыдущий слушатель touchstart
  document.body.removeEventListener('touchstart', handleTouchStart);
  // И добавляем новый
  document.body.addEventListener('touchstart', handleTouchStart, { passive: false });

  // Удаляем предыдущий слушатель touchmove
  document.body.removeEventListener('touchmove', handleTouchMove);
  // И добавляем новый
  document.body.addEventListener('touchmove', handleTouchMove, { passive: false });

  function handleTouchStart(event) {
    if (isDragging) {
      event.preventDefault();
    }
  }

  function handleTouchMove(event) {
    if (isDragging) {
      event.preventDefault();
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    if (controls && typeof controls.update === 'function') {
      controls.update();
    }
    renderer.render(scene, camera);
  }

  animate();
}
lights = setupLights(scene, camera, renderer, viewerWidth, viewerHeight);

let isBackgroundEnabled = true;

// Получаем кнопку по ее идентификатору
const toggleBackgroundButton = document.getElementById('toggleBackgroundButton');

// Добавляем слушатель события клика на кнопку
toggleBackgroundButton.addEventListener('click', () => {
  toggleBackground();
});




// Функция включения/выключения фона

function toggleBackground() {
  isBackgroundEnabled = !isBackgroundEnabled;

  if (isBackgroundEnabled) {
    // Если фон включен, устанавливаем текстуру фона
    scene.background = backgroundTexture;
  } else {
    // Если фон выключен, устанавливаем прозрачный фон
    scene.background = null;
  }
}
document.getElementById('baseColor').addEventListener('input', () => {
  const selectedPartName = partsDropdown.value;
  const selectedPart = loadedModel.getObjectByName(selectedPartName);
  materialFunctions.updateBaseColor(selectedPart);
});

document.getElementById('baseColorIntensity').addEventListener('input', () => {
  const selectedPartName = partsDropdown.value;
  const selectedPart = loadedModel.getObjectByName(selectedPartName);
  materialFunctions.updateBaseColorIntensity(selectedPart);
});

document.getElementById('metalnessMap').addEventListener('change', () => {
  const selectedPartName = partsDropdown.value;
  const selectedPart = loadedModel.getObjectByName(selectedPartName);
  materialFunctions.updateMetalnessMap(selectedPart);
});

document.getElementById('metalnessIntensity').addEventListener('input', () => {
  const selectedPartName = partsDropdown.value;
  const selectedPart = loadedModel.getObjectByName(selectedPartName);
  materialFunctions.updateMetalnessIntensity(selectedPart);
});

document.getElementById('roughnessIntensity').addEventListener('input', () => {
  const selectedPartName = partsDropdown.value;
  const selectedPart = loadedModel.getObjectByName(selectedPartName);
  materialFunctions.updateRoughnessIntensity(selectedPart);
});

document.getElementById('specularIntensity').addEventListener('input', () => {
  const selectedPartName = partsDropdown.value;
  const selectedPart = loadedModel.getObjectByName(selectedPartName);
  materialFunctions.updateSpecularIntensity(selectedPart);
});

document.getElementById('reflectionIntensity').addEventListener('input', () => {
  const selectedPartName = partsDropdown.value;
  const selectedPart = loadedModel.getObjectByName(selectedPartName);
  materialFunctions.updateReflectionIntensity(selectedPart);
});

document.getElementById('opacity').addEventListener('input', () => {
  const selectedPartName = partsDropdown.value;
  const selectedPart = loadedModel.getObjectByName(selectedPartName);
  materialFunctions.updateOpacity(selectedPart);
});

document.getElementById('occlusionIntensity').addEventListener('input', () => {
  const selectedPartName = partsDropdown.value;
  const selectedPart = loadedModel.getObjectByName(selectedPartName);
  materialFunctions.updateOcclusionIntensity(selectedPart);
});

document.getElementById('emissionIntensity').addEventListener('input', () => {
  const selectedPartName = partsDropdown.value;
  const selectedPart = loadedModel.getObjectByName(selectedPartName);
  materialFunctions.updateEmissionIntensity(selectedPart);
});
function enableDisableBaseColorMap() {
  materialFunctions.updateBaseColorMap(cube, baseColorMapTexture, !material.map);
}


function handleMetalnessMapChange(event) {
  const metalnessMapFile = event.target.files[0];
  if (metalnessMapFile) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
          URL.createObjectURL(metalnessMapFile),
          (texture) => {
              console.log('Metalness map loaded successfully');
              const selectedParts = determineSelectedParts(); // Получаем выбранные части модели
              updateMetalnessMap(texture, selectedParts); // Передаем текстуру и выбранные части для обновления
              
              metalnessMapInput.value = '';
          },
          (xhr) => {
              console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
          },
          (error) => {
              console.error('Error loading metalness map:', error);
          }
      );
  }
}

const metalnessMapInput = document.getElementById('metalnessMap');
metalnessMapInput.addEventListener('change', handleMetalnessMapChange);



import { updateMetalnessMap } from './materialFunctions.js';
import { updateRoughnessMap } from './materialFunctions.js';
import { updateBaseColorMap } from './materialFunctions.js';

import { updateNormalMap } from './materialFunctions.js';

function handleRoughnessMapChange(event) {
  console.log('Roughness map input changed');
  const roughnessMapFile = event.target.files[0];
  if (roughnessMapFile) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
          URL.createObjectURL(roughnessMapFile),
          (texture) => {
              console.log('Roughness map loaded successfully');
              // Получите выбранные части модели
              const selectedParts = determineSelectedParts(); // Предположим, что у вас есть функция для этого
              // Передаем только выбранные части модели для обновления
              updateRoughnessMap(texture, selectedParts);
              
              roughnessMapInput.value = '';
          },
          (xhr) => {
              console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
          },
          (error) => {
              console.error('Error loading roughness map:', error);
          }
      );
  }
}

const roughnessMapInput = document.getElementById('roughnessMap');
roughnessMapInput.addEventListener('change', handleRoughnessMapChange);


function handleBaseColorMapChange(event) {
  console.log('Base color map input changed');
  const baseColorMapFile = event.target.files[0];
  if (baseColorMapFile) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
          URL.createObjectURL(baseColorMapFile),
          (texture) => {
              // Обновляем текстуру базового цвета сразу после загрузки
              const selectedParts = determineSelectedParts();
              updateBaseColorMap(texture, selectedParts);

              // Очищаем значение поля ввода файла
              baseColorMapInput.value = '';
          },
          (xhr) => {
              console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
          },
          (error) => {
              console.error('Error loading base color map:', error);
          }
      );
  }
}

// Добавляем слушатель события изменения текстуры базового цвета
const baseColorMapInput = document.getElementById('baseColorMap');
baseColorMapInput.addEventListener('change', handleBaseColorMapChange);


function determineSelectedParts() {
  const selectedParts = [];
  const partsDropdown = document.getElementById('partsDropdown');
  const selectedPartNames = Array.from(partsDropdown.selectedOptions, option => option.value);
  selectedPartNames.forEach(partName => {
      const selectedPart = loadedModel.getObjectByName(partName);
      if (selectedPart) {
          selectedParts.push(selectedPart);
      }
  });
  return selectedParts;
}

function handleNormalMapChange(event) {
  console.log('Normal map input changed');
  const normalMapFile = event.target.files[0];
  if (normalMapFile) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
          URL.createObjectURL(normalMapFile),
          (texture) => {
              console.log('Normal map loaded successfully');
              const selectedParts = determineSelectedParts(); // Получаем выбранные части модели
              updateNormalMap(texture, selectedParts); // Применяем Normal Map к выбранным частям модели
              
              // Очищаем значение поля ввода файла
              normalMapInput.value = '';
          },
          (xhr) => {
              console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
          },
          (error) => {
              console.error('Error loading normal map:', error);
          }
      );
  }
}

// Добавляем слушатель события изменения текстуры Normal Map
const normalMapInput = document.getElementById('normalMapInput');
normalMapInput.addEventListener('change', handleNormalMapChange);

import * as background from './background.js';

// Обработчик события выбора цвета фона
function handleBackgroundColorChange(color) {
    background.changeSceneBackground(color);
}

// Обработчик события выбора окружения
function handleEnvironmentChange(texture) {
    background.changeEnvironment(texture);
}

// Обработчик события выключения фона
function handleBackgroundDisable() {
    background.disableBackground();
}

// Пример использования обработчиков событий
document.getElementById('selectBackgroundColor').addEventListener('change', (event) => {
    const color = event.target.value;
    handleBackgroundColorChange(color);
});

document.getElementById('selectEnvironment').addEventListener('change', (event) => {
    const texture = event.target.value; // Здесь предполагается, что значение содержит путь к текстуре
    handleEnvironmentChange(texture);
});

document.getElementById('disableBackground').addEventListener('click', () => {
    handleBackgroundDisable();
});


window.toggleWireframe = function() {
  const wireframeCheckbox = document.getElementById('wireframeCheckbox');
  const checked = wireframeCheckbox.checked;

  // Применяем контурную сетку ко всем объектам сцены
  scene.traverse((object) => {
      if (object.isMesh) {
          object.material.wireframe = checked;
      }
  });
}

document.getElementById('opacityMapInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function() {
        const opacityMap = reader.result;
        updateOpacityMap(opacityMap); // Вызов функции обновления текстуры прозрачности
    };
    reader.readAsDataURL(file);
});

// Аналогичные обработчики для других текстур
document.getElementById('emissionMapInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function() {
        const emissionMap = reader.result;
        updateEmissionMap(emissionMap); // Вызов функции обновления текстуры свечения
    };
    reader.readAsDataURL(file);
});

document.getElementById('occlusionMapInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function() {
        const occlusionMap = reader.result;
        updateAmbientOcclusionMap(occlusionMap); // Вызов функции обновления текстуры омрачения окружающей среды
    };
    reader.readAsDataURL(file);
});

document.getElementById('specularMapInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function() {
        const specularMap = reader.result;
        updateSpecularMap(specularMap); // Вызов функции обновления текстуры бликов
    };
    reader.readAsDataURL(file);
});
function handleOpacityMapChange(event) {
  const opacityMapFile = event.target.files[0];
  if (opacityMapFile) {
    // Обработка загрузки текстуры прозрачности и применение её к модели
    // Например, используя функцию updateOpacityMap из materialFunctions.js
  }
}

function handleEmissionMapChange(event) {
  const emissionMapFile = event.target.files[0];
  if (emissionMapFile) {
    // Обработка загрузки текстуры свечения и применение её к модели
  }
}

function handleAmbientOcclusionMapChange(event) {
  const occlusionMapFile = event.target.files[0];
  if (occlusionMapFile) {
    // Обработка загрузки текстуры омрачения окружающей среды и применение её к модели
  }
}

function handleSpecularMapChange(event) {
  const specularMapFile = event.target.files[0];
  if (specularMapFile) {
    // Обработка загрузки текстуры бликов и применение её к модели
  }
}


const addLightButton = document.getElementById('addLightButton');

// Функция для обработки клика на кнопку добавления света
const handleAddLightClick = () => {
  console.log('Клик на кнопку добавления света');
  // Вызов функции addLight при клике на кнопку
  addLight(scene, lights, camera, renderer, viewerWidth, viewerHeight);
};

