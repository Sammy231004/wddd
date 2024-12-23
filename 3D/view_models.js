document.addEventListener('DOMContentLoaded', () => {
    const modelContainer = document.getElementById('modelContainer');
  
    fetch('/resources')
      .then(response => response.json())
      .then(models => {
        models.forEach((model, index) => {
          const modelCard = document.createElement('div');
          modelCard.classList.add('modelCard');
          modelCard.innerText = `Модель ${index + 1}`;
  
          modelCard.addEventListener('click', () => {
            window.location.href = `view_model.html?model=${encodeURIComponent(model)}`;
          });
  
          modelContainer.appendChild(modelCard);
        });
      });
  
    const addModelBtn = document.getElementById('addModelBtn');
    addModelBtn.addEventListener('click', () => {
      window.location.href = 'add_model.html';
    });
  });
  