"use server"

import { redirect } from "next/navigation"

import { clearAgeVerified, setAgeVerified } from "./cookies"

export async function verifyAge() {
  await setAgeVerified()
  redirect("/")
}

export async function exitApp() {
  redirect("/age-restriction")
}

export async function clearAge() {
  await clearAgeVerified()
  redirect("/")
}
