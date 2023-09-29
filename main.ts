// Required parts
// An array of boards Done be done
// A variable keeping the latest won board and the draw that made the won. Done be done
// A way to check when a board has won Done be done
// A way to filter out won boards from the game. Done be done
// A way to calculate the score Done be done
// A few cups of coffee Done be done

// Built to simply run through the commanline using bun. 
// This so I can use ts files without transpiling for ease of use

// Some helpful types. Could probably be simplified a bit but it works well for this usecase
type Row = [number, number, number, number, number]
type Board = [Row, Row, Row, Row, Row]
type WinningMove = {
  draw: number
  board: Board
}
type ReqBody = {
  name: string
  answer: number
}

// Our program parses the data into boards and draws from the text files
// Then it runs the game and calculates the score
async function main() {
  const boards = await createBoards("boards.txt")
  const draws: number[] = await createDraw("draw.txt")
  const latestWin = play(boards, draws)
  const score = calculateScore(latestWin!)
  console.log(score)
  if (Bun.argv.at(-1) === "post") {
    const reqBody: ReqBody = {
      name: Bun.env.NAME as string,
      answer: score
    }
    console.log(reqBody)
    const res = await fetch(Bun.env.POST_URL as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
      , body: JSON.stringify(reqBody)
    })
    const data = await res.json()
    console.log("Server response", data)
  }
}

// Only used for testing with the testdata
async function mainTestdata() {
  const boards = await createBoards("testboards.txt")
  const draws: number[] = await createDraw("testdraw.txt")
  const latestWin = play(boards, draws)
  const score = calculateScore(latestWin!)
  console.log(score)
}

// Helper functions to parse the data into boards and draws. Uses bun to read the files
export async function createDraw(file: string): Promise<number[]> {
  const drawData = Bun.file(file)
  const drawText = await drawData.text()
  const draws = drawText.split(",")

  return draws.map(s => parseInt(s))
}

export async function createBoards(file: string): Promise<Board[]> {
  const boardData = Bun.file(file)
  const text = await boardData.text()
  const boards: Board[] = parseDataIntoBoards(text)
  return boards
}

// Massages the data into a more usable format fitting our types
function parseDataIntoBoards(data: string): Board[] {
  let textBoards = data.split("\n\n").map(board => board.split("\n"))
  textBoards = textBoards.map(row => row.filter(s => s !== ""))
  let boards = textBoards.map(board => board.map(row => row.split(" ").filter(s => s !== "").map(s => parseInt(s))))
  return boards as Board[]
}

function play(boards: Board[], draws: number[]): WinningMove | undefined {
  let latestWin: WinningMove | undefined
  let winningIndexes = []
  for (let draw of draws) {

    // It is possible that more than one hand can win in one go. So indexes are stored in an array in reverse order
    // Then we remove the boards from the array in reverse order to not mess up the indexes
    if (winningIndexes.length > 0) {
      winningIndexes.sort((a: number, b: number) => a < b)
      winningIndexes.forEach(i => {
        boards.splice(i, 1)
      })
      winningIndexes = []
    }

    // No need to continue the program if all boards are done
    if (boards.length < 1) {
      return latestWin
    }

    // Loop through the boards and check if the draw is in the board. I need the index in order to splice later
    for (let [i, board] of boards.entries()) {
      let win: boolean = false
      for (let row of board) {
        if (row.includes(draw)) {
          const index = row.indexOf(draw)
          row[index] = row[index] * -1 // We mark numbers by turning them negative
          win = checkBoard(board)
        }
      }

      // Always check if the board has win
      if (win) {
        latestWin = {
          board,
          draw
        }

        // Save all winning indexes to remove later
        winningIndexes.push(i)
      }
    }
  }

  return latestWin
}

// Returns true if the board has won either column wise or row wise
export function checkBoard(board: Board): boolean {
  return checkRows(board) || checkColumns(board)
}

function checkRows(board: Board): boolean {
  for (let row of board) {
    if (row.every(n => n <= -0)) return true
  }
  return false
}

// Converts the board to columns and checks if the columns have won by flipping the board
function checkColumns(board: Board): boolean {
  if (board[0].some(n => n <= -0)) {
    let boardToCheck = []
    for (let i = 0; i < 5; i++) {
      let row = []
      for (let j = 0; j < 5; j++) {
        row.push(board[j][i])
      }
      boardToCheck.push(row)
    }
    return checkRows(boardToCheck as Board)
  }
  return false
}

// Calculates the score by multiplying the draw with the sum of the board
function calculateScore(win: WinningMove): number {
  console.log("win", win.draw)
  win.board.forEach(row => {
    console.log(row)
  })
  if (!win) {
    return 0
  }
  const { draw, board } = win

  // Filter out all negative numbers, we can flatten the board since the game is over
  const positive = board.flat().filter(n => n > -1 && n !== -0) // -0 is a thing in js, so we need to filter it out
  if (positive.length < 1) {
    return 0
  }
  const sum = positive.reduce((total, n) => total + n)
  const score = sum * draw
  return score
}

// await mainTestdata()
await main()

