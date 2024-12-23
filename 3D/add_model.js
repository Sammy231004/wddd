document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    uploadForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const formData = new FormData(uploadForm);
      const modelFile = formData.get('modelFile');
      const backgroundImageFile = formData.get('backgroundImage');
  
      if (modelFile && backgroundImageFile) {
        await uploadModel(modelFile, backgroundImageFile);
      }
    });
  
    const uploadModel = async (modelFile, backgroundImageFile) => {
      const modelFormData = new FormData();
      modelFormData.append('modelFile', modelFile);
      modelFormData.append('backgroundImage', backgroundImageFile);
  
      try {
        const response = await fetch('/upload', {
          method: 'POST',
          body: modelFormData,
        });
  
        if (response.ok) {
          alert('Модель успешно загружена!');
          // Перенаправляем пользователя на страницу просмотра списка моделей
          window.location.href = 'view_models.html';
        } else {
          alert('Ошибка загрузки модели. Пожалуйста, попробуйте ещё раз.');
        }
      } catch (error) {
        console.error('Ошибка:', error);
      }
    };
  });
  