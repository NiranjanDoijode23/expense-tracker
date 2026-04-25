import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req){
try {
    const {email,password}=await req.json();
    const existinguser=await prisma.user.findUnique({
        where:{
            email
        },
    });
    if(existinguser){
        return Response.json({error:"User already exists"},{status:400});
    }

    const hashpass=await bcrypt.hash(password,10);
    const user= await prisma.user.create({
        data:{
            email,
            password:hashpass
        },
    });

     const response = NextResponse.json(
      { message: "Registered successfully", user: { email: user.email } },
      { status: 201 }
    );
   const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false,        // false for localhost adn true fro deployed
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;

} catch (error) {
    console.error(error);
    return NextResponse.json({error:"Something Error"},{status:500});
}


}


