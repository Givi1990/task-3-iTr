import { createHmac, randomBytes } from 'crypto';
import { createInterface } from 'readline';


function generateHMAC(key, data) {
    return createHmac('sha256', key).update(data).digest('hex').toUpperCase();
}

function printAvailableMoves(moves) {
    console.log("Available moves:");
    moves.forEach((move, index) => {
        console.log(`${index + 1} - ${move}`);
    });
    console.log("0 - exit");
    console.log("? - help");
}


// Функция для обработки ввода пользователя
function handleUserInput(moves, winMap, rl, key) {
    rl.question('Enter your move: ', (input) => {
        if (input === '0') {
            console.log('Exiting...');
            rl.close();
            return;
        } else if (input === '?') {
            printAvailableMoves(moves);
            handleUserInput(moves, winMap, rl, key);
            return;
        }

        const userMoveIndex = parseInt(input, 10) - 1;
        if (userMoveIndex < 0 || userMoveIndex >= moves.length) {
            console.log('Invalid move. Please try again.');
            handleUserInput(moves, winMap, rl, key);
            return;
        }

        const userMove = moves[userMoveIndex];
        const computerMoveIndex = Math.floor(Math.random() * moves.length);
        const computerMove = moves[computerMoveIndex];

        console.log(`Your move: ${userMove}`);
        console.log(`Computer move: ${computerMove}`);

        if (userMove === computerMove) {
            console.log('It\'s a tie!');
        } else if (winMap[userMove].has(computerMove)) {
            console.log('You win!');
        } else {
            console.log('You lose!');
        }

        const hmac = generateHMAC(key, computerMove);
        console.log(`HMAC: ${hmac}`);
        console.log(`HMAC key: ${key}`);
        handleUserInput(moves, winMap, rl, key);
    });
}

// Функция для создания карты побед
function createWinMap(moves) {
    const numMoves = moves.length;
    const winMap = {};
    for (let i = 0; i < numMoves; i++) {
        const winsAgainst = new Set();
        for (let j = 1; j <= Math.floor(numMoves / 2); j++) {
            winsAgainst.add(moves[(i + j) % numMoves]);
        }
        winMap[moves[i]] = winsAgainst;
    }
    return winMap;
}

// Основная функция
function main() {
    const args = process.argv.slice(2);
    if (args.length < 3 || args.length % 2 === 0) {
        console.log("Error: The number of moves must be an odd number ≥ 3.");
        console.log("Usage: node game.js move1 move2 ... moveN");
        return;
    }
    if (new Set(args).size !== args.length) {
        console.log("Error: Moves must be unique.");
        console.log("Usage: node game.js move1 move2 ... moveN");
        return;
    }

    const moves = args;
    const winMap = createWinMap(moves);

    // Генерация случайного ключа для HMAC
    const key = randomBytes(32).toString('hex').toUpperCase();
    
    console.log(`HMAC: ${generateHMAC(key, moves.join(':'))}`);
    printAvailableMoves(moves);

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    handleUserInput(moves, winMap, rl, key);
}

main();
