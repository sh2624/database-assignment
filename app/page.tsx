import prisma from "../lib/prisma";
import EnrollButton from "./EnrollButton";
import { Toaster } from "react-hot-toast";

export default async function Home() {
  // 1. 전체 과목 목록 가져오기
  const courses = await prisma.course.findMany({
    orderBy: { id: "asc" },
  });

  // DB에 있는 첫 번째 학생 가져오기
  const firstStudent = await prisma.user.findFirst();
  if (!firstStudent) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        데이터베이스에 학생 데이터가 없습니다.
      </div>
    );
  }

  const currentStudentId = firstStudent.id;

  // 2. JOIN 쿼리 (내 수강 내역)
  const myEnrollments = await prisma.$queryRaw<any[]>`
    SELECT 
      c.code, 
      c.title, 
      c.credits, 
      c.professor,
      e.status, 
      e.applied_at
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    JOIN users u ON e.user_id = u.id
    WHERE u.id = ${currentStudentId}
    ORDER BY e.applied_at DESC;
  `;

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-4xl mx-auto space-y-12">
        {/* 상단: 수강신청 목록 구역 */}
        <section>
          <h1 className="text-3xl font-extrabold text-center mb-8 text-blue-900">
            🎓 데이터베이스 과제 - 모의 수강신청
          </h1>
          <div className="grid gap-4">
            {courses.map((course) => {
              const isFull = course.enrolledCount >= course.capacity;
              return (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm border border-gray-100"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-500 mb-1">
                      {course.code}
                    </div>
                    <h2 className="text-xl font-bold mb-1">{course.title}</h2>
                    <div className="text-gray-600 text-sm">
                      담당교수: {course.professor} | 학점: {course.credits}학점
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div
                      className={`text-lg font-bold ${isFull ? "text-red-500" : "text-blue-600"}`}
                    >
                      {course.enrolledCount} / {course.capacity} 명
                    </div>
                    <EnrollButton
                      courseId={course.id}
                      studentId={currentStudentId}
                      isFull={isFull}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* 하단: 내 수강 내역 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            📚 내 수강 내역{" "}
            <span className="text-sm font-normal text-gray-500">
              (JOIN 연산)
            </span>
          </h2>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-600">과목코드</th>
                  <th className="p-4 font-semibold text-gray-600">과목명</th>
                  <th className="p-4 font-semibold text-gray-600">담당교수</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">
                    상태
                  </th>
                  <th className="p-4 font-semibold text-gray-600">신청일시</th>
                </tr>
              </thead>
              <tbody>
                {myEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      아직 신청한 과목이 없습니다.
                    </td>
                  </tr>
                ) : (
                  myEnrollments.map((enrollment, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <td className="p-4 text-gray-600">{enrollment.code}</td>
                      <td className="p-4 font-bold">{enrollment.title}</td>
                      <td className="p-4 text-gray-600">
                        {enrollment.professor}
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(enrollment.applied_at).toLocaleString(
                          "ko-KR",
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
