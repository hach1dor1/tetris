export default class View {

    inputField;

    static colors = {
        '1': 'green',
        '2': 'purple',
        '3': 'red',
        '4': 'blue',
        '5': 'pink',
        '6': 'cyan',
        '7': 'orange'
    };

    constructor(element, width, height, rows, columns) {
        this.inputEmpty = true;

        this.element = element;
        this.width = width;
        this.height = height;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext('2d');

        this.playfieldBorderWidth = 4;
        this.playfieldX = this.playfieldBorderWidth;
        this.playfieldY = this.playfieldBorderWidth;
        this.playfieldWidth = this.width * 2 / 3;
        this.playfieldHeight = this.height;
        this.playfieldInnerWidth = this.playfieldWidth - this.playfieldBorderWidth * 2;
        this.playfieldInnerHeight = this.playfieldHeight - this.playfieldBorderWidth * 2;

        this.blockWidth = this.playfieldInnerWidth / columns;
        this.blockHeight = this.playfieldInnerHeight / rows;

        this.panelX = this.playfieldWidth + 10;
        this.panelY = 0;
        this.panelWidth = this.width / 3;
        this.panelHeight = this.height;

        this.element.appendChild(this.canvas);
    }

    //основний метод рендеру
    render(state) {
        this.clearScreen();
        this.renderPlayfield(state);
        this.renderPanel(state);
    }

    //очищення екрана
    clearScreen() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    //рендер початкового екрана
    renderStartScreen() {
        this.context.fillStyle = 'white';
        this.context.font = '18px "Pixelify Sans"';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText('Press ENTER to Start', this.width / 2, this.height - 450);
        this.createInputField();
        this.recordsShow();
    }

    //рендер екрана паузи
    renderPauseScreen() {
        this.context.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.fillStyle = 'white';
        this.context.font = '18px "Pixelify Sans"';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText('Press ENTER to Resume', this.width / 2, this.height / 2);
    }

    //рендер екрана кінця гри
    renderGameOverScreen({ score }) {
        this.clearScreen();
        this.context.fillStyle = 'white';
        this.context.font = '18px "Pixelify Sans"';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText('GAME OVER', this.width / 2, this.height / 2 - 48);
        this.context.fillText(`Score: ${score}`, this.width / 2, this.height / 2);
        localStorage.setItem(this.inputField.value, score);
        this.context.fillText('Press ENTER', this.width / 2, this.height / 2 + 48);
    }

    //рендер ігрового поля
    renderPlayfield({ playfied }) {
        for (let y = 0; y < playfied.length; y++) {
            const line = playfied[y];
            
            for (let x = 0; x < line.length; x++) {
                const block = line[x];
                
                if(block) {
                    this.renderBlock(
                        this.playfieldX + (x * this.blockWidth), 
                        this.playfieldY + (y * this.blockHeight), 
                        this.blockWidth, 
                        this.blockHeight, 
                        View.colors[block]
                        );
                }
            }
        }

        this.context.strokeStyle = 'white';
        this.context.lineWidth = this.playfieldBorderWidth;
        this.context.strokeRect(0, 0, this.playfieldWidth, this.playfieldHeight);
    }
    
    //рендер бічної панелі статистики
    renderPanel({ level, score, lines, nextTetra }) {
        this.context.textAlign = 'start';
        this.context.textBaseline = 'top';
        this.context.fillStyle = 'white';
        this.context.font = '16 px "Pixelify Sans"';

        this.context.fillText(`Name: ${this.inputField.value}`, this.panelX, this.panelY + 0);
        this.context.fillText(`Lvl: ${level}`, this.panelX, this.panelY + 24);
        this.context.fillText(`Score: ${score}`, this.panelX, this.panelY + 48);
        this.context.fillText(`Lines: ${lines}`, this.panelX, this.panelY + 72);
        this.context.fillText('Next: ', this.panelX, this.panelY + 96);
        

        for (let y = 0; y < nextTetra.blocks.length; y++) {
            for (let x = 0; x < nextTetra.blocks[y].length; x++) {
                const block = nextTetra.blocks[y][x];

                if(block) {
                    this.renderBlock(
                        this.panelX + (x * this.blockWidth * 0.5),
                        this.panelY + 100 + (y * this.blockHeight * 0.5),
                        this.blockWidth * 0.5,
                        this.blockHeight * 0.5,
                        View.colors[block]
                    );
                }
            }
            
        }
    }

    //рендер тетроміно
    renderBlock(x, y, width, height, color) {
        this.context.fillStyle = color;
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 2;

        this.context.fillRect(x, y, width, height);
        this.context.strokeRect(x, y, width, height);
    }

    //створення поля вводу імені користувача
    createInputField() {
        this.inputField = document.createElement('input');

        this.inputField.type = 'text';
        this.inputField.placeholder = 'Name';
        this.inputField.style.fontSize = '24px';
        this.inputField.style.font = '24px "Pixelify Sans"';
        this.inputField.style.background = 'transparent';
        this.inputField.style.color = 'white';
        this.inputField.style.textAlign = 'center';

        this.inputField.style.position = 'fixed';
        this.inputField.style.top = '25%';
        this.inputField.style.left = '50%';
        this.inputField.style.transform = 'translate(-50%, -50%)';


        document.body.appendChild(this.inputField);
    }

    //перевірка натискання Enter
    enterPressed() {
        const enteredText = this.inputField.value;

        if (enteredText.trim() !== '') {
            this.inputField.remove();
            this.inputEmpty = false;
        }
    }

    //показ рекордів
    recordsShow() {
        let i = 0;
        const keys = Object.keys(localStorage);

        const data = keys.map(key => ({
            key: key,
            value: localStorage.getItem(key)
        }));

        data.sort((a, b) => b.value.localeCompare(a.value));

        data.forEach(item => {
            this.context.fillText(`Name - ${item.key}  |  Score: ${item.value}`, this.width / 2, this.height - 250 - i);
            i+=25;
        });
    }
}