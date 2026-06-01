"use server";

import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function enrollCourse(userId: number, courseId: number) {
  return await prisma.$transaction(async (tx) => {
    // 동시성 제어 - 특정 과목의 행을 선점
    const courses = await tx.$queryRaw<any[]>`
      SELECT id, title, capacity, enrolled_count 
      FROM courses 
      WHERE id = ${courseId} 
      FOR UPDATE;
    `;

    if (!courses || courses.length === 0) {
      return { success: false, message: "존재하지 않는 과목입니다." };
    }

    const course = courses[0];

    // 1. 정원 초과 검증
    if (course.enrolled_count >= course.capacity) {
      return { success: false, message: "수강 정원이 모두 마감되었습니다." };
    }

    // 2. 중복 신청 여부 검증
    const existingEnrollment = await tx.enrollment.findUnique({
      where: {
        unique_active_enrollment: {
          userId: userId,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      return { success: false, message: "이미 수강신청 완료된 과목입니다." };
    }

    await tx.enrollment.create({
      data: {
        userId: userId,
        courseId: courseId,
        status: "ENROLLED",
      },
    });

    // 3. 현재 신청 인원 카운트 증가
    await tx.course.update({
      where: { id: courseId },
      data: {
        enrolledCount: { increment: 1 },
      },
    });

    revalidatePath("/");

    return { success: true, message: `${course.title} 과목 신청 성공!` };
  });
}
