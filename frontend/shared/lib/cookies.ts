import { cookies } from "next/headers"

const AGE_VERIFIED_COOKIE = "age-verified"

export async function setAgeVerified() {
  const cookieStore = await cookies()

  // Set cookie for 1 year
  const oneYear = 365 * 24 * 60 * 60 * 1000
  const expires = new Date(Date.now() + oneYear)

  cookieStore.set(AGE_VERIFIED_COOKIE, "true", {
    expires,
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "strict",
    path: "/",
  })
}

export async function getAgeVerified(): Promise<boolean> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(AGE_VERIFIED_COOKIE)
  return cookie?.value === "true"
}

export async function clearAgeVerified() {
  const cookieStore = await cookies()
  cookieStore.delete(AGE_VERIFIED_COOKIE)
}
