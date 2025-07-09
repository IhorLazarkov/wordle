import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import "@testing-library/jest-dom/vitest"
import { Cell, ListUnusedAttempts } from '../src/App'

it.skip("Mistery word is rendering", async () => {
  // TODO:
})

describe('Rendering empty squers', () => {

  beforeEach(()=> cleanup())

  // Test a cell is rendering
  it("An Empty cell is rendering", () => {
    render(<Cell index={1} char='' />)

    const cell = document.getElementsByTagName('span')
    expect(cell[0]).toBeInTheDocument()
    expect(cell.length).toEqual(1)
  })
  
  // Test a row of cells is rendering
  it("A row of 5 empty cells is rendered", () => {
    render(<ListUnusedAttempts rowIndex={4} />)

    const cells = document.getElementsByTagName('span')
    expect(cells).toBeVisible;
    expect(cells.length).toBe(5)
  })
})

describe('Rendering squers with a charater', async () => {

  beforeEach(()=> cleanup())

  it('A cell is rendering with "A" character', async () => {
    render(<Cell index={1} char='A' />)

    const cell = await screen.findAllByText('A', {exact: true})
    expect(cell.length).toBe(1)
    expect(cell[0]).toBeInTheDocument()
  })
})
