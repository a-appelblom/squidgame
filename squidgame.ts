import { createDraw, createBoards } from './main'
type Row = [number, number, number, number, number]
type Board = [Row, Row, Row, Row, Row]

type Win = {
  draw: number
  board: Board
}

let latestWin: Win

const boards = await createBoards('testboards.txt')
const draws = await createDraw('testdraw.txt')

