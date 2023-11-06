'use strict';

const limparFormulario = () => {
    document.getElementById('endereco').value = '';
    document.getElementById('bairro').value = '';
    document.getElementById('cidade').value = '';
    document.getElementById('estado').value = '';
};

const preencherFormulario = (endereco) => {
    document.getElementById('endereco').value = endereco.logradouro;
    document.getElementById('bairro').value = endereco.bairro;
    document.getElementById('cidade').value = endereco.localidade;
    document.getElementById('estado').value = endereco.uf;
};

const cepValido = (cep) => cep.length === 8;

const pesquisarCep = async () => {
    limparFormulario();

    const cep = document.getElementById('cep').value;
    const mensagem = document.querySelector('.mensagem');
    const url = `https://viacep.com.br/ws/${cep}/json/`;

    if (cepValido(cep)) {
        try {
            const dados = await fetch(url);
            const endereco = await dados.json();
            if (endereco.hasOwnProperty('erro')) {
                mensagem.textContent = 'CEP não encontrado!';
            } else {
                preencherFormulario(endereco);
                mensagem.textContent = '';
            }
        } catch (error) {
            mensagem.textContent = 'Erro ao buscar o CEP. Por favor, tente novamente mais tarde.';
        }
    } else {
        mensagem.textContent = 'CEP incorreto!';
    }

    if (cep === "") {
        mensagem.textContent = '';
    }
};

document.getElementById('cep').addEventListener('focusout', pesquisarCep);


const validarCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos

  if (cpf.length !== 11 || /^(.)\1+$/.test(cpf)) {
      // Verifica se o CPF tem 11 dígitos e não é uma sequência de números iguais
      return false;
  }

  // Calcula o primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) {
      resto = 0;
  }
  if (resto !== parseInt(cpf.charAt(9))) {
      return false;
  }

  // Calcula o segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) {
      resto = 0;
  }
  if (resto !== parseInt(cpf.charAt(10))) {
      return false;
  }

  return true; // CPF válido
};

const exibirMensagemDeErro = (mensagem, campo) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = mensagem;
    const campoInput = document.getElementById(campo);
    campoInput.parentNode.appendChild(errorDiv);
};

const removerMensagensDeErro = () => {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach((errorMessage) => {
        errorMessage.remove();
    });
};

class FormSubmit {
    constructor(settings) {
        this.settings = settings;
        this.form = document.querySelector(settings.form);
        this.formButton = document.querySelector(settings.button);
        if (this.form) {
            this.url = this.form.getAttribute("action");
        }
        this.sendForm = this.sendForm.bind(this);
    }

    async sendForm(event) {
        try {
            removerMensagensDeErro();

            const camposObrigatorios = ["nome", "cpf", "idade", "aniversario", "sexo", "email", "cep", "endereco", "bairro", "numero", "cidade", "estado", "mensagem"];
            let hasErrors = false;

            camposObrigatorios.forEach((campo) => {
                const campoInput = document.getElementById(campo);
                if (campoInput.value.trim() === "") {
                    exibirMensagemDeErro(`Por favor, preencha o campo ${campo}.`, campo);
                    hasErrors = true;
                }
            });

            const cpfInput = document.getElementById("cpf");
            const cpfValue = cpfInput.value;
            if (!validarCPF(cpfValue)) {
                exibirMensagemDeErro("CPF inválido. Por favor, insira um CPF válido.", "cpf");
                hasErrors = true;
            }

            if (hasErrors) {
                event.preventDefault();
            } else {
                const response = await fetch(this.url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(this.getFormObject()),
                });

                if (response.ok) {
                    const successDiv = document.createElement('div');
                    successDiv.className = 'success-message';
                    successDiv.textContent = 'Mensagem enviada!';
                    this.form.appendChild(successDiv);
                } else {
                    exibirMensagemDeErro("Não foi possível enviar sua mensagem. Por favor, tente novamente mais tarde.", "mensagem");
                    event.preventDefault();
                }
            }
        } catch (error) {
            console.log('Erro:', error);
        }
    }

    getFormObject() {
        const formObject = {};
        const fields = this.form.querySelectorAll("[name]");
        fields.forEach((field) => {
            formObject[field.getAttribute("name")] = field.value;
        });
        return formObject;
    }

    init() {
        if (this.form) this.form.addEventListener("submit", this.sendForm);
        return this;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const formSubmit = new FormSubmit({
        form: "[data-form]",
        button: "[data-button]",
    });

    formSubmit.init();
});
