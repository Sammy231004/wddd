// settings-menu.js

import * as dat from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/libs/dat.gui.module.js';

const gui = new dat.GUI({ autoPlace: false });

const modelSettings = {
  normalMap: false,
  baseColor: [255, 255, 255], // Using array for RGB color
  roughness: 1,
  metalness: 1,
  specular: 1.0,
  reflection: 1.0,
  opacity: 1.0,
  occlusion: 1.0,
  emission: [0, 0, 0], // Using array for RGB color
};

const settingsFolder = gui.addFolder('Material Settings');
settingsFolder.add(modelSettings, 'normalMap').name('Normal Map');
settingsFolder.addColor(modelSettings, 'baseColor').name('Base Color');
settingsFolder.add(modelSettings, 'roughness', 0, 1).name('Roughness');
settingsFolder.add(modelSettings, 'metalness', 0, 1).name('Metalness');
settingsFolder.add(modelSettings, 'specular', 0, 1).name('Specular');
settingsFolder.add(modelSettings, 'reflection', 0, 1).name('Reflection');
settingsFolder.add(modelSettings, 'opacity', 0, 1).name('Opacity');
settingsFolder.add(modelSettings, 'occlusion', 0, 1).name('Occlusion');
settingsFolder.addColor(modelSettings, 'emission').name('Emission');

// Получаем DOM-элемент для контейнера
const datContainer = document.getElementById('dat-container');

// Помещаем меню в контейнер
datContainer.appendChild(gui.domElement);

export { modelSettings };
