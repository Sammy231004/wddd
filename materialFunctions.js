// materialFunctions.js
import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js';

export function updateBaseColor(selectedPart) {
    const baseColorValue = new THREE.Color(document.getElementById('baseColor').value);
    if (selectedPart) {
        selectedPart.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => {
                        if ('color' in material) {
                            material.color.copy(baseColorValue);
                        }
                    });
                } else if ('color' in object.material) {
                    object.material.color.copy(baseColorValue);
                }
            }
        });
    } else {
        // Обработка случая, когда не выбрана часть модели
    }
}

export function updateBaseColorIntensity(selectedPart) {
    const baseColorValue = new THREE.Color(document.getElementById('baseColor').value);
    const baseColorIntensityValue = document.getElementById('baseColorIntensity').value;
    const intensityFactor = parseFloat(baseColorIntensityValue);

    if (selectedPart) {
        selectedPart.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => {
                        if ('color' in material) {
                            const newColor = new THREE.Color(baseColorValue).multiplyScalar(intensityFactor);
                            material.color.copy(newColor);
                        }
                    });
                } else if ('color' in object.material) {
                    const newColor = new THREE.Color(baseColorValue).multiplyScalar(intensityFactor);
                    object.material.color.copy(newColor);
                }
            }
        });
    } else {
        // Обработка случая, когда не выбрана часть модели
    }
}

export function updateMetalnessIntensity(selectedPart) {
    const metalnessIntensityValue = document.getElementById('metalnessIntensity').value;
    const intensityFactor = parseFloat(metalnessIntensityValue);

    if (selectedPart) {
        selectedPart.traverse((object) => {
            if (object.isMesh) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => {
                        applyMetalness(material, intensityFactor);
                    });
                } else {
                    applyMetalness(object.material, intensityFactor);
                }
            }
        });
    } else {
        // Обработка случая, когда не выбрана часть модели
    }
}

function applyMetalness(material, intensity) {
    if (material && 'metalness' in material) {
        const originalEmissive = material.emissive.clone();
        material.metalness = intensity;
        const adjustedEmissive = originalEmissive.multiplyScalar(1 - intensity);
        material.emissive.copy(adjustedEmissive);
        material.needsUpdate = true;
    }
}

// Функция для обновления текстуры металличности для указанных частей модели
export function updateMetalnessMap(texture, selectedParts) {
    try {
        // Проверяем, что выбранные части модели определены
        if (!Array.isArray(selectedParts)) {
            selectedParts = [selectedParts]; // Преобразуем в массив, если не является
        }
        
        // Проходим по каждой выбранной части модели
       // Проходим по каждой выбранной части модели
selectedParts.forEach((selectedPart) => {
    // Проверяем, что объект является действительным объектом
    if (selectedPart) {
        // Проходим по всем объектам в выбранной части
        selectedPart.traverse((object) => {
            // Проверяем, что объект является Mesh
            if (object instanceof THREE.Mesh) {
                // Получаем материал объекта
                const material = object.material;
                // Проверяем, поддерживает ли материал metalnessMap
                if ('metalnessMap' in material) {
                    // Устанавливаем текстуру и металличность
                    material.metalnessMap = texture;
                    material.metalness = 1;
                }
            }
        });
    }
});

    } catch (error) {
        // Обрабатываем ошибку
        console.error(error.message);
        // Здесь вы можете выполнить дополнительные действия в случае ошибки,
        // например, уведомить пользователя через интерфейс приложения
    }
}





export function updateRoughnessIntensity(selectedPart) {
    const roughnessIntensityValue = document.getElementById('roughnessIntensity').value;
    const intensityFactor = parseFloat(roughnessIntensityValue);
   

    if (selectedPart) {
        selectedPart.traverse((object) => {
            if (object.isMesh) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => {
                        applyRoughness(material, intensityFactor);
                    });
                } else {
                    applyRoughness(object.material, intensityFactor);
                }
            }
        });

        console.log('Roughness intensity updated successfully');
    } else {
        console.error('No selected part to update roughness intensity');
    }
}

function applyRoughness(material, intensity) {
    if (material && 'roughness' in material) {
        material.roughness = intensity;
        material.needsUpdate = true;
    }
}

export function updateSpecularIntensity(selectedPart) {
    const specularIntensityValue = document.getElementById('specularIntensity').value;
    const intensityFactor = parseFloat(specularIntensityValue);

    if (selectedPart) {
        selectedPart.traverse((object) => {
            if (object.isMesh) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => {
                        applySpecularIntensity(material, intensityFactor);
                    });
                } else {
                    applySpecularIntensity(object.material, intensityFactor);
                }
            }
        });
        console.log('Specular intensity updated successfully');
    } else {
        console.error('No selected part to update specular intensity');
    }
}

function applySpecularIntensity(material, intensity) {
    if (material) {
        if ('specular' in material) {
            material.specular.setScalar(intensity);
        } else if ('specularIntensity' in material) {
            material.specularIntensity = intensity;
        }

        if (Array.isArray(material.materials)) {
            material.materials.forEach((subMaterial) => {
                applySpecularIntensity(subMaterial, intensity);
            });
        }
        material.needsUpdate = true;
    }
}

export function updateReflectionIntensity(selectedPart) {
    const reflectionIntensityValue = document.getElementById('reflectionIntensity').value;
    const intensityFactor = parseFloat(reflectionIntensityValue);

    if (selectedPart) {
        selectedPart.traverse((object) => {
            if (object.isMesh && object.material instanceof THREE.MeshStandardMaterial) {
                applyReflectionIntensity(object.material, intensityFactor);
            }
        });

        console.log('Reflection intensity updated successfully');
    } else {
        console.error('No selected part to update reflection intensity');
    }
}

function applyReflectionIntensity(material, intensity) {
    if (material) {
        if ('envMap' in material) {
            material.envMapIntensity = intensity;
        }

        material.needsUpdate = true;
    }
}

export function updateOpacity(selectedPart) {
    const opacityValue = parseFloat(document.getElementById('opacity').value);

    if (selectedPart) {
        selectedPart.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => {
                        applyOpacity(material, opacityValue);
                    });
                } else {
                    applyOpacity(object.material, opacityValue);
                }
            }
        });
    } else {
        console.error('No selected part to update opacity');
    }
}

function applyOpacity(material, opacity) {
    if (material) {
        material.opacity = opacity;
        material.transparent = opacity < 1;
        material.needsUpdate = true;
    }
}

export function updateOcclusionIntensity(selectedPart) {
    const occlusionIntensityValue = document.getElementById('occlusionIntensity').value;
    const intensityFactor = parseFloat(occlusionIntensityValue);

    if (selectedPart) {
        selectedPart.traverse((object) => {
            if (object.isMesh) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => {
                        applyOcclusionIntensity(material, intensityFactor);
                    });
                } else {
                    applyOcclusionIntensity(object.material, intensityFactor);
                }
            }
        });

        console.log('Occlusion intensity updated successfully');
    } else {
        console.error('No selected part to update occlusion intensity');
    }
}

function applyOcclusionIntensity(material, intensity) {
    if (material && 'occlusionMap' in material) {
        material.occlusionMapIntensity = intensity;
        material.needsUpdate = true;
    }
}

export function updateEmissionIntensity(selectedPart) {
    const emissionIntensityValue = document.getElementById('emissionIntensity').value;
    const intensityFactor = parseFloat(emissionIntensityValue);

    if (selectedPart) {
        selectedPart.traverse((object) => {
            if (object.isMesh) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => {
                        applyEmissionIntensity(material, intensityFactor);
                    });
                } else {
                    applyEmissionIntensity(object.material, intensityFactor);
                }
            }
        });

        console.log('Emission intensity updated successfully');
    } else {
        console.error('No selected part to update emission intensity');
    }
}

function applyEmissionIntensity(material, intensity) {
    if (material && 'emissive' in material) {
        material.emissiveIntensity = intensity;
        material.needsUpdate = true;
    }
}

export function updateRoughnessMap(texture, selectedParts) {
    try {
        if (!Array.isArray(selectedParts)) {
            selectedParts = [selectedParts];
        }
        
        selectedParts.forEach((selectedPart) => {
            selectedPart.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    const material = object.material;
                    if ('roughnessMap' in material) {
                        material.roughnessMap = texture;
                        material.roughness = 1;
                    }
                }
            });
        });
    } catch (error) {
        console.error(error.message);
    }
}

// В materialFunctions.js

export function updateBaseColorMap(texture, selectedParts) {
    try {
        if (!Array.isArray(selectedParts)) {
            selectedParts = [selectedParts];
        }
        
        selectedParts.forEach((selectedPart) => {
            selectedPart.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    const material = object.material;
                    // Применяем текстуру цвета независимо от наличия metalnessMap
                    if ('map' in material) {
                        material.map = texture;
                        material.needsUpdate = true;
                        material.map.needsUpdate = true; // Добавляем явное обновление текстуры
                    }
                }
            });
        });
    } catch (error) {
        console.error(error.message);
    }
}

export function updateNormalMap(texture, selectedParts) {
    try {
        if (!Array.isArray(selectedParts)) {
            selectedParts = [selectedParts];
        }
        
        selectedParts.forEach((selectedPart) => {
            selectedPart.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    const material = object.material;
                    if ('normalMap' in material) {
                        material.normalMap = texture;
                        material.normalScale.set(1, 1); // Настройте масштабирование нормалей по вашему выбору
                    }
                }
            });
        });
    } catch (error) {
        console.error(error.message);
    }
}

// Функция для обновления текстуры прозрачности
function updateOpacityMap(opacityMap) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(opacityMap, function(texture) {
        // Применение текстуры прозрачности к модели
        // Например, если ваша модель хранится в переменной model, то можно сделать так:
        model.material.transparent = true;
        model.material.opacityMap = texture;
        model.material.needsUpdate = true;
    });
}

// Функция для обновления текстуры свечения
function updateEmissionMap(emissionMap) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(emissionMap, function(texture) {
        // Применение текстуры свечения к модели
        // Например:
        model.material.emissiveMap = texture;
        model.material.emissive = new THREE.Color(0xffffff); // Цвет свечения
        model.material.needsUpdate = true;
    });
}

// Функция для обновления текстуры омрачения окружающей среды
function updateAmbientOcclusionMap(occlusionMap) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(occlusionMap, function(texture) {
        // Применение текстуры омрачения окружающей среды к модели
        // Например:
        model.material.aoMap = texture;
        model.material.needsUpdate = true;
    });
    
}

// Функция для обновления текстуры бликов
function updateSpecularMap(specularMap) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(specularMap, function(texture) {
        // Применение текстуры бликов к модели
        // Например:
        model.material.specularMap = texture;
        model.material.needsUpdate = true;
    });
}




export default {
    updateBaseColor,
    updateBaseColorIntensity,
    updateMetalnessMap,
    updateMetalnessIntensity,
    updateRoughnessIntensity,
    updateSpecularIntensity,
    updateReflectionIntensity,
    updateOpacity,
    updateOcclusionIntensity,
    updateEmissionIntensity,
};
