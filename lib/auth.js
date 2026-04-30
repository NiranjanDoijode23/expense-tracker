import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function getAuthenticatedUser(req) {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
    });
    if (user) return user;
  }

  const token = req.cookies.get("token")?.value;
  if (!token || !process.env.JWT_SECRET) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.userId) },
    });
    return user;
  } catch {
    return null;
  }
}
