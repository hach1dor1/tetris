export default class Controller {
    constructor(game, view) {
        this.game = game;
        this.view = view;
        this.intervalID = null;
        this.isPlaying = false;

        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("keyup", this.handleKeyUp.bind(this));

        this.view.renderStartScreen(); 
    }

    //початок гри
    play() {
        this.isPlaying = true;
        this.startTimer();
        this.updateView();
    }

    //пауза
    pause() {
        this.isPlaying = false;
        this.stopTimer();
        this.updateView();
    }

    //обнулення
    reset() {
        this.game.reset();
        this.play();
    }

    //оновлення екрану
    updateView() {
        const state = this.game.getState();

        if(state.isOver) {
            this.view.renderGameOverScreen(state);
        } else if(!this.isPlaying) {
            this.view.renderPauseScreen();
        } else {
            this.view.render(state);
        }
    }

    //увімкнення таймеру
    startTimer() {
        const speed = 1000 - this.game.getState().level * 100;

        if(!this.intervalID) {
            this.intervalID = setInterval(() => {
                this.game.moveTetraDown();
                this.updateView();
            }, speed > 0 ? speed : 100);
        }
    }

    //вимкнення таймеру
    stopTimer() {
        if(this.intervalID) {
            clearInterval(this.intervalID);
            this.intervalID = null;
        }
    }

    //обробка подій натиснених клавіш
    handleKeyDown(event) {
        switch(event.key) {
            case "ArrowLeft":
                this.game.moveTetraLeft();
                this.updateView();
                break;
            case "ArrowUp":
                this.game.rotateTetra();
                this.updateView();
                break;
            case "ArrowRight":
                this.game.moveTetraRight();
                this.updateView();
                break;
            case "ArrowDown":
                this.stopTimer();
                this.game.moveTetraDown();
                this.updateView();
                break;
            case "Enter":
                if(this.game.getState().isOver) {
                    this.reset();
                } else if(this.isPlaying) {
                    this.pause();
                } else {
                    this.view.enterPressed();
                    if(this.view.inputEmpty != true) {
                        this.play();
                    }
                }
                break;
        }
    }

    //перевірка відпускання клавіши донизу
    handleKeyUp(event) {
        switch(event.key) {
            case "ArrowDown":
                this.startTimer();
                break;
        }
    }
}