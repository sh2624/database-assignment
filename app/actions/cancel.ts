"use server";

import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function cancelCourse(userId: number, courseId: number) {
  return await prisma.$transaction(async (tx) => {
    // 동시성 제어 - 특정 과목의 행을 선점
    const courses = await tx.$queryRaw<any[]>`
      SELECT id, enrolled_count FROM courses WHERE id = ${courseId} FOR UPDATE;
    `;

    if (!courses || courses.length === 0) {
      return { success: false, message: "존재하지 않는 과목입니다." };
    }

    // 2. 해당 학생이 현재 수강 중 상태인지 조회
    const enrollment = await tx.enrollment.findFirst({
      where: {
        userId: userId,
        courseId: courseId,
        status: "ENROLLED",
      },
    });

    if (!enrollment) {
      return { success: false, message: "취소할 수강 내역이 없습니다." };
    }

    // 3. DB에서 삭제
    await tx.enrollment.delete({
      where: { id: enrollment.id },
    });

    // 4. 강좌의 현재 신청 인원 감소
    await tx.course.update({
      where: { id: courseId },
      data: {
        enrolledCount: { decrement: 1 },
      },
    });

    revalidatePath("/");

    return { success: true, message: "수강이 취소되었습니다." };
  });
}
