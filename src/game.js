export default class Game {
    static points = {
        '1': 40,
        '2': 100,
        '3': 300,
        '4': 1200
    };

    constructor() {
        this.reset();
    }

    get level() {
        return Math.floor(this.lines * 0.1);
    }

    //визначення координат тетроміно у просторі
    getState() {
        const playfied = this.createPlayfield();
        const { y: pieceY, x: pieceX, blocks} = this.activeTetra;

        for (let y = 0; y < this.playfied.length; y++) {
            playfied[y] = [];

            for (let x = 0; x < this.playfied[y].length; x++) {
                playfied[y][x] = this.playfied[y][x];
            }
        }

        for (let y = 0; y < blocks.length; y++) {
            for (let x = 0; x < blocks[y].length; x++) {
                if(blocks[y][x]) {
                    playfied[pieceY + y][pieceX + x] = blocks[y][x];
                }            
            }
        }
        
        return {
            score: this.score,
            level: this.level,
            lines: this.lines,
            nextTetra: this.nextTetra,
            playfied,
            isOver: this.topOut
        };
    }

    //обнулення
    reset() {
        this.score = 0;
        this.lines = 0;
        this.topOut = false;
        this.playfied = this.createPlayfield();
        this.activeTetra = this.createTetra();
        this.nextTetra = this.createTetra();
    }

    //створення ігрового поля - "стакан"
    createPlayfield() {
        const playfied = [];

        for (let y = 0; y < 20; y++) {
            playfied[y] = [];

            for (let x = 0; x < 10; x++) {
                playfied[y][x] = 0;
            }
        }

        return playfied;
    }

    //створення тетроміно
    createTetra() {
        const index = Math.floor(Math.random() * 7);
        const type = 'IJLOSTZ'[index];
        const piece = { };

        switch(type) {
            case 'I':
                piece.blocks = [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ];
                break;
            case 'J':
                piece.blocks = [
                    [0, 0, 0],
                    [2, 2, 2],
                    [0, 0, 2]
                ];
                break;
            case 'L':
                piece.blocks = [
                    [0, 0, 0],
                    [3, 3, 3],
                    [3, 0, 0]
                ];
                break;
            case 'O':
                piece.blocks = [
                    [0, 0, 0, 0],
                    [0, 4, 4, 0],
                    [0, 4, 4, 0],
                    [0, 0, 0, 0]
                ];
                break;
            case 'S':
                piece.blocks = [
                    [0, 0, 0],
                    [0, 5, 5],
                    [5, 5, 0]
                ];
                break;
            case 'T':
                piece.blocks = [
                    [0, 0, 0],
                    [6, 6, 6],
                    [0, 6, 0]
                ];
                break;
            case 'Z':
                piece.blocks = [
                    [0, 0, 0],
                    [7, 7, 0],
                    [0, 7, 7]
                ];
                break;
            default:
                throw new Error('Type of Tetra uncorrect');
        }

        piece.x = Math.floor((10 - piece.blocks[0].length) / 2);
        piece.y = -1;
        return piece;
    }

    //рух тетроміно ліворуч
    moveTetraLeft() {
        this.activeTetra.x -= 1;
        if(this.Collision()) {
            this.activeTetra.x += 1;
        }
    }

    //рух тетроміно праворуч
    moveTetraRight() {
        this.activeTetra.x += 1;
        if(this.Collision()) {
            this.activeTetra.x -= 1;
        }
    }

    //рух тетроміно вниз
    moveTetraDown() {
        if(this.topOut) return;
        this.activeTetra.y +=1;

        if(this.Collision()) {
            this.activeTetra.y -= 1;
            this.lockTetra();
            const cleared = this.clearLines();
            this.updateScore(cleared);
            this.updateTetras();
        }

        if(this.Collision()) {
            this.topOut = true;
        }
    }

    //поворот тетроміно(основний метод) згідно колізії
    rotateTetra() {
        this.rotateBack();

        if(this.Collision()) {
            this.rotateBack(false);
        }
    }

    //поворот тетроміно
    rotateBack(clockwise = true) {
        const blocks = this.activeTetra.blocks;
        const length = blocks.length;
        const x = Math.floor(length / 2);
        const y = length - 1;

        for (let i = 0; i < x; i++) {
            for (let j = i; j < y - i; j++) {
                const temp = blocks[i][j];

                if(clockwise) {
                    blocks[i][j] = blocks[y - j][i];
                    blocks[y - j][i] = blocks[y - i][y - j];
                    blocks[y - i][y - j] = blocks[j][y - i];
                    blocks[j][y - i] = temp;
                } else {
                    blocks[i][j] = blocks[j][y - i];
                    blocks[j][y - i] = blocks[y - i][y - j];
                    blocks[y - i][y - j] = blocks[y - j][i];
                    blocks[y - j][i] = temp;
                }
            }
        }
    }

    //визначення колізії
    Collision() {
        const playfied = this.playfied;
        const { y: pieceY, x: pieceX, blocks} = this.activeTetra;

        for(let y = 0; y < blocks.length; y++) {
            for(let x = 0; x < blocks[y].length; x++) {
                if (blocks[y][x] && 
                    ((playfied[pieceY + y] === undefined || playfied[pieceY + y][pieceX + x] === undefined) ||
                    playfied[pieceY + y][pieceX + x])
                    ) {
                    return true;
                }
            }
        }

        return false;
    }

    //блокування тетроміно
    lockTetra() {
        const { y: pieceY, x: pieceX, blocks} = this.activeTetra;

        for(let y = 0; y < blocks.length; y++) {
            for(let x = 0; x < blocks[y].length; x++) {
                if(blocks[y][x]) {
                    this.playfied[pieceY + y][pieceX + x] = blocks[y][x];
                }
            }
        }
    }

    //очищення зібраної лінії
    clearLines() {
        const rows = 20;
        const columns = 10;
        let lines = [];

        for (let y = rows - 1; y >= 0; y--) {
            let numOfBlocks = 0;

            for (let x = 0; x < columns; x++) {
                if(this.playfied[y][x]) {
                    numOfBlocks += 1;
                } 
            }

            if(numOfBlocks === 0) {
                break;
            } else if(numOfBlocks < columns) {
                continue;
            } else if(numOfBlocks === columns) {
                lines.unshift(y);
            }
        }

        for (let index of lines) {
            this.playfied.splice(index, 1);
            this.playfied.unshift(new Array(columns).fill(0));
        }

        return lines.length;
    }

    //оновлення рахунку гри
    updateScore(clLines) {
        if(clLines > 0) {
            this.score += Game.points[clLines] * (this.level + 1);
            this.lines += clLines;
        }
    }

    //оновлення тетроміно
    updateTetras() {
        this.activeTetra = this.nextTetra;
        this.nextTetra = this.createTetra(); 
    }
}