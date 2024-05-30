'use strict';
const body = document.querySelector('body');
const nav = document.createElement('div');
const container = document.createElement('div');
const gameContainer = document.createElement('div');
const grid = document.createElement('div');
const title = document.createElement('h1');
const gameSize = document.createElement('div');
const start = document.createElement('button');
const soundBtn = document.createElement('button');
const saveBtn = document.createElement('button');
const resumeBtn = document.createElement('button');
const gameInfo = document.createElement('div');
const movesBlock = document.createElement('div');
const timerBlock = document.createElement('div');

let timer = 0;
let time = 0;
let moves = 0;
let audioEnabled = true;
let size = Number(localStorage.getItem('newSize')) || 4;

function createPage() {
    body.append(container);
    container.classList.add('container');

    container.append(title);
    title.classList.add('title');
    title.innerHTML = 'Gem Puzzle';

    container.append(nav);
    nav.classList.add('nav');

    nav.append(start);
    start.classList.add('btn');
    start.classList.add('start');
    start.innerHTML = 'New Game';

    nav.append(resumeBtn);
    resumeBtn.classList.add('btn');
    resumeBtn.classList.add('resume');
    resumeBtn.innerHTML = 'Resume';

    nav.append(saveBtn);
    saveBtn.classList.add('btn');
    saveBtn.classList.add('save');
    saveBtn.innerHTML = 'Save';

    nav.append(soundBtn);
    soundBtn.classList.add('btn');
    soundBtn.classList.add('sound');
    soundBtn.innerHTML = 'Sound Off';

    container.append(gameInfo);
    gameInfo.classList.add('game-info');

    gameInfo.append(movesBlock);
    movesBlock.classList.add('moves');
    movesBlock.innerHTML = 'Moves: 0';

    gameInfo.append(timerBlock);
    timerBlock.classList.add('timer');
    timerBlock.innerHTML = 'Time: 00:00:00';

    container.append(gameContainer);
    gameContainer.classList.add('game-container');
    
    gameContainer.append(grid);
    grid.classList.add('grid');

    container.append(gameSize);
    gameSize.classList.add('game-size');
    gameSize.innerHTML = '<a href="#">3x3</a><a href="#">4x4</a><a href="#">5x5</a><a href="#">6x6</a><a href="#">7x7</a><a href="#">8x8</a>';

}
createPage();

let arraySize = [];
function createTiles() {
    for (let i = 0; i < size * size; i++) {
        const tile = document.createElement('div');
        grid.append(tile);
        tile.classList.add('tile');
        tile.innerHTML = i + 1;
        arraySize.push(i);
    }
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    // randomize tiles:

    const tileNumber = document.querySelectorAll('.tile');
    tileNumber[tileNumber.length - 1].classList.add('empty-tile');
    tileNumber[tileNumber.length - 1].innerHTML = '';
    for (let i = tileNumber.length - 1; i > 0; i--) {
        let num = Math.floor(Math.random() * (i + 1));
        let d = arraySize[num];
        arraySize[num] = arraySize[i];
        arraySize[i] = d;
    }

    for (let i = 0; i < size * size; i++) {
        tileNumber[i].style.order = arraySize[i];
    }
}
createTiles()


function moveTiles() {
    let nearTiles = [];
    let emptyTileOrder = 0;
    let emptyTile = document.querySelector('.empty-tile');
    const tileNumber = document.querySelectorAll('.tile');
    emptyTileOrder = getTileOrder(emptyTile);
    const tileArray = quickSort(Array.from(tileNumber));
    // console.log(tileArray);

    function quickSort(arr) {
        if (arr.length == 0) return [];
        let a = [],
          b = [],
          p = arr[0];
      
        for (let i = 1; i < arr.length; i++) {
          if (Number(getComputedStyle(arr[i]).getPropertyValue('order')) < Number(getComputedStyle(p).getPropertyValue('order'))) a.push(arr[i]);
          else b.push(arr[i]);
        }
        return quickSort(a).concat(p, quickSort(b));
    }

    let tileMatrix = [];
    for (let i = 0; i < tileArray.length; i += size) {
        const chunk = tileArray.slice(i, i + size);
        tileMatrix.push(chunk);
    }
    // console.log(tileMatrix);

    // Nearest tiles:

    let strEmpty, colEmpty = 0;
    for (let i = 0; i < tileMatrix.length; i++) {
        for (let j = 0; j < tileMatrix[i].length; j++) {
            if (tileMatrix[i][j] === emptyTile) {
                strEmpty = i;
                colEmpty = j;
            }
        }
    }
    
    // nearTiles = [];
    for (let i = 0; i < tileMatrix.length; i++) {
        for (let j = 0; j < tileMatrix[i].length; j++) {
            if (i === strEmpty && (j === colEmpty - 1 || j === colEmpty + 1) || 
                j === colEmpty && (i === strEmpty - 1 || i === strEmpty + 1) ) {
                nearTiles.push(tileMatrix[i][j]);
            }
        }
    }
    // console.log(nearTiles);

    isWin();
    eventMove();

    function eventMove() {
    nearTiles.forEach(element => {
        element.addEventListener('click', () => {
            startTimer();
            moves++;
            movesBlock.innerHTML = `Moves: ${moves}`;

            sound();

            let a = getTileOrder(element);
            element.style.order = emptyTileOrder;
            emptyTile.style.order = a;

            // delete previous events:
            nearTiles.forEach(element => element.replaceWith(element.cloneNode(true)));
            moveTiles();
        });
    });
    }
}
moveTiles()

function getTileOrder(arg) {
    return (Number(getComputedStyle(arg).getPropertyValue('order')))
}

function isWin() {
    let currentTile = document.querySelectorAll('.tile');
    let count = 0;
    for (let i = 0; i < currentTile.length; i++) {
        if (getTileOrder(currentTile[i]) === Number(currentTile[i].innerHTML) - 1) {
            count++;
        }
    }
    if (count === size * size - 1) 
        setTimeout(alert, 100, `Hooray! You solved the puzzle in ${hours}:${minutes}:${seconds} and ${moves} moves!`);
}

document.querySelector('.game-size').childNodes.forEach(element => {
    element.addEventListener('click', () => {
        let newSize = Number(element.innerHTML.slice(2));
        localStorage.clear();
        localStorage.setItem('newSize', newSize);
        location.reload();
    });
});


document.querySelector('.start').addEventListener('click', () => {
    time = 0;
    moves = 0;
    movesBlock.innerHTML = `Moves: ${moves}`;
    document.querySelectorAll('.tile').forEach(element => element.remove());
    createTiles();
    moveTiles();
});

let seconds, minutes, hours = 0;
function startTimer() {
    if (timer === 0)
        timer = setInterval(() => {
                seconds = Math.trunc(time % 60).toString().padStart(2,0);
                minutes = Math.trunc(time / 60 % 60).toString().padStart(2,0);
                hours = Math.trunc(time / 60 / 60 % 60).toString().padStart(2,0);
                timerBlock.innerHTML = `Time: ${hours}:${minutes}:${seconds}`;
                time++;
            }, 1000);
}

function sound() {
    if (audioEnabled) {
        let audio = new Audio();
        audio.src = 'assets/sounds/move.mp3';
        audio.autoplay = true;
    }
}

soundBtn.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    if (soundBtn.innerHTML === 'Sound Off') soundBtn.innerHTML = 'Sound On'
    else soundBtn.innerHTML = 'Sound Off';
});

saveBtn.addEventListener('click', () => {
    let currentMoves = moves;
    let currentTime = time;
    let currentState = document.querySelectorAll('.tile');
    localStorage.setItem('currentMoves', currentMoves);
    localStorage.setItem('currentTime', currentTime);
    let strState = '';
    currentState.forEach(el => {
        strState += '-next-' + el.outerHTML;
    });
    localStorage.setItem('currentState', strState);
});

resumeBtn.addEventListener('click', () => {
    moves = Number(localStorage.getItem('currentMoves'));
    movesBlock.innerHTML = `Moves: ${moves}`;
    time = Number(localStorage.getItem('currentTime'));
    let newTiles = document.querySelectorAll('.tile');

    let oldTilesStr = localStorage.getItem('currentState').replaceAll('\"', "'").split('-next-').slice(1);
    for (let i = 0; i < oldTilesStr.length; i++) {
            newTiles[i].outerHTML = oldTilesStr[i];
    }
    moveTiles();
});