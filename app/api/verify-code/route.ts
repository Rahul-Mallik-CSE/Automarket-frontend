import { type NextRequest, NextResponse } from "next/server"
import { Twilio } from "twilio"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { phone, code, demoMode } = body

  if (!phone) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
  }

  if (!code) {
    return NextResponse.json({ error: "Verification code is required" }, { status: 400 })
  }

  // Check if we should use demo mode
  const useDemoMode = demoMode === true || process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  // If in demo mode, just check if code is 123456
  if (useDemoMode) {
    console.log("Using demo mode for code verification")
    const isValid = code === "123456"
    return NextResponse.json({ success: isValid, demoMode: true })
  }

  // Credentials from environment variables
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const serviceSid = process.env.TWILIO_SERVICE_SID

  // Log credentials availability (without exposing values)
  console.log("Credentials available:", {
    accountSid: !!accountSid,
    authToken: !!authToken,
    serviceSid: !!serviceSid,
  })

  try {
    console.log("Creating Twilio client...")
    const client = new Twilio(accountSid, authToken)

    console.log("Verifying code for phone:", phone)

    const verification_check = await client.verify.v2.services(serviceSid).verificationChecks.create({
      to: phone,
      code: code,
    })

    console.log("Verification check result:", verification_check.status)

    return NextResponse.json({
      success: verification_check.status === "approved",
      status: verification_check.status,
    })
  } catch (error: any) {
    console.error("Error verifying code:", error.message)
    console.error("Error details:", error)

    // If there's an error with Twilio, fall back to demo mode
    if (
      error.message.includes("not a valid phone number") ||
      error.message.includes("did not match the expected pattern")
    ) {
      console.log("Falling back to demo mode due to phone number format error")
      const isValid = code === "123456"
      return NextResponse.json({ success: isValid, demoMode: true })
    }

    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
