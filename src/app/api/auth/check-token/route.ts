import ClientError from "@/utils/server/error";
import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { isJsonString } from "@/utils/server/function";
import prisma from "@/lib/prisma";

const post = async (req: Request) => {
  try {
    const { token } = await req.json();

    if (!token) {
      throw new ClientError(
        JSON.stringify([{ field: "token", message: "token is required" }])
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "");

    if (!decoded) {
      throw new ClientError(
        JSON.stringify([{ field: "token", message: "token is invalid" }])
      );
    }

    if (typeof decoded === "string") {
      throw new ClientError(
        JSON.stringify([{ field: "token", message: "token is invalid" }])
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: decoded.email,
      },
    });

    if (!existingUser) {
      throw new ClientError(
        JSON.stringify([{ field: "token", message: "user is invalid" }])
      );
    }

    const newtokens = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
      },
      process.env.JWT_SECRET ?? "",
      {
        expiresIn: "30d",
      }
    );

    return NextResponse.json(
      {
        message: "token is valid",
        data: {
          token: newtokens,
          email: existingUser.email,
          id: existingUser.id,
          shopname: existingUser.shopname,
        },
      },
      {
        status: 200,
      }
    );
  } catch (e: any) {
    if (e?.name === "ClientError") {
      return NextResponse.json(
        {
          message: isJsonString(e?.message) ? JSON.parse(e.message) : e.message,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        message: e?.message || "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
};

export { post as POST };
