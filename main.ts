// Required parts
// An array of boards Done be done
// A variable keeping the latest won board and the draw that made the won. Done be done
// A way to check when a board has won Done be done
// A way to filter out won boards from the game. Done be done
// A way to calculate the score Done be done
// A few cups of coffee Done be done

type Row = [number, number, number, number, number]
type Board = [Row, Row, Row, Row, Row]

type WinningMove = {
  draw: number
  board: Board
}

async function main() {
  const boards = await createBoards("boards.txt")
  const draws: number[] = await createDraw("draw.txt")
  const latestWin = play(boards, draws)
  const score = calculateScore(latestWin!)
  console.log(score)
}

async function mainTestdata() {
  const boards = await createBoards("testboards.txt")
  const draws: number[] = await createDraw("testdraw.txt")
  const latestWin = play(boards, draws)
  const score = calculateScore(latestWin!)
  console.log(score)
}

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
    if (winningIndexes.length > 0) {
      winningIndexes.sort((a: number, b: number) => a - b)
      winningIndexes.forEach(i => {
        boards.splice(i, 1)
      })
      winningIndexes = []
    }
    let win: boolean = false
    for (let [i, board] of boards.entries()) {
      for (let row of board) {
        if (row.includes(draw)) {
          const index = row.indexOf(draw)
          row[index] = row[index] * -1
          win = checkBoard(board)
        }
      }
      if (win) {
        latestWin = {
          board,
          draw
        }
        winningIndexes.push(i)
      }
    }
  }

  return latestWin
}

export function checkBoard(board: Board): boolean {
  return checkRows(board) || checkColumns(board)
}

function checkRows(board: Board): boolean {
  for (let row of board) {
    if (row.every(n => n <= -0)) return true
  }
  return false
}

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

function calculateScore(win: WinningMove): number {
  console.log("win", win)
  if (!win) {
    return 0
  }
  const { draw, board } = win
  const positive = board.flat().filter(n => n > -1 && n !== -0)
  if (positive.length < 1) {
    return 0
  }
  const sum = positive.reduce((total, n) => total + n)
  const score = sum * draw
  return score
}


await mainTestdata()
await main()

