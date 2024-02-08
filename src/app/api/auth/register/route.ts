import ClientError from "@/utils/server/error";
import { isJsonString } from "@/utils/server/function";
import { ErrorField } from "@/utils/server/type";
import { serverValidation } from "@/utils/server/validation";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bycript from "bcrypt";

const register = async (req: Request) => {
  try {
    const { shopname, password, confirmation_password, email } =
      await req.json();

    const errorMessages: ErrorField[] = [];

    serverValidation.isRequired(shopname, () => {
      errorMessages.push({
        field: "shopname",
        message: "shopname is required",
      });
    });
    serverValidation.isRequired(password, () => {
      errorMessages.push({
        field: "password",
        message: "password is required",
      });
    });
    serverValidation.isRequired(confirmation_password, () => {
      errorMessages.push({
        field: "confirmation_password",
        message: "confirmation_password is required",
      });
    });
    serverValidation.isRequired(email, () => {
      errorMessages.push({
        field: "email",
        message: "email is required",
      });
    });

    if (password !== confirmation_password && confirmation_password) {
      errorMessages.push({
        field: "confirmation_password",
        message: "password and confirmation password should be the same",
      });
    }

    if (password.length < 8 && password) {
      errorMessages.push({
        field: "password",
        message: "password should be at least 8 characters",
      });
    }

    if (shopname.length < 6 && shopname) {
      errorMessages.push({
        field: "shopname",
        message: "shopname should be at least 6 characters",
      });
    }

    if (email && !email.includes("@")) {
      errorMessages.push({
        field: "email",
        message: "email should be a valid email",
      });
    }

    if (errorMessages.length > 0) {
      throw new ClientError(JSON.stringify(errorMessages));
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ClientError("Email already exists");
    }

    const hashedPassword = await bycript.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        shopname,
      },
    });

    return NextResponse.json({
      message: "Successfully registered!",
      data: user,
    });

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

export { register as POST };
