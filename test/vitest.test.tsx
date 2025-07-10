import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import "@testing-library/jest-dom/vitest"
import { Cell, ListCurrentAttempt, ListUnusedAttempts } from '../src/App'


const isVisibleAndEmpty = (e: HTMLElement | null) => expect(e).toBeVisible() && expect(e).toBeEmptyDOMElement()

it.skip("Mistery word is rendering", async () => {
  // TODO:
})

describe('Rendering empty cells', () => {

  beforeEach(() => cleanup())

  it("An Empty cell is rendering", () => {
    render(<Cell style={{}} index={1} char='' />)

    const cell = screen.queryByRole('cell')
    expect(cell).toBeInTheDocument()
    isVisibleAndEmpty(cell)
  })

  it("A group of 5 empty cells is rendered", () => {
    render(<ListUnusedAttempts rowIndex={4} />)

    const groups = screen.queryAllByRole('group')
    const group = groups[0]
    expect(groups.length).toBe(1)
    expect(group).toBeInTheDocument()

    const cells = screen.queryAllByRole("cell")
    expect(cells.length).toEqual(5)
    cells.forEach(isVisibleAndEmpty)
  })

  it('A group of 5 empty cells is rendered in ListCurrentAttempt component', () => {
    render(<ListCurrentAttempt rowIndex={1} currentAttempt='' />)

    const groups = screen.getAllByRole('group')
    const group = groups[0]
    expect(groups.length).toEqual(1)
    expect(group).toBeVisible()
    expect(group).toBeInTheDocument()

    const cells = screen.getAllByRole('cell')
    expect(cells.length).toEqual(5)
    cells.forEach(isVisibleAndEmpty)
  })
})

describe('Rendering squers with a charater', async () => {

  beforeEach(() => cleanup())

  it('A cell is rendering with "A" character', async () => {
    render(<Cell style={{}} index={1} char='A' />)

    const cell = screen.queryByRole('cell')
    expect(cell).toBeInTheDocument()
    expect(cell).not.toBeEmptyDOMElement()
    expect(cell?.innerText).toEqual('A')
  })
})
