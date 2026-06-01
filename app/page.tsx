import prisma from "../lib/prisma";
import EnrollButton from "./EnrollButton";
import CancelButton from "./CancelButton";
import { Toaster } from "react-hot-toast";

export const dynamic = "force-dynamic";

interface EnrollmentRecord {
  course_id: number;
  code: string;
  title: string;
  credits: number;
  professor: string;
  status: string;
  applied_at: Date;
}

export default async function Home() {
  // 1. 전체 과목 목록 가져오기
  const courses = await prisma.course.findMany({
    orderBy: { id: "asc" },
  });

  // DB의 첫 번째 학생 가져오기 (테스트용)
  const currentStudent = await prisma.user.findFirst();

  if (!currentStudent) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        데이터베이스에 학생 데이터가 없습니다.
      </div>
    );
  }

  const currentStudentId = currentStudent.id;

  // 2. JOIN 쿼리 (내 수강 내역)
  const myEnrollments = await prisma.$queryRaw<EnrollmentRecord[]>`
    SELECT 
      c.id as course_id,
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
            🎓 데이터베이스 과제 - 모의 수강신청 시스템
          </h1>
          <div className="text-center mb-8">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-bold shadow-sm">
              🧑‍🎓 현재 접속자: {currentStudent.name} ({currentStudent.department}
              /{currentStudent.studentNumber})
            </span>
          </div>

          {/* 동시성 테스트 안내 배너 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-blue-900 shadow-sm">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <span>🧪</span> 동시성 제어 테스트 방법
            </h3>
            <p className="text-sm mb-4 text-blue-800 leading-relaxed">
              F12를 눌러 <strong>개발자 도구 콘솔 창</strong>에 아래 스크립트를
              입력하시면 Lost Update 방어 로직을 테스트하실 수 있습니다.
              <br />
              (자세한 내용은 설명 PPT를 참고 부탁드립니다.)
            </p>
            <div className="bg-gray-800 text-green-400 p-4 rounded-lg text-xs overflow-x-auto font-mono">
              <pre>
                <code>
                  {`// 화면의 첫 번째 수강신청 버튼을 동시에 2번 누르는 스크립트
const btn = document.querySelectorAll('button')[0];
Promise.all([
  new Promise(r => { btn.click(); r(); }),
  new Promise(r => { btn.click(); r(); })
]).then(() => console.log("동시 요청 발송 완료"));`}
                </code>
              </pre>
            </div>
          </div>

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
                    상태 및 취소
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
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              enrollment.status === "ENROLLED"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {enrollment.status}
                          </span>
                          {enrollment.status === "ENROLLED" && (
                            <CancelButton
                              courseId={enrollment.course_id}
                              studentId={currentStudentId}
                            />
                          )}
                        </div>
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
