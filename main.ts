function newGame () {
    // Buffer is a boolean[5][5] matrix.  We're initializing using a literal because of limitations of the JavaScript engine (i.e no support for Array constructor).
    buffer = [
    [
    false,
    false,
    false,
    false,
    false
    ],
    [
    false,
    false,
    false,
    false,
    false
    ],
    [
    false,
    false,
    false,
    false,
    false
    ],
    [
    false,
    false,
    false,
    false,
    false
    ],
    [
    false,
    false,
    false,
    false,
    false
    ]
    ]
    // Randomly place snake
    snake = [[randint(0, buffer.length - 1), randint(0, buffer[0].length - 1)]]
    // Randomly pick direction
    direction = randint(0, DIRECTIONS.length - 1)
    // Set negative when not turning
    turnDirection = -1
    newPill()
}
function newPill() {
    // Randomly pick a pill location
    pill = [randint(0, buffer.length - 1), randint(0, buffer[0].length - 1)]
    for (let location of snake) {
        // Is the pill in any of the snake's locations?  Using JSON.stringify() to compare whole arrays at once.
        if (JSON.stringify(location) == JSON.stringify(pill)) {
            // Recurse and try again
            newPill()
            // There's nothing left to do. Return early.
            return
        }
    }
}
// We use a separate LED output buffer for smooth/flickerless rendering.
function renderBuffer () {
    for (let x = 0; x <= buffer.length - 1; x++) {
        for (let y = 0; y <= buffer[x].length - 1; y++) {
            if (buffer[x][y]) {
                led.plot(x, y)
            } else {
                led.unplot(x, y)
            }
        }
    }
}
// Turn abstracted from events so that it can be reused for both buttons
function turn (leftRight: boolean) {
    // Set direction on separate variable so that only one turn can be made per move
    turnDirection = (direction + (leftRight ? 1 : -1) + DIRECTIONS.length) % DIRECTIONS.length
}
input.onButtonPressed(Button.A, function () {
    turn(false)
})
input.onButtonPressed(Button.B, function () {
    turn(true)
})
function move () {
    // Is the snake turning?
    if (turnDirection > -1) {
        // Update direction only once per move
        direction = turnDirection
        // Set back to non-turning state
        turnDirection = -1
    }
    // The first element of the snake array represents the head.  We'll unshift() new head location in the direction relative to the old head.
    snake.unshift([(snake[0][0] + DIRECTIONS[direction][0] + 5) % 5, (snake[0][1] + DIRECTIONS[direction][1] + 5) % 5])
    // Is the head of the snake located at the pill?
    if (JSON.stringify(snake[0]) == JSON.stringify(pill)) {
        // Create newPill() and skip tail snake.pop()
        newPill()
    } else {
        // Turn off pixel at old tail
        buffer[snake[snake.length - 1][0]][snake[snake.length - 1][1]] = false
        // Remove/pop() old tail
        snake.pop()
    }
    for (let s = 0; s <= snake.length - 1; s++) {
        // Is the head in same location as any other part of the body?
        if (s > 0 && JSON.stringify(snake[0]) == JSON.stringify(snake[s])) {
            // GAME OVER!
            music._playDefaultBackground(music.builtInPlayableMelody(Melodies.Wawawawaa), music.PlaybackMode.UntilDone)
            newGame()
            return
        }
        // Update buffer with part of the snake
        buffer[snake[s][0]][snake[s][1]] = true
    }
    // Show location of pill.  Using negation for blink effect.
    buffer[pill[0]][pill[1]] = !(buffer[pill[0]][pill[1]])
}
let turnDirection = 0
let direction = 0
let buffer: boolean[][] = []
let DIRECTIONS: number[][] = []
let pill: number[] = []
let snake: number[][] = []
// Constant 4 Cardinal Directions
DIRECTIONS = [
    // North
    [0, -1],
    // East
    [1, 0],
    // South
    [0, 1],
    // West
    [-1, 0]
]
newGame()
basic.forever(function () {
    move()
    renderBuffer()
    // This controls the speed of the game
    basic.pause(500)
})
