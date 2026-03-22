import { prisma } from "@repo/database";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      submissions: {
        where: {
          type: "SUBMIT",
        },
        select: {
          id: true,
          createdAt: true,
          language: true,
          status: true,
          problem: {
            select: {
              id: true,
              difficulty: true,
              title: true,
            },
          },
        },
      },
    },
  });
  return (
    <div>
      <h1>{id}</h1>
    </div>
  );
}
