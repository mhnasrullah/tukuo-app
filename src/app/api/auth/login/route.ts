import prisma from "@/lib/prisma";
import ClientError from "@/utils/server/error";
import { isJsonString } from "@/utils/server/function";
import { ErrorField } from "@/utils/server/type";
import { serverValidation } from "@/utils/server/validation";
import { NextResponse } from "next/server";
import bycript from "bcrypt";
import jwt from "jsonwebtoken";

const post = async (req: Request) => {
  try {
    const { email, password } = await req.json();

    const error: ErrorField[] = [];

    serverValidation.isRequired(email, () => {
      error.push({
        field: "email",
        message: "email is required",
      });
    });

    serverValidation.isRequired(password, () => {
      error.push({
        field: "password",
        message: "password is required",
      });
    });

    if (email) {
      serverValidation.isValidEmail(email, () => {
        error.push({
          field: "email",
          message: "email is invalid",
        });
      });
    }

    if (error.length > 0) {
      throw new ClientError(JSON.stringify(error));
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existingUser) {
      throw new ClientError(
        JSON.stringify([{ field: "email", message: "email is not registered" }])
      );
    }

    const passwordMatch = await bycript.compare(
      password,
      existingUser.password
    );

    if (!passwordMatch) {
      throw new ClientError(
        JSON.stringify([
          { field: "password", message: "password is incorrect" },
        ])
      );
    }

    const token = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_SECRET ?? "",
      {
        expiresIn: "30d",
      }
    );

    return NextResponse.json(
      {
        message: "login is success",
        data: {
          token,
          email: existingUser.email,
          shopname: existingUser.shopname,
          id: existingUser.id,
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
