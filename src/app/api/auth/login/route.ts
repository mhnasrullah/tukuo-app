import { NextResponse } from "next/server";

const post = async (req: Request) => {
  const { email, password } = await req.json();

  console.log(email, password);

  return NextResponse.json(
    { message: "Hello from the API!" },
    {
      status: 200,
    }
  );
};

export { post as POST };
