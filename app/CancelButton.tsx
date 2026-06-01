"use client";

import { useTransition } from "react";
import { cancelCourse } from "./actions/cancel";
import toast from "react-hot-toast";

interface CancelButtonProps {
  courseId: number;
  studentId: number;
}

export default function CancelButton({
  courseId,
  studentId,
}: CancelButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (!confirm("정말 이 과목의 수강을 취소하시겠습니까?")) return;

    startTransition(async () => {
      try {
        const result = await cancelCourse(studentId, courseId);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("통신 오류가 발생했습니다.");
      }
    });
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-xs font-bold transition-all duration-200 active:scale-95 disabled:opacity-50"
    >
      {isPending ? "취소 중..." : "수강 취소"}
    </button>
  );
}
