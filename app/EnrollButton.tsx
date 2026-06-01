"use client";

import { useTransition } from "react";
import { enrollCourse } from "./actions/enroll";
import toast from "react-hot-toast";

interface EnrollButtonProps {
  courseId: number;
  studentId: number;
  isFull: boolean;
}

export default function EnrollButton({
  courseId,
  studentId,
  isFull,
}: EnrollButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleEnroll = () => {
    if (isFull) {
      toast.error("이미 마감된 과목입니다.");
      return;
    }

    // 서버 액션(트랜잭션 API) 호출
    startTransition(async () => {
      try {
        const result = await enrollCourse(studentId, courseId);
        if (result.success) {
          toast.success(result.message);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast.error(result.message);
        }
      } catch (error: any) {
        toast.error("서버 통신 오류가 발생했습니다.");
      }
    });
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={isPending || isFull}
      className={`relative flex items-center justify-center w-28 h-10 px-4 py-2 rounded-lg font-bold text-white transition-all duration-200 ${
        isFull
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg"
      }`}
    >
      {isPending ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : isFull ? (
        "마감"
      ) : (
        "수강신청"
      )}
    </button>
  );
}
