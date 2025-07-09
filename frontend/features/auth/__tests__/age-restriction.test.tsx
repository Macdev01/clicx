import { AgeRestriction } from "@/features/auth/age-restriction"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe("AgeRestriction", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render the component with the correct text content", () => {
    render(<AgeRestriction onVerified={() => {}} />)
    expect(screen.getByText("This is an adult website")).toBeInTheDocument()
    expect(
      screen.getByText(
        /This website contains age-restricted materials including nudity and explicit depictions of sexual activity/
      )
    ).toBeInTheDocument()
  })

  it('should call onVerified and router.push("/") when the "Enter" button is clicked', () => {
    const onVerifiedMock = vi.fn()
    render(<AgeRestriction onVerified={onVerifiedMock} />)

    const enterButton = screen.getByRole("button", { name: /i am 18 or older - enter/i })
    fireEvent.click(enterButton)

    expect(onVerifiedMock).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith("/")
  })

  it('should call router.push("/age-restriction") when the "Exit" button is clicked', () => {
    render(<AgeRestriction onVerified={() => {}} />)

    const exitButton = screen.getByRole("button", { name: /i am under 18 - exit/i })
    fireEvent.click(exitButton)

    expect(mockPush).toHaveBeenCalledWith("/age-restriction")
  })
})
