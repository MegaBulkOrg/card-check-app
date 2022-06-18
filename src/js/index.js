import 'babel-polyfill';
import '@styles/style';
const create = require('dom-create-element');
import * as $ from 'jquery';
import 'jquery-mask-plugin';
import CardInfo from 'card-info';
const app = document.querySelector('.app');
const card = create({
    selector: 'div',
    styles: 'card',
})
let cardEl = document.querySelector('.card');
if (cardEl === null) app.append(card);
const bankLogoWrap = create({
  selector: 'div',
  styles: 'bank-logo-wrap'
});
card.append(bankLogoWrap);
const form = create({
    selector: 'form',
    attr: {
        action: '#',
        method: 'POST',
        autocomplete: 'on'
    },
});
card.append(form);
const cardNumberInputWrap = create({
  selector: 'div',
  styles: 'card-number-input-wrap'
});
const cardNumberInput = create({
    selector: 'input',
    styles: 'form-control',
    attr: {
        name: 'card-number',
        placeholder: 'Номер карты'
    }
});
cardNumberInputWrap.append(cardNumberInput);
form.append(cardNumberInputWrap);
const inputsGroup = create({
    selector: 'div',
    styles: 'row mt-1'
});
const leftInput = create({
    selector: 'div',
    styles: 'col',
    children: create({
        selector: 'input',
        styles: 'form-control',
        attr: {
            name: 'date-before',
            placeholder: 'ММ/ГГ'
        }
    })
});
inputsGroup.append(leftInput);
const rightInput = create({
    selector: 'div',
    styles: 'col',
    children: create({
        selector: 'input',
        styles: 'form-control',
        attr: {
            name: 'card-code',
            placeholder: 'CVV'
        }
    })
});
inputsGroup.append(rightInput);
form.append(inputsGroup);
const emailInputWrap = create({
  selector: 'div',
  styles: 'email-input-wrap'
});
const emailInput = create({
    selector: 'input',
    styles: 'form-control mt-1 email',
    attr: {
        name: 'email',
        placeholder: 'E-mail'
    }
});
emailInputWrap.append(emailInput);
form.append(emailInputWrap);
const elementsGroup = create({selector:'div',styles:'d-flex justify-content-between align-items-start mt-1 elements-group'})
form.append(elementsGroup);
const submitBtn = create({
    selector: 'button',
    type: 'submit',
    styles: 'btn btn-primary',
    html: 'Оплатить',
});
submitBtn.disabled = true;
elementsGroup.append(submitBtn);
const dateBeforeInput = document.querySelector('[name="date-before"]');
const codeInput = document.querySelector('[name="card-code"]');
cardNumberInput.addEventListener('input', function() {
    let card = new CardInfo(this.value)
    $('input[name="card-number"]').mask(card.numberMask)
    if (card.codeName) codeInput.placeholder = card.codeName
})
$('input[name="date-before"]').mask('00/00')
$('input[name="card-code"]').mask('000')
document.querySelectorAll('input').forEach(field => {
    field.after(create({selector:'div',styles:`invalid-feedback ${field.name}-error`}));
})
function showError(field, msg) {
    field.classList.add('is-invalid');
    document.querySelector(`.${field.name}-error`).textContent = msg;
}
function hideError(field) {
    field.classList.remove('is-invalid');
    document.querySelector(`.${field.name}-error`).textContent = '';
}
function validate(value, fieldName) {
    if (!value) {
        throw new Error('Это обязательное поле');
    }
    if (fieldName === 'card-number') {
        let cardInfo = new CardInfo(value),
            paymentSystem = cardInfo.brandName,
            bank = cardInfo.bankName;
        if (paymentSystem === null && bank === null) {
            throw new Error('Вы ввели неправильный номер карты');
        } else {
            card.style.background = cardInfo.backgroundGradient;
            document.querySelectorAll('.invalid-feedback').forEach(errorField => {
                errorField.style.color = cardInfo.textColor;
            })
            let bankLogoEl = document.querySelector('.bank-logo');
            if (bank != null) {
                let bankLogoName = cardInfo.bankLogo.split('/');
                if (bankLogoEl === null) {
                        const bankLogo = create({selector:'img',styles:'mb-4 bank-logo',src:`assets/imgs/banks-logos/${bankLogoName[bankLogoName.length-1]}`,attr:{height:40}});
                        bankLogoWrap.append(bankLogo);
                } else {
                    bankLogoEl.src = `assets/imgs/banks-logos/${bankLogoName[bankLogoName.length-1]}`
                }
            }
            if (paymentSystem != null) {
                let psLogoEl = document.querySelector('.ps-logo'),
                    paymentLogoName = cardInfo.brandLogo.split('/')
                if (psLogoEl === null) {
                    const psLogo = create({selector:'img',styles:'ps-logo',src:`assets/imgs/brands-logos/${paymentLogoName[paymentLogoName.length-1]}`,attr:{height:40}});
                    elementsGroup.append(psLogo);
                } else {
                    psLogoEl.src = `assets/imgs/brands-logos/${paymentLogoName[paymentLogoName.length-1]}`
                }
            }
            if (bank === null && bankLogoEl) bankLogoEl.remove();
        }
    }
    if (fieldName === 'date-before') {
        const dateBeforeRegExp = /^\d{2}\/\d{2}$/;
        if (!dateBeforeRegExp.test(value)) {
            throw new Error('Неверно заполнено поле');
        }
        let today = new Date(),
            clientMonth = Number(value.substring(0, 2)),
            clientYear = Number(`${String(today.getFullYear()).substring(0, 2)}${value.substring(3)}`);

        if (clientMonth > 12) {
            throw new Error('Неверно указан месяц');
        }
        if (clientYear < today.getFullYear()) {
            throw new Error('Ваша карта просрочена');
        }
        if (clientYear === today.getFullYear() && clientMonth <= today.getMonth()+1) {
            throw new Error('Ваша карта просрочена');
        }
    }
    if (fieldName === 'card-code') {
        const codeRegExp = /^\d{3}$/;
        if (!codeRegExp.test(value)) {
            throw new Error('Должно быть 3 цифры');
        }
    }
    if (fieldName === 'email') {
        const emailRegExp = /^[-\w.]+@([A-z0-9][-A-z0-9]+\.)+[A-z]{2,4}$/;
        if (!emailRegExp.test(value)) {
            throw new Error('Введите правильный e-mail');
        }
    }
}
document.querySelectorAll('input').forEach(field => {
    field.addEventListener('blur',  function() {
        let errors = false,
            errorMsg = null;
        document.querySelectorAll('input').forEach(inputField => {
            try {
                validate(inputField.value, inputField.name);
            } catch(error) {
                errors = true;
                if (inputField === this) errorMsg = error.message;
            }
        });
        if (errors) {
            if (errorMsg != null) showError(this, errorMsg)
            !submitBtn.disabled ? submitBtn.disabled = true : null
        } else {
            submitBtn.disabled ? submitBtn.disabled = false : null
        }
    })
    field.addEventListener('focus',  function() {
        if (field.classList.contains('is-invalid')) {
            hideError(this)
        }
    })
})
form.addEventListener('submit', f => {
    f.preventDefault();
    if(document.querySelector('.payment-msg')) document.querySelector('.payment-msg').remove();
    document.querySelectorAll('input').forEach(input => input.value = '');
    submitBtn.disabled = true;
    const loader = create({selector:'div',styles:'loader'});
    app.after(loader);
    ['primary','secondary','success','danger','warning','info'].forEach(spinnerColor => {
        loader.append(create({selector:'div',styles:`spinner-grow text-${spinnerColor}`,attr:{role:'status'}}));
    })
    setTimeout(_ => {
        loader.remove();
        app.after(create({
            selector:'div',
            styles: 'alert alert-success text-center payment-msg',
            html: '&#10003;&emsp;Оплата прошла успешно'
        }));
        document.querySelector('.bank-logo').remove();
        document.querySelector('.ps-logo').remove();
        card.style.background = 'linear-gradient(135deg, rgb(238, 238, 238), rgb(221, 221, 221))';
        document.querySelectorAll('.invalid-feedback').forEach(errorField => {
            errorField.style.color = '#dc3545';
        })
    }, 2000)
})
function layoutChange() {
    if (window.innerWidth <= 420) inputsGroup.classList.add('flex-column')
    if (window.innerWidth > 420) inputsGroup.classList.remove('flex-column')
}
layoutChange()
window.addEventListener('resize', _ => layoutChange())
if (module.hot) module.hot.accept()
