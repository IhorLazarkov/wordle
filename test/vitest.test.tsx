import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import "@testing-library/jest-dom/vitest"
import { Cell, ListCommitedAttempts, ListCurrentAttempt, ListKeys, ListUnusedAttempts, ShowMisteryWord, type TKeys } from '../src/App'

const isVisibleAndEmpty = (e: HTMLElement | null) => (
  expect(e).toBeVisible() && expect(e).toBeEmptyDOMElement())

it("Mistery word is rendering", async () => {
  render(<ShowMisteryWord isToShow={false} word='cloud' />)
  const emptyMisteryWord = screen.queryByTitle(/mistery word/i)
  expect(emptyMisteryWord).toBeInTheDocument()
  expect(emptyMisteryWord).toBeEmptyDOMElement()

  //render
  cleanup()

  render(<ShowMisteryWord isToShow={true} word='cloud' />)
  const misteryWord = screen.queryByTitle(/mistery word/i)
  expect(misteryWord).toBeVisible()
  expect(misteryWord).toHaveTextContent('it was cloud')
})

describe('Rendering empty cells', () => {

  beforeEach(() => cleanup())

  it("An Empty cell is rendering", () => {
    render(<Cell style={{}} index={1} char='' />)

    const cell = screen.queryByRole('cell')
    expect(cell).toBeInTheDocument()
    isVisibleAndEmpty(cell)
  })

  it("A group of 5 empty cells is rendered in ListUnusedAttempts component", () => {
    render(<ListUnusedAttempts rowIndex={4} />)

    const groups = screen.queryAllByRole('group')
    const group = groups[0]
    expect(groups).toHaveLength(1)
    expect(group).toBeInTheDocument()

    const cells = screen.queryAllByRole("cell")
    expect(cells).toHaveLength(5)
    cells.forEach(isVisibleAndEmpty)
  })

  it('A group of 5 empty cells is rendered in ListCurrentAttempt component', () => {
    render(<ListCurrentAttempt rowIndex={1} currentAttempt='' />)

    const groups = screen.getAllByRole('group')
    const group = groups[0]
    expect(groups).toHaveLength(1)
    expect(group).toBeVisible()
    expect(group).toBeInTheDocument()

    const cells = screen.getAllByRole('cell')
    expect(cells).toHaveLength(5)
    cells.forEach(isVisibleAndEmpty)
  })
})

describe('Rendering squers with a charater', async () => {

  beforeEach(() => cleanup())

  it('A cell is rendering "A" character', async () => {
    render(<Cell style={{}} index={1} char='A' />)

    const cell = screen.queryByRole('cell')
    expect(cell).toBeVisible()
    expect(cell).not.toBeEmptyDOMElement()
    expect(cell).toHaveTextContent('A')
  })

  it('A group of cells are rendered with provided word and colors', () => {
    render(<ListCommitedAttempts attempts={["hello"]} flags={['x+---']} />)

    const groups = screen.queryAllByRole("group")
    const group = groups[0]
    expect(groups).toHaveLength(1)
    expect(group).toBeVisible()

    const cells = screen.queryAllByRole('cell')
    expect(cells.length).toEqual(5)
    expect(cells[0].style.color).toEqual("yellow")
    expect(cells[1].style.color).toEqual("green")
    expect(cells[2].style.color).toEqual("inherit")
  })
})

describe("Rendering keyboard", () => {

  const keys: TKeys[] = [
    { char: 'A', flag: '' },
    { char: 'B', flag: '-' },
    { char: 'C', flag: '+' },
    { char: 'D', flag: 'x' },
  ]

  beforeEach(() => cleanup())

  it("A key is rendered", () => {
    render(<ListKeys keys={keys} arrSize={1} coef={0} />)
    const button = screen.getByRole('button', { name: "A" })
    expect(button).toBeVisible()
    expect(button).toHaveTextContent('A')
    expect(button.style.color).toEqual("inherit")
  })

  it("Keys are rendered", () => {
    render(<ListKeys keys={keys} arrSize={4} coef={0} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4)
    expect(buttons[1].style.color).toEqual("inherit")
    expect(buttons[2].style.color).toEqual("green")
    expect(buttons[3].style.color).toEqual("yellow")
  })
})
