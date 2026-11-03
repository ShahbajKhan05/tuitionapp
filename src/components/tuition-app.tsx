"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, IndianRupee, ClipboardCheck, GraduationCap, Users, BookOpen,
  Bell, Search, ChevronDown, Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  CalendarDays, Clock3, MessageCircle, Download, Filter, Check, X, Menu,
  TrendingUp, Wallet, UserRound, CircleHelp, Settings, LogOut, FileText,
  CheckCircle2, AlertCircle, Send, Sparkles, ChevronRight, Phone, Home, LockKeyhole,
} from "lucide-react";

type Tab = "Overview" | "Students" | "Batches" | "Fees Pending" | "Attendance" | "Weekly Tests" | "Homework" | "Payment & Receipts" | "Enquiries / Referrals" | "Parent Login" | "Parent Dashboard" | "Parent Portal";
type Student = { id: number; name: string; initials: string; className: string; batch: string; phone: string; fee: number; due: string; daysLate: number; status: "Paid" | "Pending" | "Late"; attendance: "Present" | "Absent"; color: string };

const initialStudents: Student[] = [
  { id: 1, name: "Aarav Sharma", initials: "AS", className: "Class 10", batch: "Morning A", phone: "9876543210", fee: 1800, due: "05 Nov", daysLate: 0, status: "Paid", attendance: "Present", color: "blue" },
  { id: 2, name: "Ananya Verma", initials: "AV", className: "Class 10", batch: "Morning A", phone: "9876543211", fee: 1800, due: "05 Nov", daysLate: 2, status: "Late", attendance: "Absent", color: "pink" },
  { id: 3, name: "Reyansh Gupta", initials: "RG", className: "Class 9", batch: "Evening B", phone: "9876543212", fee: 1500, due: "05 Nov", daysLate: 5, status: "Late", attendance: "Present", color: "orange" },
  { id: 4, name: "Sara Khan", initials: "SK", className: "Class 10", batch: "Evening A", phone: "9876543213", fee: 1800, due: "05 Nov", daysLate: 0, status: "Paid", attendance: "Present", color: "purple" },
  { id: 5, name: "Vivaan Patel", initials: "VP", className: "Class 8", batch: "Morning B", phone: "9876543214", fee: 1400, due: "05 Nov", daysLate: 8, status: "Late", attendance: "Absent", color: "green" },
  { id: 6, name: "Diya Singh", initials: "DS", className: "Class 9", batch: "Evening B", phone: "9876543215", fee: 1500, due: "05 Nov", daysLate: 0, status: "Paid", attendance: "Present", color: "yellow" },
];

const navItems: { label: Tab; icon: typeof LayoutDashboard; hint: string; title: string }[] = [
  { label: "Overview", icon: LayoutDashboard, hint: "Home and daily summary", title: "Dashboard" },
  { label: "Students", icon: Users, hint: "Manage student details and batches", title: "Students" },
  { label: "Batches", icon: BookOpen, hint: "Organise classes and schedules", title: "Batches" },
  { label: "Fees Pending", icon: IndianRupee, hint: "Collect fees and send reminders", title: "Fees" },
  { label: "Attendance", icon: ClipboardCheck, hint: "Mark students present or absent", title: "Attendance" },
  { label: "Weekly Tests", icon: GraduationCap, hint: "Marks and student progress", title: "Tests" },
  { label: "Homework", icon: FileText, hint: "Assign work and track submissions", title: "Homework" },
  { label: "Payment & Receipts", icon: Wallet, hint: "Verify payments and issue receipts", title: "Payments" },
  { label: "Enquiries / Referrals", icon: UserRound, hint: "Track new admission enquiries and referrals", title: "Enquiries" },
  { label: "Parent Login", icon: Phone, hint: "Preview parent sign-in and OTP flow", title: "Parent Login" },
  { label: "Parent Dashboard", icon: Home, hint: "View a child’s learning, homework and fees", title: "Parent Dashboard" },
  { label: "Parent Portal", icon: Users, hint: "Preview the parent experience", title: "Parent Preview" },
];

const money = (n: number) => "₹" + n.toLocaleString("en-IN");
const waLink = (phone: string, message: string) => "https://wa.me/91" + phone.replace(/\D/g, "") + "?text=" + encodeURIComponent(message);

function Avatar({ student, small = false }: { student: Student; small?: boolean }) {
  return <span className={`avatar avatar-${student.color} ${small ? "avatar-small" : ""}`}>{student.initials}</span>;
}

function Status({ value }: { value: string }) {
  const cls = value.toLowerCase() === "paid" || value.toLowerCase() === "present" ? "success" : value.toLowerCase() === "late" || value.toLowerCase() === "absent" ? "danger" : "warning";
  return <span className={`status status-${cls}`}><i />{value}</span>;
}

const routeByTab: Record<Tab, string> = {
  "Overview": "/dashboard",
  "Students": "/students",
  "Batches": "/batches",
  "Fees Pending": "/fees-pending",
  "Attendance": "/attendance",
  "Weekly Tests": "/weekly-tests",
  "Homework": "/homework",
  "Payment & Receipts": "/payments",
  "Enquiries / Referrals": "/enquiries",
  "Parent Login": "/parent-login",
  "Parent Dashboard": "/parent-dashboard",
  "Parent Portal": "/parent-portal",
};

const tabByRoute = Object.fromEntries(
  Object.entries(routeByTab).map(([tab, route]) => [route, tab])
) as Record<string, Tab>;

export default function TuitionApp() {
  const pathname = usePathname();
  const router = useRouter();
  const active: Tab = pathname === "/" ? "Overview" : tabByRoute[pathname] ?? "Overview";
  const setActive = (tab: Tab) => router.push(routeByTab[tab]);
  const [students, setStudents] = useState(initialStudents);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedDate, setSelectedDate] = useState("04 Nov 2026");
  const [testFilter, setTestFilter] = useState("All students");
  const [portalStudent, setPortalStudent] = useState("Ananya Verma");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newClass, setNewClass] = useState("Class 9");
  const [newBatch, setNewBatch] = useState("Morning A");
  const [classFilter, setClassFilter] = useState("All classes");

  const pending = students.filter(s => s.status !== "Paid");
  const collected = students.filter(s => s.status === "Paid").reduce((a, s) => a + s.fee, 0);
  const outstanding = pending.reduce((a, s) => a + s.fee, 0);
  const filtered = useMemo(() => students.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.className.toLowerCase().includes(query.toLowerCase())), [students, query]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const markAttendance = (id: number, attendance: "Present" | "Absent") => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, attendance } : s));
    notify(attendance === "Absent" ? "Absent marked — WhatsApp alert is ready." : "Attendance updated successfully.");
  };
  const markPaid = (id: number) => { setStudents(prev => prev.map(s => s.id === id ? { ...s, status: "Paid", daysLate: 0 } : s)); notify("Demo payment marked as paid. Receipt preview is available in Parent Portal."); };
  const addStudent = () => {
    if (!newName.trim() || newPhone.replace(/\D/g, "").length < 10) { notify("Enter a student name and valid 10-digit phone number."); return; }
    const initials = newName.trim().split(/\s+/).slice(0, 2).map(v => v[0]).join("").toUpperCase();
    setStudents(prev => [...prev, { id: Date.now(), name: newName.trim(), initials, className: newClass, batch: newBatch.trim() || "New Batch", phone: newPhone.replace(/\D/g, ""), fee: 1500, due: "05 Nov", daysLate: 0, status: "Pending", attendance: "Present", color: "blue" }]);
    setNewName(""); setNewPhone(""); setNewClass("Class 9"); setNewBatch("Morning A"); setShowAdd(false); notify("Student added to demo list.");
  };

  const Sidebar = () => <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
    <div className="brand"><div className="brand-mark"><GraduationCap size={22} strokeWidth={2.5} /></div><div><strong>tuition<span>app</span></strong><small>COACHING MANAGEMENT</small></div><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={18}/></button></div>
    <div className="institute"><div className="institute-logo">E</div><div><b>Excellence Academy</b><small>Single institute workspace</small></div><ChevronDown size={15}/></div>
    <div className="nav-caption">MAIN MENU</div>
    <nav>{navItems.map(item => { const Icon = item.icon; return <button key={item.label} className={`nav-link ${active === item.label ? "nav-active" : ""}`} onClick={() => { setActive(item.label); setMobileOpen(false); }}><Icon size={18}/><span className="nav-copy"><b>{item.title}</b><small>{item.hint}</small></span>{item.label === "Fees Pending" && <em>{pending.length}</em>}</button>; })}</nav>
    <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><b>Need a hand?</b><p>We’re here to help you get started.</p><button onClick={() => notify("Help centre is coming soon.")}>Visit help centre <ArrowUpRight size={13}/></button></div><button className="nav-link muted" onClick={() => notify("Settings are part of the next phase.")}><Settings size={18}/>Settings</button><div className="profile"><div className="profile-avatar">AK</div><div><b>Admin Kumar</b><small>Institute owner</small></div><MoreHorizontal size={19}/></div></div>
  </aside>;

  const Header = () => <header className="topbar"><div className="top-left"><button className="menu-toggle" onClick={() => setMobileOpen(true)}><Menu size={20}/></button><div className="crumb">Workspace <ChevronRight size={14}/> <b>{navItems.find(item => item.label === active)?.title ?? active}</b></div></div><div className="top-actions"><label className="search-box"><Search size={16}/><input placeholder="Search by student name or class..." value={query} onChange={e => setQuery(e.target.value)}/><kbd>⌘ K</kbd></label><button className="icon-button notification" onClick={() => notify("You’re all caught up!")}><Bell size={19}/><i/></button><div className="top-profile"><div className="profile-avatar">AK</div><ChevronDown size={14}/></div></div></header>;

  const PageTitle = ({ title, sub, action }: { title: string; sub: string; action?: React.ReactNode }) => <div className="page-title"><div><div className="eyebrow">WEDNESDAY, 04 NOVEMBER 2026</div><h1>{title}</h1><p>{sub}</p></div>{action}</div>;

  const StudentTable = ({ rows, feeMode = false }: { rows: Student[]; feeMode?: boolean }) => <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>CLASS / BATCH</th>{feeMode && <th>AMOUNT DUE</th>}{feeMode && <th>DUE DATE</th>}{feeMode && <th>OVERDUE</th>}{!feeMode && <th>FEE STATUS</th>}<th>{feeMode ? "PAYMENT STATUS" : "ATTENDANCE"}</th><th className="align-right">ACTION</th></tr></thead><tbody>{rows.map(s => <tr key={s.id}><td><div className="student-cell"><Avatar student={s}/><div><b>{s.name}</b><small>{s.phone}</small></div></div></td><td><b className="table-main">{s.className}</b><small className="table-sub">{s.batch}</small></td>{feeMode && <td><b>{money(s.fee)}</b></td>}{feeMode && <td>{s.due}, 2026</td>}{feeMode && <td>{s.daysLate ? <span className="late-days">{s.daysLate} days late</span> : "—"}</td>}{!feeMode && <td><Status value={s.status}/></td>}<td><Status value={feeMode ? s.status : s.attendance}/></td><td><div className="row-actions">{feeMode ? <><a className="tiny-action whatsapp" href={waLink(s.phone, `Hello, this is a friendly reminder that ${s.name}'s tuition fee of ${money(s.fee)} is pending. Kindly make the payment. Thank you.`)} target="_blank" rel="noreferrer"><MessageCircle size={14}/> Remind</a>{s.status !== "Paid" && <button className="tiny-action" onClick={() => markPaid(s.id)}><Check size={14}/> Paid</button>}</> : <><button className={`attendance-btn ${s.attendance === "Present" ? "selected-present" : ""}`} onClick={() => markAttendance(s.id, "Present")}>P</button><button className={`attendance-btn ${s.attendance === "Absent" ? "selected-absent" : ""}`} onClick={() => markAttendance(s.id, "Absent")}>A</button></>}</div></td></tr>)}</tbody></table>{rows.length === 0 && <div className="empty">No students found. Try another search.</div>}</div>;

  const Overview = () => <><PageTitle title="Dashboard" sub="Your coaching institute at a glance. Start with today’s fees and attendance." action={<button className="primary-btn" onClick={() => setShowAdd(true)}><Plus size={17}/> Add student</button>}/><div className="stat-grid"><div className="stat-card"><div className="stat-top"><span>Total students</span><span className="stat-icon icon-violet"><Users size={18}/></span></div><div className="stat-value">{students.length}</div><small>Students in your coaching</small></div><div className="stat-card"><div className="stat-top"><span>Fees collected</span><span className="stat-icon icon-green"><Wallet size={18}/></span></div><div className="stat-value">{money(collected)}</div><small>Fees marked as paid in demo</small></div><div className="stat-card"><div className="stat-top"><span>Fees pending</span><span className="stat-icon icon-orange"><IndianRupee size={18}/></span></div><div className="stat-value">{money(outstanding)}</div><small>{pending.length} students have fees due</small></div><div className="stat-card"><div className="stat-top"><span>Today’s attendance</span><span className="stat-icon icon-blue"><ClipboardCheck size={18}/></span></div><div className="stat-value">{students.length ? Math.round(students.filter(s => s.attendance === "Present").length / students.length * 100) : 0}%</div><small>{students.filter(s => s.attendance === "Present").length} present · {students.filter(s => s.attendance === "Absent").length} absent</small><div className="progress-line"><i style={{width: `${students.filter(s => s.attendance === "Present").length / students.length * 100}%`}}/></div></div></div><div className="content-grid"><section className="panel"><div className="panel-head"><div><h3>Fee collection</h3><p>Paid and pending amounts for this demo month</p></div><button className="select-btn">November 2026 <ChevronDown size={14}/></button></div><div className="chart-legend"><span><i className="legend-purple"/>Collected</span><span><i className="legend-grey"/>Pending</span><b>{money(collected + outstanding)} <small>total fees</small></b></div><div className="bar-chart">{[35,52,43,68,58,78,64,88,72,95,76,84].map((h,i)=><div className="bar-group" key={i}><div className="bar-pair"><i style={{height: `${h}%`}}/><i style={{height: `${100-h}%`}}/></div><small>{["1","3","5","7","9","11","13","15","17","19","21","23"][i]}</small></div>)}</div></section><section className="panel activity-panel"><div className="panel-head"><div><h3>Quick summary</h3><p>Other useful numbers</p></div><button className="dots-btn"><MoreHorizontal size={18}/></button></div><div className="quick-row"><span className="quick-icon lavender"><Users size={17}/></span><div><b>Active students</b><small>Across 4 batches</small></div><strong>{students.length}</strong></div><div className="quick-row"><span className="quick-icon mint"><BookOpen size={17}/></span><div><b>Weekly tests</b><small>Next test · Friday</small></div><strong>03</strong></div><div className="quick-row"><span className="quick-icon peach"><MessageCircle size={17}/></span><div><b>Parent enquiries</b><small>Referred this month</small></div><strong>08</strong></div><div className="notice-box"><Sparkles size={16}/><span><b>Looking good!</b> Your fee collection is on track this month.</span></div></section></div><section className="panel table-panel"><div className="panel-head"><div><h3>Student fee list</h3><p>See who has paid and who still needs a reminder</p></div><button className="text-btn" onClick={() => setActive("Fees Pending")}>View all <ArrowUpRight size={14}/></button></div><StudentTable rows={filtered.slice(0,4)}/></section></>;

  const Students = () => {
    const classNames = ["All classes", ...Array.from(new Set(students.map(s => s.className)))];
    const studentRows = filtered.filter(s => classFilter === "All classes" || s.className === classFilter);
    return <><PageTitle title="Students" sub="Keep every student’s contact, class and batch details organised." action={<button className="primary-btn" onClick={() => setShowAdd(true)}><Plus size={17}/> Add student</button>}/><div className="stat-grid three"><div className="stat-card"><div className="stat-top"><span>Total students</span><span className="stat-icon icon-violet"><Users size={18}/></span></div><div className="stat-value">{students.length}</div><small>All enrolled students</small></div><div className="stat-card"><div className="stat-top"><span>Classes</span><span className="stat-icon icon-blue"><BookOpen size={18}/></span></div><div className="stat-value">{new Set(students.map(s => s.className)).size}</div><small>Different class groups</small></div><div className="stat-card"><div className="stat-top"><span>Batches</span><span className="stat-icon icon-green"><Users size={18}/></span></div><div className="stat-value">{new Set(students.map(s => s.batch)).size}</div><small>Teaching batches</small></div></div><section className="panel table-panel student-management"><div className="panel-head"><div><h3>All students</h3><p>{studentRows.length} student records · Demo workspace</p></div><label className="student-filter"><Filter size={14}/><select value={classFilter} onChange={e => setClassFilter(e.target.value)}>{classNames.map(name => <option key={name}>{name}</option>)}</select></label></div><div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>CLASS</th><th>BATCH</th><th>PARENT WHATSAPP</th><th>FEE STATUS</th><th>ATTENDANCE</th><th>ACTION</th></tr></thead><tbody>{studentRows.map(s => <tr key={s.id}><td><div className="student-cell"><Avatar student={s}/><div><b>{s.name}</b><small>Student ID · {String(s.id).slice(-5)}</small></div></div></td><td><b className="table-main">{s.className}</b></td><td>{s.batch}</td><td><a className="student-phone" href={waLink(s.phone, `Hello, this is Excellence Academy. We are contacting you regarding ${s.name}.`)} target="_blank" rel="noreferrer"><Phone size={13}/>{s.phone}</a></td><td><Status value={s.status}/></td><td><Status value={s.attendance}/></td><td><button className="tiny-action whatsapp" onClick={() => { setPortalStudent(s.name); setActive("Parent Portal"); }}>Parent view <ArrowUpRight size={13}/></button></td></tr>)}</tbody></table>{studentRows.length === 0 && <div className="empty">No students found. Try another search or class.</div>}</div></section><div className="info-note"><AlertCircle size={17}/><span><b>Student records are currently demo-only.</b> Changes stay in this browser session and are not saved to a database yet.</span></div></>;
  };

  const Batches = () => {
    const batchNames = Array.from(new Set(students.map(student => student.batch)));
    const batchRows = batchNames.map((name, index) => {
      const members = students.filter(student => student.batch === name);
      const classes = Array.from(new Set(members.map(student => student.className)));
      return { name, members, classes, paid: members.filter(student => student.status === "Paid").length, pending: members.filter(student => student.status !== "Paid").length, fee: members.reduce((sum, student) => sum + student.fee, 0), timing: ["07:00 AM – 08:30 AM", "09:00 AM – 10:30 AM", "04:00 PM – 05:30 PM", "06:00 PM – 07:30 PM"][index % 4] };
    });
    return <><PageTitle title="Batch management" sub="Organise students into teaching groups and keep each batch easy to manage." action={<button className="primary-btn" onClick={() => notify("Batch creation form is coming next. You can already review your current demo batches here.")}><Plus size={17}/> Add batch</button>}/><div className="stat-grid three"><div className="stat-card"><div className="stat-top"><span>Total batches</span><span className="stat-icon icon-violet"><BookOpen size={18}/></span></div><div className="stat-value">{batchRows.length}</div><small>Active teaching groups</small></div><div className="stat-card"><div className="stat-top"><span>Students assigned</span><span className="stat-icon icon-blue"><Users size={18}/></span></div><div className="stat-value">{students.length}</div><small>Across all batches</small></div><div className="stat-card"><div className="stat-top"><span>Fee follow-ups</span><span className="stat-icon icon-orange"><IndianRupee size={18}/></span></div><div className="stat-value">{batchRows.reduce((sum, batch) => sum + batch.pending, 0)}</div><small>Students with fees pending</small></div></div><div className="batch-grid">{batchRows.map((batch, index) => <section className="panel batch-card" key={batch.name}><div className="batch-card-top"><span className={`batch-symbol batch-symbol-${index % 4}`}><BookOpen size={19}/></span><span className="status status-success"><i/> Active</span></div><h3>{batch.name}</h3><p>{batch.classes.join(" · ")}</p><div className="batch-meta"><span><Users size={14}/>{batch.members.length} students</span><span><Clock3 size={14}/>{batch.timing}</span></div><div className="batch-progress"><div><span>Fee collection</span><b>{batch.members.length ? Math.round(batch.paid / batch.members.length * 100) : 0}%</b></div><div className="progress-line"><i style={{width: `${batch.members.length ? batch.paid / batch.members.length * 100 : 0}%`}}/></div></div><div className="batch-card-bottom"><span><b>{batch.paid}</b> paid <span className="batch-dot">·</span> <b>{batch.pending}</b> pending</span><button className="tiny-action whatsapp" onClick={() => { setQuery(""); setActive("Students"); notify(`Showing the student list. Select ${batch.name} details there.`); }}>View students <ArrowUpRight size={13}/></button></div></section>)}</div><section className="panel table-panel"><div className="panel-head"><div><h3>Batch student overview</h3><p>Student distribution across your teaching groups</p></div></div><div className="table-wrap"><table><thead><tr><th>BATCH</th><th>CLASSES</th><th>STUDENTS</th><th>FEES COLLECTED</th><th>FEES PENDING</th><th>COLLECTION</th></tr></thead><tbody>{batchRows.map(batch => <tr key={batch.name}><td><b className="table-main">{batch.name}</b><small className="table-sub">{batch.timing}</small></td><td>{batch.classes.join(", ")}</td><td><b>{batch.members.length}</b></td><td><b>{money(batch.members.filter(student => student.status === "Paid").reduce((sum, student) => sum + student.fee, 0))}</b></td><td>{money(batch.members.filter(student => student.status !== "Paid").reduce((sum, student) => sum + student.fee, 0))}</td><td><Status value={batch.pending ? "Pending" : "Paid"}/></td></tr>)}</tbody></table></div></section><div className="info-note"><AlertCircle size={17}/><span><b>Demo batch overview.</b> Counts and fee totals are calculated from the sample students currently shown in this frontend.</span></div></>;
  };

  const Fees = () => {
    const feeRows = filtered.filter(s => s.status !== "Paid");
    const overdueRows = feeRows.filter(s => s.daysLate > 0);
    const total = collected + outstanding;
    const collectedPercent = total ? Math.round(collected / total * 100) : 0;
    return <><PageTitle title="Fees pending" sub="Track monthly dues, identify overdue students and send parent reminders." action={<button className="primary-btn" onClick={() => { const first = overdueRows[0] || feeRows[0]; if (first) window.open(waLink(first.phone, `Hello, this is Excellence Academy. ${first.name}'s tuition fee of ${money(first.fee)} is pending. Kindly make the payment. Thank you.`), "_blank"); }}><MessageCircle size={16}/> Remind next parent</button>}/><div className="stat-grid three"><div className="stat-card"><div className="stat-top"><span>Fees collected</span><span className="stat-icon icon-green"><Wallet size={18}/></span></div><div className="stat-value">{money(collected)}</div><small>Marked paid · November 2026</small></div><div className="stat-card"><div className="stat-top"><span>Fees pending</span><span className="stat-icon icon-orange"><IndianRupee size={18}/></span></div><div className="stat-value">{money(outstanding)}</div><small>{feeRows.length} students need follow-up</small></div><div className="stat-card"><div className="stat-top"><span>Overdue students</span><span className="stat-icon icon-red"><Clock3 size={18}/></span></div><div className="stat-value">{overdueRows.length}</div><small>{money(overdueRows.reduce((sum, s) => sum + s.fee, 0))} overdue amount</small></div></div><section className="panel fee-insight"><div><span className="fee-insight-label">COLLECTION OVERVIEW</span><h3>{collectedPercent}% collected this month</h3><p>Based on fee records currently shown in this demo workspace.</p></div><div className="fee-overview-track"><i style={{width: `${collectedPercent}%`}}/></div><div className="fee-overview-legend"><span><i className="fee-dot-paid"/> Collected <b>{money(collected)}</b></span><span><i className="fee-dot-pending"/> Pending <b>{money(outstanding)}</b></span></div></section><section className="panel table-panel"><div className="panel-head"><div><h3>Pending fee records</h3><p>{feeRows.length} students · November 2026 monthly tuition</p></div><span className="fee-filter-label"><Filter size={14}/> Showing unpaid fees</span></div><StudentTable rows={feeRows} feeMode/></section><div className="info-note"><AlertCircle size={17}/><span><b>Manual payment confirmation.</b> Use “Paid” only after checking your UPI/bank account. WhatsApp reminders open a pre-filled message; review and send it yourself. All figures here are demo data.</span></div></>;
  };

  const Attendance = () => {
    const [attendanceBatch, setAttendanceBatch] = useState("All batches");
    const batchNames = ["All batches", ...Array.from(new Set(students.map(s => s.batch)))];
    const attendanceRows = filtered.filter(s => attendanceBatch === "All batches" || s.batch === attendanceBatch);
    const presentCount = attendanceRows.filter(s => s.attendance === "Present").length;
    const absentRows = attendanceRows.filter(s => s.attendance === "Absent");
    const attendanceRate = attendanceRows.length ? Math.round(presentCount / attendanceRows.length * 100) : 0;
    const exportReport = () => {
      const csv = [["Student","Class","Batch","Parent WhatsApp","Date","Attendance"], ...attendanceRows.map(s => [s.name,s.className,s.batch,s.phone,selectedDate,s.attendance])]
        .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a"); link.href = url; link.download = "tuitionapp-attendance.csv"; link.click(); URL.revokeObjectURL(url);
      notify("Attendance CSV exported.");
    };
    const setBatchAttendance = (value: "Present" | "Absent") => {
      setStudents(prev => prev.map(s => attendanceBatch === "All batches" || s.batch === attendanceBatch ? { ...s, attendance: value } : s));
      notify(`All visible students marked ${value.toLowerCase()} in demo mode.`);
    };
    return <>
      <PageTitle title="Attendance" sub="Take a quick roll call, track daily attendance and prepare parent alerts." action={<button className="primary-btn" onClick={() => notify("Attendance saved for this demo session.")}><Check size={16}/> Save attendance</button>}/>
      <div className="attendance-toolbar attendance-toolbar-new">
        <label className="date-control"><CalendarDays size={17}/><input value={selectedDate} onChange={e => setSelectedDate(e.target.value)} aria-label="Attendance date"/></label>
        <label className="batch-select-control"><Filter size={15}/><select value={attendanceBatch} onChange={e => setAttendanceBatch(e.target.value)}>{batchNames.map(name => <option key={name}>{name}</option>)}</select></label>
        <div className="attendance-summary"><span><i className="dot-green"/> {presentCount} Present</span><span><i className="dot-red"/> {absentRows.length} Absent</span></div>
      </div>
      <div className="attendance-stats">
        <section className="panel attendance-rate-card"><div><span className="attendance-kicker">ATTENDANCE RATE</span><strong>{attendanceRate}%</strong><small>{presentCount} of {attendanceRows.length} students present</small></div><div className="attendance-ring" style={{background:`conic-gradient(#36a982 ${attendanceRate * 3.6}deg, #eeedf5 0deg)`}}><div>{attendanceRate}%</div></div></section>
        <section className="panel attendance-quick-card"><div><span className="attendance-kicker">QUICK ACTIONS</span><strong>Mark the whole batch</strong><small>Use only after confirming the roll call.</small></div><div className="attendance-bulk-actions"><button onClick={() => setBatchAttendance("Present")}><Check size={14}/> All present</button><button onClick={() => setBatchAttendance("Absent")}><X size={14}/> All absent</button></div></section>
      </div>
      <section className="panel table-panel attendance-table-panel">
        <div className="panel-head"><div><h3>Daily roll call</h3><p>{selectedDate} · {attendanceRows.length} students · {attendanceBatch}</p></div><button className="text-btn" onClick={exportReport}><Download size={15}/> Export CSV</button></div>
        <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>CLASS / BATCH</th><th>STATUS</th><th>MARK ATTENDANCE</th><th>PARENT ALERT</th></tr></thead><tbody>
          {attendanceRows.map(s => <tr key={s.id}><td><div className="student-cell"><Avatar student={s}/><div><b>{s.name}</b><small>{s.phone}</small></div></div></td><td><b className="table-main">{s.className}</b><small className="table-sub">{s.batch}</small></td><td><Status value={s.attendance}/></td><td><div className="row-actions"><button aria-label={`Mark ${s.name} present`} className={`attendance-btn ${s.attendance === "Present" ? "selected-present" : ""}`} onClick={() => markAttendance(s.id,"Present")}>P</button><button aria-label={`Mark ${s.name} absent`} className={`attendance-btn ${s.attendance === "Absent" ? "selected-absent" : ""}`} onClick={() => markAttendance(s.id,"Absent")}>A</button></div></td><td>{s.attendance === "Absent" ? <a className="tiny-action whatsapp" href={waLink(s.phone,`Hello, ${s.name} was marked absent at Excellence Academy on ${selectedDate}. Please contact us if you have any questions.`)} target="_blank" rel="noreferrer"><MessageCircle size={14}/> Prepare WhatsApp</a> : <span className="attendance-no-alert">No alert needed</span>}</td></tr>)}
        </tbody></table>{attendanceRows.length === 0 && <div className="empty">No students match this batch or search.</div>}</div>
      </section>
      <div className="info-note"><MessageCircle size={17}/><span><b>Parent alerts are manual.</b> For absent students, use “Prepare WhatsApp” to open a pre-filled message. You review and send it yourself.</span></div>
    </>;
  };

  const Tests = () => {
    const [showTestForm, setShowTestForm] = useState(false);
    const [testTitle, setTestTitle] = useState("Mathematics — Chapter 6");
    const [testSubject, setTestSubject] = useState("Mathematics");
    const [testDate, setTestDate] = useState("2026-11-01");
    const [maxMarks, setMaxMarks] = useState("100");
    const [savedTest, setSavedTest] = useState({ title: "Mathematics — Chapter 6", subject: "Mathematics", date: "01 Nov 2026", max: 100 });
    const [marks, setMarks] = useState([{...students[0], score: 92, rank: 1, previous: 86},{...students[1], score: 88, rank: 2, previous: 81},{...students[2], score: 76, rank: 3, previous: 72},{...students[3], score: 71, rank: 4, previous: 74},{...students[4], score: 64, rank: 5, previous: 58},{...students[5], score: 59, rank: 6, previous: 51}]);
    const [scoreDraft, setScoreDraft] = useState<Record<number,string>>({});
    const average = marks.length ? marks.reduce((sum,m) => sum + m.score,0) / marks.length : 0;
    const improved = marks.filter(m => m.score >= m.previous).length;
    const sortedMarks = [...marks].sort((a,b) => b.score-a.score).map((m,index) => ({...m,rank:index+1}));
    const saveTest = () => {
      const max = Number(maxMarks);
      if (!testTitle.trim() || !testSubject.trim() || !Number.isFinite(max) || max <= 0) { notify("Enter a test name, subject and valid maximum marks."); return; }
      const date = new Date(testDate + "T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
      setSavedTest({title:testTitle.trim(),subject:testSubject.trim(),date,max});
      setShowTestForm(false); notify("Test details saved in this demo session.");
    };
    const saveScore = (id:number) => {
      const value = Number(scoreDraft[id]);
      if (!Number.isFinite(value) || value < 0 || value > savedTest.max) { notify(`Enter marks between 0 and ${savedTest.max}.`); return; }
      setMarks(prev => prev.map(m => m.id === id ? {...m,score:value} : m));
      setScoreDraft(prev => ({...prev,[id]:""})); notify("Student marks updated in demo mode.");
    };
    return <>
      <PageTitle title="Weekly test reports" sub="Create a weekly assessment, record marks and share each student's progress." action={<button className="primary-btn" onClick={() => setShowTestForm(v => !v)}><Plus size={17}/> Create test</button>}/>
      {showTestForm && <section className="panel test-create-panel"><div className="panel-head"><div><h3>Create weekly test</h3><p>Set up the assessment details for your batch.</p></div><button className="icon-button" onClick={() => setShowTestForm(false)}><X size={17}/></button></div><div className="test-form-grid"><label>TEST NAME<input value={testTitle} onChange={e=>setTestTitle(e.target.value)} placeholder="e.g. Chapter 7 test"/></label><label>SUBJECT<input value={testSubject} onChange={e=>setTestSubject(e.target.value)} placeholder="e.g. Science"/></label><label>TEST DATE<input type="date" value={testDate} onChange={e=>setTestDate(e.target.value)}/></label><label>MAXIMUM MARKS<input type="number" min="1" value={maxMarks} onChange={e=>setMaxMarks(e.target.value)}/></label></div><div className="test-form-actions"><button className="secondary-btn" onClick={()=>setShowTestForm(false)}>Cancel</button><button className="primary-btn" onClick={saveTest}><Check size={15}/> Save test</button></div></section>}
      <div className="test-banner"><div className="test-banner-icon"><GraduationCap size={24}/></div><div><span>WEEKLY ASSESSMENT · {savedTest.date.toUpperCase()}</span><h2>{savedTest.title}</h2><p>{savedTest.subject} · All batches · Maximum marks: {savedTest.max}</p></div><div className="test-banner-score"><strong>{average.toFixed(1)}%</strong><small>Class average</small></div></div>
      <div className="stat-grid three"><div className="stat-card"><div className="stat-top"><span>Students appeared</span><span className="stat-icon icon-violet"><Users size={18}/></span></div><div className="stat-value">{String(marks.length).padStart(2,"0")}</div><small>Across all batches</small></div><div className="stat-card"><div className="stat-top"><span>Highest score</span><span className="stat-icon icon-green"><TrendingUp size={18}/></span></div><div className="stat-value">{sortedMarks[0]?.score ?? 0}<span className="value-unit">/{savedTest.max}</span></div><small>{sortedMarks[0]?.name ?? "No students"} · Rank 1</small></div><div className="stat-card"><div className="stat-top"><span>Improving students</span><span className="stat-icon icon-blue"><ArrowUpRight size={18}/></span></div><div className="stat-value">{improved}/{marks.length}</div><small>Compared to previous test</small></div></div>
      <section className="panel table-panel"><div className="panel-head"><div><h3>Student performance</h3><p>Update marks and share individual reports with parents</p></div><button className="select-btn" onClick={() => setTestFilter(testFilter === "All students" ? "Top performers" : "All students")}>{testFilter} <ChevronDown size={14}/></button></div><div className="table-wrap"><table><thead><tr><th>RANK</th><th>STUDENT</th><th>MARKS</th><th>PERFORMANCE</th><th>CHANGE</th><th>UPDATE MARKS</th><th>REPORT</th></tr></thead><tbody>{sortedMarks.filter(m => testFilter === "All students" || m.rank <= 3).map(m => <tr key={m.id}><td><span className={`rank rank-${m.rank}`}>{String(m.rank).padStart(2,"0")}</span></td><td><div className="student-cell"><Avatar student={m}/><div><b>{m.name}</b><small>{m.className} · {m.batch}</small></div></div></td><td><b>{m.score}/{savedTest.max}</b></td><td><div className="mark-progress"><i style={{width:`${Math.max(0,Math.min(100,m.score/savedTest.max*100))}%`}}/></div><small className="test-percent">{Math.round(m.score/savedTest.max*100)}%</small></td><td><span className={m.score >= m.previous ? "growth-up" : "growth-down"}>{m.score >= m.previous ? "+" : ""}{m.score - m.previous} pts</span></td><td><div className="score-editor"><input aria-label={`Marks for ${m.name}`} type="number" min="0" max={savedTest.max} placeholder={String(m.score)} value={scoreDraft[m.id] ?? ""} onChange={e=>setScoreDraft(prev=>({...prev,[m.id]:e.target.value}))}/><button onClick={()=>saveScore(m.id)}>Save</button></div></td><td><a className="tiny-action whatsapp" href={waLink(m.phone,`Hello! ${m.name} scored ${m.score}/${savedTest.max} in ${savedTest.title} (${savedTest.subject}) and secured rank ${m.rank}. Keep encouraging them!`)} target="_blank" rel="noreferrer"><Send size={14}/> Share</a></td></tr>)}</tbody></table></div></section>
      <div className="info-note"><MessageCircle size={17}/><span><b>Parent report sharing:</b> Prepare a personalised WhatsApp report for each student. You review and send every message manually. Test data is currently a demo session.</span></div>
    </>;
  };

  const Homework = () => {
    type Assignment = { id:number; title:string; subject:string; batch:string; due:string; description:string; };
    const [assignments,setAssignments] = useState<Assignment[]>([
      {id:1,title:"Chapter 6 — Exercise 1",subject:"Mathematics",batch:"Morning A",due:"2026-11-06",description:"Complete questions 1–10 in your notebook."},
      {id:2,title:"The Solar System worksheet",subject:"Science",batch:"Evening B",due:"2026-11-07",description:"Answer all short questions and draw the labelled diagram."},
      {id:3,title:"Grammar practice",subject:"English",batch:"All batches",due:"2026-11-08",description:"Complete the tenses worksheet."}
    ]);
    const [submissions,setSubmissions] = useState<Record<number,number>>({1:1,2:0,3:1});
    const [title,setTitle] = useState("");
    const [subject,setSubject] = useState("Mathematics");
    const [batch,setBatch] = useState("All batches");
    const [due,setDue] = useState("2026-11-09");
    const [description,setDescription] = useState("");
    const [filter,setFilter] = useState("All assignments");
    const [showForm,setShowForm] = useState(false);
    const batchOptions = ["All batches",...Array.from(new Set(students.map(s=>s.batch)))];
    const assignedStudents = (item:Assignment) => students.filter(s=>item.batch==="All batches" || s.batch===item.batch);
    const totalAssigned = assignments.reduce((n,a)=>n+assignedStudents(a).length,0);
    const totalSubmitted = assignments.reduce((n,a)=>n+(submissions[a.id]||0),0);
    const createAssignment = () => {
      if(!title.trim() || !description.trim() || !due){notify("Enter homework title, instructions and due date.");return;}
      setAssignments(prev=>[{id:Date.now(),title:title.trim(),subject,batch,due,description:description.trim()},...prev]);
      setTitle("");setDescription("");setShowForm(false);notify("Homework assigned in this demo session.");
    };
    const visible = assignments.filter(a=>filter==="All assignments" || (filter==="Overdue" ? a.due<"2026-11-04" : a.batch===filter));
    return <>
      <PageTitle title="Homework" sub="Create classwork, assign it to a batch and keep track of parent and student follow-through." action={<button className="primary-btn" onClick={()=>setShowForm(v=>!v)}><Plus size={17}/> Assign homework</button>}/>
      <div className="stat-grid three">
        <div className="stat-card"><div className="stat-top"><span>Assignments</span><span className="stat-icon icon-violet"><FileText size={18}/></span></div><div className="stat-value">{assignments.length}</div><small>Homework shared with batches</small></div>
        <div className="stat-card"><div className="stat-top"><span>Students assigned</span><span className="stat-icon icon-blue"><Users size={18}/></span></div><div className="stat-value">{totalAssigned}</div><small>Across all active assignments</small></div>
        <div className="stat-card"><div className="stat-top"><span>Submission progress</span><span className="stat-icon icon-green"><CheckCircle2 size={18}/></span></div><div className="stat-value">{totalAssigned?Math.round(totalSubmitted/totalAssigned*100):0}%</div><small>{totalSubmitted} of {totalAssigned} demo submissions marked</small></div>
      </div>
      {showForm && <section className="panel homework-form"><div className="panel-head"><div><h3>Create homework</h3><p>Add clear instructions and choose the batch.</p></div><button className="icon-button" onClick={()=>setShowForm(false)}><X size={17}/></button></div><div className="homework-form-grid">
        <label>HOMEWORK TITLE<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Chapter 7 exercises"/></label>
        <label>SUBJECT<select value={subject} onChange={e=>setSubject(e.target.value)}><option>Mathematics</option><option>Science</option><option>English</option><option>Social Studies</option><option>Hindi</option></select></label>
        <label>BATCH<select value={batch} onChange={e=>setBatch(e.target.value)}>{batchOptions.map(b=><option key={b}>{b}</option>)}</select></label>
        <label>DUE DATE<input type="date" value={due} onChange={e=>setDue(e.target.value)}/></label>
        <label className="homework-instructions">INSTRUCTIONS<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Tell students what they need to complete..."/></label>
      </div><div className="test-form-actions"><button className="secondary-btn" onClick={()=>setShowForm(false)}>Cancel</button><button className="primary-btn" onClick={createAssignment}><Check size={15}/> Assign homework</button></div></section>}
      <section className="panel table-panel homework-list-panel"><div className="panel-head"><div><h3>Assigned homework</h3><p>Track work by batch and prepare parent reminders.</p></div><label className="student-filter"><Filter size={14}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All assignments</option><option>Overdue</option>{batchOptions.slice(1).map(b=><option key={b}>{b}</option>)}</select></label></div>
      <div className="homework-list">{visible.map(item=>{const group=assignedStudents(item);const done=submissions[item.id]||0;const progress=group.length?Math.min(100,done/group.length*100):0;return <article className="homework-item" key={item.id}><div className="homework-item-icon"><BookOpen size={19}/></div><div className="homework-item-main"><div className="homework-item-heading"><div><span className="homework-subject">{item.subject} · {item.batch}</span><h4>{item.title}</h4></div><span className={item.due<"2026-11-04"?"homework-due overdue":"homework-due"}>{item.due<"2026-11-04"?"Overdue":"Due"} · {new Date(item.due+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</span></div><p>{item.description}</p><div className="homework-progress-row"><div className="homework-progress"><i style={{width:progress+"%"}}/></div><small>{done}/{group.length} submitted</small></div><div className="homework-item-actions"><button className="tiny-action" onClick={()=>setSubmissions(prev=>({...prev,[item.id]:Math.min(group.length,(prev[item.id]||0)+1)}))}><Check size={13}/> Mark submission</button><button className="tiny-action whatsapp" onClick={()=>{const target=group.find((s,index)=>index>=(submissions[item.id]||0))||group[0];if(target)window.open(waLink(target.phone,"Hello! A reminder from Excellence Academy: "+item.title+" is due on "+item.due+". Please help your child complete and submit it."),"_blank","noopener,noreferrer");}}><MessageCircle size={13}/> Parent reminder</button></div></div></article>})}{visible.length===0&&<div className="empty">No homework found for this filter.</div>}</div></section>
      <div className="info-note"><AlertCircle size={17}/><span><b>Demo tracking only.</b> “Mark submission” updates the sample counter in this browser session. Parent reminders open a pre-filled WhatsApp message for you to review and send manually.</span></div>
    </>;
  };

  const Payments = () => {
    const [receiptStudent, setReceiptStudent] = useState<number | null>(null);
    const [paymentMonth, setPaymentMonth] = useState("November 2026");
    const [transactionRefs, setTransactionRefs] = useState<Record<number,string>>({});
    const paidStudents = students.filter(s => s.status === "Paid");
    const dueStudents = filtered.filter(s => s.status !== "Paid");
    const paidTotal = paidStudents.reduce((sum,s) => sum + s.fee, 0);
    const dueTotal = dueStudents.reduce((sum,s) => sum + s.fee, 0);
    const selected = students.find(s => s.id === receiptStudent);
    const confirmPayment = (student: Student) => {
      if (student.status === "Paid") { setReceiptStudent(student.id); return; }
      markPaid(student.id);
      setReceiptStudent(student.id);
    };
    const printReceipt = (student: Student) => {
      const receiptNo = "TUI-" + String(student.id).slice(-5) + "-NOV26";
      const popup = window.open("", "_blank", "width=720,height=800");
      if (!popup) { notify("Allow pop-ups to print the receipt."); return; }
      popup.document.write(`<!doctype html><html><head><title>Fee receipt ${receiptNo}</title><style>body{font:15px Arial,sans-serif;color:#20243a;padding:42px}.receipt{max-width:560px;margin:auto;border:1px solid #ddd;border-radius:16px;padding:32px}.top{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #ddd;padding-bottom:18px}h1{font-size:23px;margin:0}small{color:#777}.amount{font-size:30px;font-weight:800;margin:26px 0}.row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee}.paid{color:#16865f;font-weight:700}.foot{margin-top:28px;color:#777;font-size:12px}@media print{button{display:none}}</style></head><body><div class="receipt"><div class="top"><div><h1>Excellence Academy</h1><small>Tuition fee payment receipt</small></div><b class="paid">PAID</b></div><div class="amount">${money(student.fee)}</div><div class="row"><span>Receipt number</span><b>${receiptNo}</b></div><div class="row"><span>Student</span><b>${student.name}</b></div><div class="row"><span>Class / Batch</span><b>${student.className} · ${student.batch}</b></div><div class="row"><span>Fee month</span><b>${paymentMonth}</b></div><div class="row"><span>Payment status</span><b class="paid">Paid · Owner verified</b></div><div class="row"><span>Parent mobile</span><b>${student.phone}</b></div><p class="foot">This is a demo receipt generated after manual payment confirmation. It is not proof of a bank transaction.</p><button onclick="window.print()">Print / Save as PDF</button></div></body></html>`);
      popup.document.close();
      popup.focus();
    };
    return <>
      <PageTitle title="Payments & receipts" sub="Review pending tuition fees, manually confirm UPI payments and prepare fee receipts."/>
      <div className="stat-grid three">
        <div className="stat-card"><div className="stat-top"><span>Collected</span><span className="stat-icon icon-green"><Wallet size={18}/></span></div><div className="stat-value">{money(paidTotal)}</div><small>{paidStudents.length} students marked paid · demo</small></div>
        <div className="stat-card"><div className="stat-top"><span>Pending payments</span><span className="stat-icon icon-orange"><IndianRupee size={18}/></span></div><div className="stat-value">{money(dueTotal)}</div><small>{dueStudents.length} students awaiting confirmation</small></div>
        <div className="stat-card"><div className="stat-top"><span>Receipts available</span><span className="stat-icon icon-blue"><FileText size={18}/></span></div><div className="stat-value">{paidStudents.length}</div><small>For students marked paid</small></div>
      </div>
      <section className="panel payment-setup">
        <div className="payment-setup-copy"><span className="fee-insight-label">UPI PAYMENT INSTRUCTIONS</span><h3>Share your institute’s UPI QR</h3><p>Parents scan the institute’s own QR using GPay, PhonePe or another UPI app. Verify the credit in your bank/UPI app before marking a fee as paid.</p><div className="payment-steps"><span><b>1</b> Share QR manually</span><span><b>2</b> Verify payment yourself</span><span><b>3</b> Mark paid and issue receipt</span></div></div>
        <div className="payment-qr-placeholder"><div className="qr-grid">{Array.from({length:49},(_,i)=><i key={i} style={{opacity:((i*11)%7===0||i%4===0)?1:.2}}/>)}</div><b>QR PLACEHOLDER</b><small>Not a real payment QR</small></div>
      </section>
      <section className="panel table-panel payment-table-panel">
        <div className="panel-head"><div><h3>Pending payment verification</h3><p>Confirm only after checking your bank or UPI account.</p></div><label className="student-filter"><CalendarDays size={14}/><select value={paymentMonth} onChange={e=>setPaymentMonth(e.target.value)}><option>November 2026</option><option>December 2026</option><option>January 2027</option></select></label></div>
        <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>CLASS / BATCH</th><th>AMOUNT</th><th>TRANSACTION REF (OPTIONAL)</th><th>ACTION</th></tr></thead><tbody>{dueStudents.map(student=><tr key={student.id}><td><div className="student-cell"><Avatar student={student}/><div><b>{student.name}</b><small>{student.phone}</small></div></div></td><td><b className="table-main">{student.className}</b><small className="table-sub">{student.batch}</small></td><td><b>{money(student.fee)}</b></td><td><input className="payment-ref-input" aria-label={`Transaction reference for ${student.name}`} placeholder="UTR / reference" value={transactionRefs[student.id]||""} onChange={e=>setTransactionRefs(prev=>({...prev,[student.id]:e.target.value}))}/></td><td><button className="tiny-action payment-confirm" onClick={()=>confirmPayment(student)}><Check size={14}/> Mark paid</button></td></tr>)}</tbody></table>{dueStudents.length===0&&<div className="empty">No pending payments for the current search.</div>}</div>
      </section>
      <section className="panel table-panel receipt-history">
        <div className="panel-head"><div><h3>Paid fees & receipts</h3><p>Receipts are available only after the owner marks a payment as paid.</p></div><span className="fee-filter-label"><CheckCircle2 size={14}/> {paidStudents.length} verified in demo</span></div>
        <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>FEE MONTH</th><th>AMOUNT</th><th>STATUS</th><th>RECEIPT</th></tr></thead><tbody>{paidStudents.map(student=><tr key={student.id}><td><div className="student-cell"><Avatar student={student}/><div><b>{student.name}</b><small>{student.className} · {student.batch}</small></div></div></td><td>{paymentMonth}</td><td><b>{money(student.fee)}</b></td><td><Status value="Paid"/></td><td><button className="tiny-action whatsapp" onClick={()=>printReceipt(student)}><Download size={14}/> Print / PDF</button></td></tr>)}</tbody></table>{paidStudents.length===0&&<div className="empty">No receipts yet. Confirm a payment above to create one.</div>}</div>
      </section>
      {selected&&<div className="info-note"><CheckCircle2 size={17}/><span><b>{selected.name}’s payment is marked paid in this demo.</b> Use the receipt list’s Print / PDF action to prepare a printable receipt.</span></div>}
      <div className="info-note"><AlertCircle size={17}/><span><b>Manual verification only.</b> This screen does not receive UPI confirmations or process payments. The QR is a placeholder, transaction references are optional notes, and all payment changes are demo-only.</span></div>
    </>;
  };

  const Enquiries = () => {
    type Enquiry = { id: number; name: string; phone: string; className: string; source: string; referredBy: string; date: string; status: "New" | "Contacted" | "Visit Scheduled" | "Admitted" | "Not Interested"; note: string };
    const [items, setItems] = useState<Enquiry[]>([
      {id:1,name:"Rohan Mishra",phone:"9876501201",className:"Class 9",source:"Parent referral",referredBy:"Ananya Verma",date:"04 Nov 2026",status:"New",note:"Interested in evening batch"},
      {id:2,name:"Meera Joshi",phone:"9876501202",className:"Class 10",source:"Walk-in",referredBy:"—",date:"03 Nov 2026",status:"Contacted",note:"Asked about maths and science"},
      {id:3,name:"Kabir Khan",phone:"9876501203",className:"Class 8",source:"Student referral",referredBy:"Aarav Sharma",date:"02 Nov 2026",status:"Visit Scheduled",note:"Visit planned this week"},
      {id:4,name:"Isha Patel",phone:"9876501204",className:"Class 9",source:"WhatsApp",referredBy:"—",date:"01 Nov 2026",status:"Admitted",note:"Joined Morning B"}
    ]);
    const [name,setName]=useState("");
    const [phone,setPhone]=useState("");
    const [enquiryClass,setEnquiryClass]=useState("Class 9");
    const [source,setSource]=useState("Walk-in");
    const [referrer,setReferrer]=useState("");
    const [note,setNote]=useState("");
    const [statusFilter,setStatusFilter]=useState("All");
    const [search,setSearch]=useState("");
    const [showForm,setShowForm]=useState(false);
    const visible=items.filter(item=>(statusFilter==="All"||item.status===statusFilter)&&((item.name+" "+item.phone+" "+item.referredBy).toLowerCase().includes(search.toLowerCase())));
    const addEnquiry=()=>{
      if(!name.trim()||phone.replace(/\D/g,"").length!==10){notify("Enter a name and valid 10-digit mobile number.");return;}
      setItems(prev=>[{id:Date.now(),name:name.trim(),phone:phone.replace(/\D/g,""),className:enquiryClass,source,referredBy:referrer.trim()||"—",date:"04 Nov 2026",status:"New",note:note.trim()||"No notes added"},...prev]);
      setName("");setPhone("");setReferrer("");setNote("");setShowForm(false);notify("New enquiry added.");
    };
    const updateStatus=(id:number,status:Enquiry["status"])=>setItems(prev=>prev.map(item=>item.id===id?{...item,status}:item));
    const counts={New:items.filter(x=>x.status==="New").length,Contacted:items.filter(x=>x.status==="Contacted").length,Visit:items.filter(x=>x.status==="Visit Scheduled").length,Admitted:items.filter(x=>x.status==="Admitted").length};
    return <>
      <PageTitle title="Enquiries & referrals" sub="Capture admission enquiries, follow up with families and track which students referred them." action={<button className="primary-btn" onClick={()=>setShowForm(v=>!v)}><Plus size={15}/> Add enquiry</button>}/>
      <div className="stat-grid four">
        <div className="stat-card"><div className="stat-top"><span>New enquiries</span><span className="stat-icon icon-blue"><UserRound size={18}/></span></div><div className="stat-value">{counts.New}</div><small>Awaiting first contact</small></div>
        <div className="stat-card"><div className="stat-top"><span>Contacted</span><span className="stat-icon icon-orange"><MessageCircle size={18}/></span></div><div className="stat-value">{counts.Contacted}</div><small>Follow-up in progress</small></div>
        <div className="stat-card"><div className="stat-top"><span>Visits scheduled</span><span className="stat-icon icon-purple"><CalendarDays size={18}/></span></div><div className="stat-value">{counts.Visit}</div><small>Prospective families</small></div>
        <div className="stat-card"><div className="stat-top"><span>Admissions</span><span className="stat-icon icon-green"><CheckCircle2 size={18}/></span></div><div className="stat-value">{counts.Admitted}</div><small>Converted enquiries</small></div>
      </div>
      {showForm&&<section className="panel enquiry-form-panel"><div className="panel-head"><div><h3>Add admission enquiry</h3><p>Save parent contact details and referral source.</p></div><button className="icon-button" onClick={()=>setShowForm(false)}><X size={17}/></button></div><div className="enquiry-form-grid"><label><span>STUDENT / PARENT NAME</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter name"/></label><label><span>WHATSAPP NUMBER</span><input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} inputMode="numeric" placeholder="10-digit number"/></label><label><span>CLASS INTERESTED IN</span><select value={enquiryClass} onChange={e=>setEnquiryClass(e.target.value)}><option>Class 8</option><option>Class 9</option><option>Class 10</option><option>Class 11</option><option>Class 12</option></select></label><label><span>ENQUIRY SOURCE</span><select value={source} onChange={e=>setSource(e.target.value)}><option>Walk-in</option><option>Parent referral</option><option>Student referral</option><option>WhatsApp</option><option>Phone call</option><option>Social media</option></select></label><label><span>REFERRED BY (OPTIONAL)</span><input value={referrer} onChange={e=>setReferrer(e.target.value)} placeholder="Existing student / parent"/></label><label><span>NOTES</span><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Subject, preferred batch, etc."/></label></div><div className="enquiry-form-actions"><button className="secondary-btn" onClick={()=>setShowForm(false)}>Cancel</button><button className="primary-btn" onClick={addEnquiry}><Check size={15}/> Save enquiry</button></div></section>}
      <section className="panel table-panel enquiry-table-panel"><div className="panel-head"><div><h3>Admission pipeline</h3><p>Update each enquiry as your team follows up.</p></div><div className="enquiry-toolbar"><input aria-label="Search enquiries" placeholder="Search name or phone" value={search} onChange={e=>setSearch(e.target.value)}/><select aria-label="Filter enquiries" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All</option><option>New</option><option>Contacted</option><option>Visit Scheduled</option><option>Admitted</option><option>Not Interested</option></select></div></div>
        <div className="table-wrap"><table><thead><tr><th>ENQUIRY</th><th>CLASS</th><th>SOURCE / REFERRAL</th><th>DATE</th><th>FOLLOW-UP STATUS</th><th>ACTION</th></tr></thead><tbody>{visible.map(item=><tr key={item.id}><td><div className="student-cell"><span className="avatar avatar-blue">{item.name.split(" ").map(x=>x[0]).slice(0,2).join("")}</span><div><b>{item.name}</b><small>{item.phone}</small></div></div><small className="enquiry-note">{item.note}</small></td><td><b className="table-main">{item.className}</b></td><td><b className="table-main">{item.source}</b><small className="table-sub">{item.referredBy==="—"?"No referrer":"By "+item.referredBy}</small></td><td>{item.date}</td><td><select className="enquiry-status" value={item.status} onChange={e=>updateStatus(item.id,e.target.value as Enquiry["status"])}><option>New</option><option>Contacted</option><option>Visit Scheduled</option><option>Admitted</option><option>Not Interested</option></select></td><td><a className="tiny-action whatsapp" href={waLink(item.phone,"Hello "+item.name+", thank you for enquiring about admissions at Excellence Academy. Please let us know a convenient time to discuss classes.")} target="_blank" rel="noreferrer"><MessageCircle size={14}/> WhatsApp</a></td></tr>)}</tbody></table>{visible.length===0&&<div className="empty">No enquiries match this filter.</div>}</div>
      </section>
      <div className="info-note"><AlertCircle size={17}/><span><b>Demo workspace:</b> Enquiries and status changes stay in this screen’s temporary state. WhatsApp opens a pre-filled message for you to review and send manually.</span></div>
    </>;
  };

  const ParentLogin = () => {
    const [mobile,setMobile]=useState("");
    const [otp,setOtp]=useState("");
    const [step,setStep]=useState<"mobile"|"otp"|"success">("mobile");
    const [loginStudent,setLoginStudent]=useState<Student|null>(null);
    const [error,setError]=useState("");
    const sendOtp=()=>{
      const clean=mobile.replace(/\D/g,"");
      if(clean.length!==10){setError("Please enter a valid 10-digit mobile number.");return;}
      const match=students.find(student=>student.phone===clean);
      if(!match){setError("This number is not linked to a demo parent account.");return;}
      setLoginStudent(match);setError("");setStep("otp");notify("Demo OTP generated: use 123456.");
    };
    const verifyOtp=()=>{
      if(otp!=="123456"){setError("Incorrect demo OTP. Please enter 123456.");return;}
      setError("");setStep("success");notify("Demo parent login successful.");
    };
    const reset=()=>{setStep("mobile");setOtp("");setError("");setLoginStudent(null);};
    return <div className="parent-login-page">
      <div className="parent-login-intro"><span className="login-eyebrow"><LockKeyhole size={14}/> PARENT ACCESS</span><h2>Stay connected to your child’s learning.</h2><p>Parents can sign in to view attendance, homework, weekly test reports and fee updates from the institute.</p><div className="login-benefits"><span><ClipboardCheck size={16}/> Attendance updates</span><span><BookOpen size={16}/> Homework & classwork</span><span><GraduationCap size={16}/> Test reports & progress</span><span><Wallet size={16}/> Fees & receipts</span></div></div>
      <section className="panel parent-login-card"><div className="login-brand-mark"><GraduationCap size={22}/></div><h3>{step==="mobile"?"Parent login":step==="otp"?"Verify your number":"You’re signed in!"}</h3><p>{step==="mobile"?"Enter the WhatsApp mobile number registered with the institute.":step==="otp"?"Enter the 6-digit demo OTP sent to +91 "+mobile:"Welcome, "+(loginStudent?.name||"Parent")+"’s family."}</p>
        {step==="mobile"&&<><label className="field-label">REGISTERED MOBILE NUMBER</label><div className="login-mobile-field"><span>+91</span><input value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,"").slice(0,10))} inputMode="numeric" placeholder="10-digit mobile number" maxLength={10}/></div><button className="primary-btn full-btn login-submit" onClick={sendOtp}>Continue <ArrowUpRight size={16}/></button><small className="login-hint">Use a sample parent number listed in the demo Students screen.</small></>}
        {step==="otp"&&<><label className="field-label">6-DIGIT OTP</label><input className="login-otp-input" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" maxLength={6} placeholder="Enter 123456"/><button className="primary-btn full-btn login-submit" onClick={verifyOtp}>Verify & sign in <Check size={16}/></button><button className="login-back" onClick={reset}>Change mobile number</button></>}
        {step==="success"&&<><div className="login-success"><CheckCircle2 size={24}/><b>Demo login complete</b><span>{loginStudent?.className} · {loginStudent?.batch}</span></div><button className="primary-btn full-btn login-submit" onClick={()=>{setPortalStudent(loginStudent?.name||"");setActive("Parent Portal");}}>Open parent portal <ArrowUpRight size={16}/></button><button className="login-back" onClick={reset}>Sign in with another number</button></>}
        {error&&<div className="login-error"><AlertCircle size={15}/>{error}</div>}
        <div className="login-security"><LockKeyhole size={13}/> Demo only · No real OTP or account authentication</div>
      </section>
    </div>;
  };

  const ParentDashboard = () => {
    const child=students.find(s=>s.name===portalStudent)||students[0];
    const [section,setSection]=useState("Overview");
    const [homeworkDone,setHomeworkDone]=useState<number[]>([1]);
    const tasks=[{id:1,title:"Complete algebra exercise 5",subject:"Mathematics",due:"05 Nov 2026",status:"Submitted"},{id:2,title:"Read chapter 7 and answer questions",subject:"Science",due:"06 Nov 2026",status:"Pending"},{id:3,title:"English essay – My favourite book",subject:"English",due:"07 Nov 2026",status:"Pending"}];
    const taskList=tasks.map(t=>({...t,status:homeworkDone.includes(t.id)?"Submitted":t.status}));
    return <>
      <PageTitle title="Parent dashboard" sub="A parent-side view of one child’s attendance, homework, test progress and fee updates." action={<span className="preview-label"><span/> DEMO PARENT ACCOUNT</span>}/>
      <div className="parent-dashboard-wrap">
        <section className="parent-dashboard-welcome"><div><span>WELCOME BACK</span><h2>Hello, Parent 👋</h2><p>Here is the latest learning update for {child.name}.</p><div className="parent-dashboard-child"><Avatar student={child}/><div><b>{child.name}</b><small>{child.className} · {child.batch}</small></div></div></div><label>VIEW CHILD<select value={portalStudent} onChange={e=>setPortalStudent(e.target.value)}>{students.map(st=><option key={st.id}>{st.name}</option>)}</select></label></section>
        <div className="parent-dashboard-tabs">{["Overview","Attendance","Homework","Tests","Fees"].map(tab=><button key={tab} className={section===tab?"selected":""} onClick={()=>setSection(tab)}>{tab}</button>)}</div>
        {section==="Overview"&&<>
          <div className="stat-grid four parent-dash-stats"><div className="stat-card"><div className="stat-top"><span>Attendance</span><span className="stat-icon icon-green"><ClipboardCheck size={17}/></span></div><div className="stat-value">92%</div><small>Good standing · demo</small></div><div className="stat-card"><div className="stat-top"><span>Latest test</span><span className="stat-icon icon-purple"><GraduationCap size={17}/></span></div><div className="stat-value">88/100</div><small>Mathematics · 01 Nov</small></div><div className="stat-card"><div className="stat-top"><span>Homework</span><span className="stat-icon icon-blue"><BookOpen size={17}/></span></div><div className="stat-value">{homeworkDone.length}/3</div><small>Tasks submitted · demo</small></div><div className="stat-card"><div className="stat-top"><span>Fee status</span><span className="stat-icon icon-orange"><Wallet size={17}/></span></div><div className="stat-value">{child.status==="Paid"?"Paid":money(child.fee)}</div><small>{child.status==="Paid"?"November fee marked paid":"November fee pending · demo"}</small></div></div>
          <div className="parent-dash-columns"><section className="panel"><div className="panel-head"><div><h3>Recent learning updates</h3><p>Latest activity from the institute</p></div></div><div className="parent-dash-update"><CheckCircle2/><div><b>Attendance marked {child.attendance.toLowerCase()}</b><small>04 Nov 2026 · Today's register</small></div></div><div className="parent-dash-update"><GraduationCap/><div><b>Mathematics test report available</b><small>01 Nov 2026 · 88 out of 100 · Demo</small></div></div><div className="parent-dash-update"><BookOpen/><div><b>New homework assigned</b><small>Mathematics · Due 05 Nov 2026</small></div></div></section><section className="panel parent-fee-summary"><h3>November fee</h3><div className="parent-fee-amount">{money(child.fee)}</div><Status value={child.status}/><p>{child.status==="Paid"?"Payment marked paid in demo.":"Please contact the institute for payment instructions."}</p><small>Payment status is shown for information only.</small></section></div>
        </>}
        {section==="Attendance"&&<section className="panel parent-dash-panel"><div className="panel-head"><div><h3>Attendance summary</h3><p>Sample attendance record for {child.name}</p></div><span className="status status-success"><i/> 92% attendance</span></div><div className="parent-attendance-bar"><span style={{width:"92%"}}/></div><div className="parent-attendance-legend"><span>Present <b>23 days</b></span><span>Absent <b>2 days</b></span></div><div className="parent-dash-update"><CheckCircle2/><div><b>04 Nov 2026 · {child.attendance}</b><small>Today's attendance status</small></div></div></section>}
        {section==="Homework"&&<section className="panel parent-dash-panel"><div className="panel-head"><div><h3>Homework assignments</h3><p>Track and update sample task status</p></div></div>{taskList.map(task=><div className="parent-homework-row" key={task.id}><div><b>{task.title}</b><small>{task.subject} · Due {task.due}</small></div><button className={task.status==="Submitted"?"homework-submitted":"tiny-action"} disabled={task.status==="Submitted"} onClick={()=>setHomeworkDone(prev=>[...prev,task.id])}>{task.status==="Submitted"?"Submitted":"Mark submitted"}</button></div>)}</section>}
        {section==="Tests"&&<section className="panel parent-dash-panel"><div className="panel-head"><div><h3>Weekly test report</h3><p>Latest sample performance</p></div><span className="preview-label">DEMO REPORT</span></div><div className="parent-test-score"><b>88</b><span>/ 100</span><small>Mathematics · 01 Nov 2026</small></div><div className="parent-attendance-bar"><span style={{width:"88%"}}/></div><p className="muted-copy">Good progress this week. Keep practising to improve further.</p></section>}
        {section==="Fees"&&<section className="panel parent-dash-panel"><div className="panel-head"><div><h3>Fee details</h3><p>November 2026 tuition fee</p></div><Status value={child.status}/></div><div className="parent-fee-amount">{money(child.fee)}</div><p className="muted-copy">Due date: 05 Nov 2026 · Demo status only</p><div className="info-note"><AlertCircle size={16}/><span>Ask the institute for its official UPI QR. Never treat this demo screen as proof of payment.</span></div></section>}
        <div className="info-note"><AlertCircle size={16}/><span><b>Demo parent dashboard:</b> All attendance, marks, homework and fee details are sample data. Changes made here are temporary and are not saved to an account.</span></div>
      </div>
    </>;
  };

  const ParentPortal = () => {
    const child = students.find(s => s.name === portalStudent) || students[0];
    return <><PageTitle title="Parent portal preview" sub="See the simple, clear experience parents will get for their child." action={<span className="preview-label"><span/> PARENT VIEW</span>}/><div className="portal-layout"><div className="portal-phone"><div className="phone-top"><span>9:41</span><span>● ● ●</span></div><div className="parent-app-head"><div className="parent-brand"><div className="brand-mark"><GraduationCap size={17}/></div><b>tuition<span>app</span></b></div><div className="parent-avatar">{child.initials}</div></div><div className="welcome-card"><small>GOOD MORNING 👋</small><h2>Hi, Parent!</h2><p>Here’s how {child.name.split(" ")[0]} is doing today.</p><div className="child-select"><Avatar student={child} small/><b>{child.name}</b><ChevronDown size={15}/></div></div><div className="parent-mini-grid"><div><span className="mini-icon mint"><ClipboardCheck size={17}/></span><small>Attendance</small><b>92%</b><em>Good standing</em></div><div><span className="mini-icon lavender"><GraduationCap size={17}/></span><small>Latest score</small><b>88/100</b><em>↑ 7 points</em></div></div><div className="parent-section-title"><b>Fee status</b><span>View details</span></div><div className="parent-fee-card"><div><span className="status status-warning"><i/> Payment due</span><h3>{money(child.fee)}</h3><small>November 2026 tuition fee</small></div><div className="qr-placeholder"><div className="qr-grid">{Array.from({length:25},(_,i)=><i key={i} style={{opacity: ((i*7)%5===0 || i%3===0) ? 1 : .22}}/>)}</div><small>DEMO QR</small></div><p className="qr-disclaimer">Demo placeholder only — not a real payment QR.</p><button className="parent-pay" onClick={() => notify("Demo only: connect the institute's real UPI QR in the backend phase.")}>Pay by UPI <ArrowUpRight size={14}/></button></div><div className="parent-section-title"><b>Recent updates</b><span>See all</span></div><div className="parent-update"><span className="update-icon mint"><CheckCircle2 size={16}/></span><div><b>Attendance marked present</b><small>Today · 9:00 AM</small></div></div><div className="parent-update"><span className="update-icon lavender"><FileText size={16}/></span><div><b>Mathematics test result</b><small>01 Nov · Scored 88/100</small></div></div><div className="parent-bottom-nav"><span className="active"><Home size={17}/>Home</span><span><ClipboardCheck size={17}/>Attendance</span><span><BookOpen size={17}/>Homework</span><span><UserRound size={17}/>Profile</span></div></div><div className="portal-details"><div className="panel portal-control"><div className="panel-head"><div><h3>Preview as a parent</h3><p>Switch between demo student accounts</p></div></div><label className="field-label">SELECT STUDENT</label><select value={portalStudent} onChange={e => setPortalStudent(e.target.value)}>{students.map(s => <option key={s.id}>{s.name}</option>)}</select><div className="portal-feature-list"><h4>Everything parents can access</h4><div><CheckCircle2/> Attendance history and absence updates</div><div><CheckCircle2/> Homework and class announcements</div><div><CheckCircle2/> Weekly test marks, rank and progress</div><div><CheckCircle2/> Monthly fee status and due dates</div><div><CheckCircle2/> Institute UPI QR and payment instructions</div><div><CheckCircle2/> Downloadable receipts after owner verification</div></div><div className="info-note compact"><AlertCircle size={16}/><span>This is a frontend preview with sample data. No real payment is processed.</span></div></div><div className="panel portal-control"><h3>Parent communication</h3><p className="muted-copy">Messages are prepared in WhatsApp and sent by the institute owner.</p><a className="primary-btn full-btn" href={waLink(child.phone, `Hello! Here is ${child.name}'s weekly learning update from Excellence Academy.`)} target="_blank" rel="noreferrer"><MessageCircle size={16}/> Preview WhatsApp message</a></div></div></div></>;
  };

  return <div className="app-shell"><Sidebar/><main className="main-area"><Header/><div className="page-content">{active === "Overview" ? <Overview/> : active === "Students" ? <Students/> : active === "Batches" ? <Batches/> : active === "Fees Pending" ? <Fees/> : active === "Attendance" ? <Attendance/> : active === "Weekly Tests" ? <Tests/> : active === "Homework" ? <Homework/> : active === "Payment & Receipts" ? <Payments/> : active === "Enquiries / Referrals" ? <Enquiries/> : active === "Parent Login" ? <ParentLogin/> : active === "Parent Dashboard" ? <ParentDashboard/> : <ParentPortal/>}<footer>© 2026 TuitionApp <span>Made for better learning experiences</span></footer></div></main>{showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}><div className="modal" onClick={e => e.stopPropagation()}><div className="modal-head"><div><h3>Add a student</h3><p>Add a student to your demo workspace.</p></div><button className="icon-button" onClick={() => setShowAdd(false)}><X size={18}/></button></div><label className="field-label">STUDENT NAME</label><input className="modal-input" placeholder="e.g. Riya Sharma" value={newName} onChange={e => setNewName(e.target.value)}/><label className="field-label">CLASS</label><select className="modal-input" value={newClass} onChange={e => setNewClass(e.target.value)}><option>Class 8</option><option>Class 9</option><option>Class 10</option><option>Class 11</option><option>Class 12</option></select><label className="field-label">BATCH NAME</label><input className="modal-input" placeholder="e.g. Morning A" value={newBatch} onChange={e => setNewBatch(e.target.value)}/><label className="field-label">PARENT WHATSAPP NUMBER</label><input className="modal-input" placeholder="10-digit mobile number" inputMode="numeric" maxLength={10} value={newPhone} onChange={e => setNewPhone(e.target.value.replace(/\D/g, "").slice(0,10))}/><button className="primary-btn full-btn" onClick={addStudent}>Add student <Plus size={16}/></button></div></div>}{toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}</div>;
}
