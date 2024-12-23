// Функция для изменения фона сцены
export function changeSceneBackground(color) {
    scene.background = new THREE.Color(color);
}

// Функция для изменения окружения
export function changeEnvironment(texture) {
    scene.environment = texture;
}

// Функция для отключения фона
export function disableBackground() {
    scene.background = null;
}
