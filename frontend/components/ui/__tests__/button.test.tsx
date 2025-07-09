import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders the button with the correct text", () => {
    render(<Button>Click me</Button>)

    const buttonElement = screen.getByRole("button", { name: /click me/i })
    expect(buttonElement).toBeInTheDocument()
  })
})
