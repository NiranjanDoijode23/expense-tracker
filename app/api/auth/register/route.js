import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req){
try {
    const {email,password}=await req.json();
    if (!email || !password || password.length < 8) {
        return NextResponse.json({error:"Valid email and min 8 char password required"},{status:400});
    }

    const existinguser=await prisma.user.findUnique({
        where:{
            email
        },
    });
    if(existinguser){
        if (!existinguser.password) {
          const hashpass = await bcrypt.hash(password, 10);
          const linkedUser = await prisma.user.update({
            where: { id: existinguser.id },
            data: { password: hashpass },
          });

          const token = jwt.sign(
            { userId: linkedUser.id, email: linkedUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );

          const response = NextResponse.json(
            { message: "Password linked to existing Google account", user: { email: linkedUser.email } },
            { status: 200 }
          );
          response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24,
            path: "/",
          });
          return response;
        }
        return NextResponse.json({error:"User already exists"},{status:400});
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
      secure: process.env.NODE_ENV === "production",        // false for localhost adn true fro deployed
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


