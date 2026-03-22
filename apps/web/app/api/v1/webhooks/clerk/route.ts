import { prisma } from "@repo/database";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const payload = await req.text();
  const headerPayload = await headers();

  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "Missing clerk webhook secret" },
      { status: 500 },
    );
  }

  const wh = new Webhook(secret);

  let event: any;

  try {
    event = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.log("Webhook verification failed", err);

    return NextResponse.json(
      { error: "Invalid svix signature" },
      { status: 400 },
    );
  }

  console.log("Received event:", event);

  // Handle Clerk events
  if (event.type === "user.created") {
    const user = event.data;

    // const newUser = {
    //   clerkId: user.id,
    //   email: user.email_addresses?.[0]?.email_address,
    //   firstName: user.first_name,
    //   lastName: user.last_name,
    //   imageUrl: user.image_url,
    // };

    // const prisma = new PrismaClient();
    const dbUser = await prisma.user.create({
      data: {
        email: user.email_addresses?.[0]?.email_address,
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });

    console.log("Create user in DB:", dbUser);
    // await db.user.create({ data: newUser })
  }

  return NextResponse.json({ success: true });
}
