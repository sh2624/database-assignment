import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("데이터베이스 시딩");

  // 1. 기존 데이터 초기화
  await prisma.enrollment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.course.deleteMany();

  // 2. 학생 데이터 생성
  await prisma.user.createMany({
    data: [
      {
        studentNumber: "202100068",
        name: "사용자1",
        department: "영어영문학과",
      },
      {
        studentNumber: "202200068",
        name: "사용자2",
        department: "컴퓨터공학부",
      },
      {
        studentNumber: "202300068",
        name: "사용자3",
        department: "정보통신공학과",
      },
      {
        studentNumber: "202400068",
        name: "사용자4",
        department: "임베디드시스템공학과",
      },
    ],
  });

  // 3. 과목 데이터 생성
  await prisma.course.createMany({
    data: [
      {
        code: "CS101",
        title: "데이터베이스",
        professor: "교수1",
        credits: 3,
        capacity: 1,
      },
      {
        code: "CS102",
        title: "알고리즘",
        professor: "교수2",
        credits: 2,
        capacity: 10,
      },
      {
        code: "CS103",
        title: "컴퓨터네트워크",
        professor: "교수3",
        credits: 1,
        capacity: 20,
      },
    ],
  });

  console.log("학생 4명, 과목 3개 생성 완료");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
