export type Student = {
  id: number;
  name: string;
  initials: string;
  className: string;
  batch: string;
  phone: string;
  fee: number;
  due: string;
  daysLate: number;
  status: "Paid" | "Pending" | "Late";
  attendance: "Present" | "Absent";
  color: string;
};

export function Avatar({ student, small = false }: { student: Student; small?: boolean }) {
  return (
    <span className={`avatar avatar-${student.color} ${small ? "avatar-small" : ""}`}>
      {student.initials}
    </span>
  );
}

export function Status({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const cls =
    normalized === "paid" || normalized === "present"
      ? "success"
      : normalized === "late" || normalized === "absent"
        ? "danger"
        : "warning";

  return (
    <span className={`status status-${cls}`}>
      <i />
      {value}
    </span>
  );
}
