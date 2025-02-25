let formActive = true;

const formService = document.getElementById('form-service');
const formPhoneInput = formService.phone;
const elRoot = document.getElementById('root');
const invalidFields = new Set();
const fieldsPTBR = {
  name: 'Preencha seu nome',
  phone: 'Preencha seu telefone',
  email: 'Preencha um e-mail valido',
  branch: 'Preencha ramo da empresa',
};

function sanatizeInput(input) {
  return input.replace(/<[^>]*>?/gm, '').trim();
}

function renderModalEmailMessage(elParent, message) {
  const modal = document.createElement('div');
  const overlay = document.createElement('div');
  const titleAppreciate = document.createElement('h2');
  const detailParagraph = document.createElement('p');

  function setTextAndClass({ element, text, className }) {
    element.innerText = text;
    element.classList.add(className);
  }

  setTextAndClass({
    element: titleAppreciate,
    text: 'Obrigado pelo contato!',
    className: 'modal-title',
  });

  setTextAndClass({
    element: detailParagraph,
    text: message,
    className: 'modal-text',
  });

  modal.id = 'modal';
  overlay.id = 'overlay';

  modal.append(titleAppreciate, detailParagraph);

  overlay.appendChild(modal);
  elParent.insertAdjacentElement('afterend', overlay);
  document.body.classList.add('no-scroll');

  setTimeout(() => {
    overlay.classList.add('hide');
  }, 2000);

  setTimeout(() => {
    document.body.classList.remove('no-scroll');
    overlay.remove();
    formService.reset();
    formService['btn-send-service'].disabled = true;
  }, 3000);
}

async function sendFormService(formData) {
  try {
    const response = await fetch('formService.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const responseJSON = await response.json();

    if (response.ok && responseJSON.success) {
      renderModalEmailMessage(elRoot, 'Entraremos em contato assim que possível! 😉');
    } else {
      renderModalEmailMessage(
        elRoot,
        'Ocorreu um erro ao enviar o email. Tente novamente mais tarde! 😥'
      );
    }
  } catch (error) {
    renderModalEmailMessage(elRoot, '❌ Ocorreu um erro, tente mais tarde. Obrigado!');
  }
}

if (formActive) {
  if (formService) {
    formService.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(formService);

      for (let [key, value] of formData.entries()) {
        const inputSanitized = sanatizeInput(value);

        if (!inputSanitized) {
          invalidFields.add(key);
        }
      }

      if (invalidFields.size > 0) {
        invalidFields.forEach((field) => {
          const input = document.getElementById(field);
          const errorMessageElement = input.nextElementSibling;
          const newP = document.createElement('p');

          if (!errorMessageElement) {
            newP.classList.add('invalid');
            newP.innerText = fieldsPTBR[field];
            input.insertAdjacentElement('afterend', newP);

            input.addEventListener('input', () => {
              if (input.nextElementSibling) {
                input.nextElementSibling.remove();
              }
            });
          }
        });

        invalidFields.clear();
      } else {
        sendFormService(formData);
      }
    });
  }

  formPhoneInput?.addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/\D+/, '');
  });
} else {
  if (formService) {
    formService.addEventListener('submit', (event) => {
      event.preventDefault();
      renderModalEmailMessage(
        elRoot,
        'Infelizmente o formulário está desativado temporariamente, tente novamente mais tarde! 😉'
      );
    });
  }
}
