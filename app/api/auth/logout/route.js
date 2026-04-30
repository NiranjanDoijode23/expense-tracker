import { NextResponse } from "next/server";

export async function POST(req) {
    const response = NextResponse.json({
        message: "logout Succesfully"
    })

    response.cookies.set("token", "", {
        httpOnly: true,
        maxAge: 0,       // ← this deletes the cookie immediately
        path: "/",
    });

    return response;
}