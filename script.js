const display = document.getElementById("display");
const buttons = document.querySelector(".buttons");
const historyList = document.getElementById("history-list");
const clearHistoryButton = document.getElementById("clear-history");
const themeToggle = document.getElementById("theme-toggle");


let currentValue = "0";
let previousValue = null;
let currentOperator = null;
let shouldResetDisplay = false;


// atualiza display

function updateDisplay() {
    display.textContent = currentValue;
}


// adiciona número ao display 

function addNumber(number) {

    // Se acabou de realizar uma operação,
    // começa um novo número
    if (shouldResetDisplay) {
        currentValue = number;
        shouldResetDisplay = false;
        updateDisplay();
        return;
    }

    // Impede números com zeros desnecessários
    if (currentValue === "0" && number !== ".") {
        currentValue = number;
    } else {
        currentValue += number;
    }

    updateDisplay();
}


function addDecimal() {

    if (shouldResetDisplay) {
        currentValue = "0.";
        shouldResetDisplay = false;
        updateDisplay();
        return;
    }

    // Impede dois pontos no mesmo número
    if (!currentValue.includes(".")) {
        currentValue += ".";
    }

    updateDisplay();
}

// escolhe a operação matemática

function chooseOperator(operator) {

    const inputValue = parseFloat(currentValue);

    if (isNaN(inputValue)) {
        return;
    }

    if (previousValue !== null && currentOperator !== null) {

        calculate();

        // IMPORTANTE:
        // depois do calculate(), currentValue
        // contém o resultado da operação anterior.
        previousValue = parseFloat(currentValue);

    } else {

        // Primeira operação
        previousValue = inputValue;
    }

    // Guarda a nova operação
    currentOperator = operator;

    // O próximo número digitado começa do zero
    shouldResetDisplay = true;
}

// realiza o cálculo

function calculate() {

    if (
        previousValue === null ||
        currentOperator === null
    ) {
        return;
    }

    const currentNumber = parseFloat(currentValue);

    if (isNaN(currentNumber)) {
        return;
    }

    let result;

    switch (currentOperator) {

        case "+":
            result = previousValue + currentNumber;
            break;

        case "-":
            result = previousValue - currentNumber;
            break;

        case "*":
            result = previousValue * currentNumber;
            break;

        case "/":

            if (currentNumber === 0) {

                display.textContent = "Erro";

                addToHistory(
                    `${previousValue} / ${currentNumber}`,
                    "Erro"
                );

                resetCalculator();
                return;
            }

            result = previousValue / currentNumber;
            break;

        default:
            return;
    }

    // Evita problemas com números decimais
    result = Number(result.toFixed(10));

    if (!shouldResetDisplay) {

        const expression =
            `${previousValue} ${currentOperator} ${currentNumber}`;

        addToHistory(expression, result);
    }

    currentValue = String(result);

    previousValue = null;
    currentOperator = null;
    shouldResetDisplay = true;

    updateDisplay();
}

//limpar calculadora

function resetCalculator() {

    currentValue = "0";
    previousValue = null;
    currentOperator = null;
    shouldResetDisplay = false;

    updateDisplay();
}

// histórico de cálculos

function addToHistory(expression, result) {

    // Remove mensagem de histórico vazio
    const emptyMessage =
        historyList.querySelector(".empty-msg");

    if (emptyMessage) {
        emptyMessage.remove();
    }

    const item = document.createElement("li");

    item.innerHTML = `
        <span>${expression}</span>
        <strong>= ${result}</strong>
    `;

    historyList.prepend(item);
}

// limpa histórico de cálculos

function clearHistory() {

    historyList.innerHTML = `
        <li class="empty-msg">
            Nenhum cálculo recente
        </li>
    `;
}

buttons.addEventListener("click", function(event) {

    const button = event.target;

    // Ignora elementos que não sejam botões
    if (button.tagName !== "BUTTON") {
        return;
    }

    // Botão numérico
    if (button.dataset.num !== undefined) {

        const number = button.dataset.num;

        if (number === ".") {
            addDecimal();
        } else {
            addNumber(number);
        }

        return;
    }

    // Botão de operação
    if (button.dataset.op !== undefined) {

        chooseOperator(button.dataset.op);

        return;
    }

    // Botão C
    if (button.dataset.action === "clear") {

        resetCalculator();

        return;
    }

    // Botão =
    if (button.dataset.action === "calculate") {

        calculate();

        return;
    }
});

//teclado físico

document.addEventListener("keydown", function(event) {

    const key = event.key;

    // Números
    if (key >= "0" && key <= "9") {
        addNumber(key);
        return;
    }

    // Ponto decimal
    if (key === "." || key === ",") {
        addDecimal();
        return;
    }

    // Operações
    if (
        key === "+" ||
        key === "-" ||
        key === "*" ||
        key === "/"
    ) {
        chooseOperator(key);
        return;
    }

    // Enter ou =
    if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
        return;
    }

    // Escape limpa a calculadora
    if (key === "Escape") {
        resetCalculator();
        return;
    }

    // Backspace apaga o último número
    if (key === "Backspace") {

        if (
            currentValue.length > 1 &&
            !shouldResetDisplay
        ) {
            currentValue =
                currentValue.slice(0, -1);

            if (
                currentValue === "" ||
                currentValue === "-"
            ) {
                currentValue = "0";
            }

            updateDisplay();
        }

        return;
    }
});

//botão limpar histórico

clearHistoryButton.addEventListener(
    "click",
    clearHistory
);


//alternar tema escuro/claro (implementação futura)

themeToggle.addEventListener("click", function() {

    document.body.classList.toggle("dark-theme");

    const darkMode =
        document.body.classList.contains("dark-theme");

    localStorage.setItem(
        "darkMode",
        darkMode
    );

    themeToggle.setAttribute(
        "aria-label",
        darkMode
            ? "Mudar para tema claro"
            : "Mudar para tema escuro"
    );
});


const savedTheme =
    localStorage.getItem("darkMode");

if (savedTheme === "true") {

    document.body.classList.add("dark-theme");

    themeToggle.setAttribute(
        "aria-label",
        "Mudar para tema claro"
    );
}

//inicializa display com valor 0

updateDisplay();

