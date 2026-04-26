import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ valid: false, error: "Token is required" }, { status: 400 });
    }

    const res = await fetch(process.env.NEXT_PUBLIC_OM_API_URL + "/users/loggedInUser", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false }, { status: 400 });
    }
  } catch (error) {
    console.error("OM Validation Error:", error);
    return NextResponse.json({ valid: false, error: "Failed to connect to OpenMetadata API" }, { status: 500 });
  }
}
