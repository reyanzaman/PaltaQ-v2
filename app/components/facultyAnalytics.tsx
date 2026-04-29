/* eslint-disable react/no-unescaped-entities */
"use client";

/**
 * FacultyAnalytics.tsx
 *
 * Drop-in analytics panel for the faculty dashboard.
 *
 * USAGE — inside facultyclass.tsx, after the AI Summary block:
 *
 *   import FacultyAnalytics from "./FacultyAnalytics";
 *
 *   // inside the JSX where selectedClass is truthy:
 *   <FacultyAnalytics selectedClass={selectedClass} currentUserId={user.id} />
 *
 * DATA REQUIREMENTS
 * -----------------
 * The component calls two existing API endpoints:
 *   GET /api/questions?cid={classId}
 *     → expects array of Question objects (see interface below)
 *   GET /api/classes/student?cid={classId}   ← optional, falls back to
 *     selectedClass.enrollments if the endpoint is unavailable
 *
 * Each Question object must carry:
 *   { id, userId, question, score, likes, dislikes, createdAt,
 *     questionType: QuestionType[], category }
 *
 * Each QuestionType object:
 *   { remembering, understanding, applying, analyzing, evaluating, creating }
 */

import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faFire,
  faMedal,
  faUsers,
  faChevronDown,
  faChevronUp,
  faArrowTrendUp,
} from "@fortawesome/free-solid-svg-icons";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionType {
  remembering: boolean;
  understanding: boolean;
  applying: boolean;
  analyzing: boolean;
  evaluating: boolean;
  creating: boolean;
}

interface Question {
  id: string;
  userId: string;
  question: string;
  score: number;
  likes: number;
  dislikes: number;
  paltaQ: number;

  llama_score: number;
  quban_score: number;

  createdAt: string;
  category: string;
  questionType: QuestionType[];
  user?: { name: string; id: string };
}

interface ClassEnrollment {
  userId: string;
  score: number;
  rank: string;
  questionCount: number;
  paltaQCount: number;
  user: { id: string; name: string; is_Faculty: boolean };
}

interface SelectedClass {
  id: string;
  name: string;
  enrollments: ClassEnrollment[];
}

interface Props {
  selectedClass: SelectedClass;
  currentUserId: string;
}

// ─── Bloom colours (matches student dashboard palette) ────────────────────────

const BLOOM_COLORS = [
  {
    bg: "rgba(255, 200, 200, 0.7)",
    border: "rgba(239,68,68,1)",
    label: "Remembering",
  },
  {
    bg: "rgba(255, 219, 193, 0.7)",
    border: "rgba(249,115,22,1)",
    label: "Understanding",
  },
  { bg: "rgba(255, 243, 207, 0.7)", border: "rgba(234,179,8,1)", label: "Applying" },
  {
    bg: "rgba(186, 255, 211, 0.7)",
    border: "rgba(34,197,94,1)",
    label: "Analyzing",
  },
  {
    bg: "rgba(180, 209, 255, 0.7)",
    border: "rgba(59,130,246,1)",
    label: "Evaluating",
  },
  {
    bg: "rgba(223, 188, 255, 0.7)",
    border: "rgba(168,85,247,1)",
    label: "Creating",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLast7Days(): { date: string; dayName: string }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });
}

function countBlooms(questions: Question[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0];
  questions.forEach((q) => {
    (q.questionType ?? []).forEach((t) => {
      if (t.remembering) counts[0]++;
      if (t.understanding) counts[1]++;
      if (t.applying) counts[2]++;
      if (t.analyzing) counts[3]++;
      if (t.evaluating) counts[4]++;
      if (t.creating) counts[5]++;
    });
  });
  return counts;
}

// ─── Component ────────────────────────────────────────────────────────────────

const FacultyAnalytics: React.FC<Props> = ({
  selectedClass,
  currentUserId,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Chart refs
  const bloomPieRef = useRef<HTMLCanvasElement>(null);
  const bloomPieChart = useRef<Chart | null>(null);

  const trendLineRef = useRef<HTMLCanvasElement>(null);
  const trendLineChart = useRef<Chart | null>(null);

  const bloomBarRef = useRef<HTMLCanvasElement>(null);
  const bloomBarChart = useRef<Chart | null>(null);

  // ── Fetch questions ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedClass?.id) return;
    setLoadingQ(true);
    fetch(`/api/questions?cid=${selectedClass.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const arr: Question[] = Array.isArray(data)
          ? data
          : (data.questions ?? []);
        setQuestions(arr);
      })
      .catch(() => setQuestions([]))
      .finally(() => setLoadingQ(false));
  }, [selectedClass?.id]);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const students = selectedClass.enrollments.filter(
    (e) => !e.user.is_Faculty && e.user.id !== currentUserId,
  );

  const totalQuestions = questions.filter(
    (q) => q.category !== "Palta" && q.category !== "PaltaPalta",
  ).length;
  const totalPaltaQ = questions.filter(
    (q) => q.category === "Palta" || q.category === "PaltaPalta",
  ).length;

  const bloomTotals = countBlooms(questions);
  const bloomTotal = bloomTotals.reduce((a, b) => a + b, 0);

  // Top 5 most active students by questionCount + paltaQCount
  const topStudents = [...students]
    .sort(
      (a, b) =>
        b.questionCount + b.paltaQCount - (a.questionCount + a.paltaQCount),
    )
    .slice(0, 5);

  // Students with 0 questions (potentially disengaged)
  const quietStudents = students.filter(
    (s) => s.questionCount === 0 && s.paltaQCount === 0,
  );

  // ── Chart: Bloom donut ──────────────────────────────────────────────────────
  useEffect(() => {
    if (collapsed || loadingQ) return;
    const ctx = bloomPieRef.current?.getContext("2d");
    if (!ctx) return;

    bloomPieChart.current?.destroy();
    bloomPieChart.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: BLOOM_COLORS.map((c) => c.label),
        datasets: [
          {
            data: bloomTotals,
            backgroundColor: BLOOM_COLORS.map((c) => c.bg),
            borderColor: BLOOM_COLORS.map((c) => c.border),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
            labels: { boxWidth: 12, font: { size: 11 } },
          },
          tooltip: {
            callbacks: {
              label: (item) => {
                const val = item.raw as number;
                const pct =
                  bloomTotal > 0 ? ((val / bloomTotal) * 100).toFixed(1) : "0";
                return ` ${item.label}: ${val} (${pct}%)`;
              },
            },
          },
        },
      },
    });
    return () => bloomPieChart.current?.destroy();
  }, [questions, collapsed, loadingQ]);

  // ── Chart: 7-day activity trend (line) ─────────────────────────────────────
  useEffect(() => {
    if (collapsed || loadingQ) return;
    const ctx = trendLineRef.current?.getContext("2d");
    if (!ctx) return;

    const days = getLast7Days();
    const qByDay: Record<string, number> = Object.fromEntries(
      days.map((d) => [d.date, 0]),
    );
    const pByDay: Record<string, number> = Object.fromEntries(
      days.map((d) => [d.date, 0]),
    );

    questions.forEach((q) => {
      const day = new Date(q.createdAt).toISOString().split("T")[0];
      if (q.category === "Palta" || q.category === "PaltaPalta") {
        if (day in pByDay) pByDay[day]++;
      } else {
        if (day in qByDay) qByDay[day]++;
      }
    });

    trendLineChart.current?.destroy();
    trendLineChart.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: days.map((d) => d.dayName),
        datasets: [
          {
            label: "Questions",
            data: days.map((d) => qByDay[d.date]),
            backgroundColor: "rgba(59,130,246,0.2)",
            borderColor: "rgba(59,130,246,1)",
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointRadius: 3,
          },
          {
            label: "PaltaQ",
            data: days.map((d) => pByDay[d.date]),
            backgroundColor: "rgba(168,85,247,0.15)",
            borderColor: "rgba(168,85,247,1)",
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
            labels: { boxWidth: 12, font: { size: 11 } },
          },
        },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    });
    return () => trendLineChart.current?.destroy();
  }, [questions, collapsed, loadingQ]);

  // ── Chart: Bloom per-level bar ──────────────────────────────────────────────
  useEffect(() => {
    if (collapsed || loadingQ) return;
    const ctx = bloomBarRef.current?.getContext("2d");
    if (!ctx) return;

    bloomBarChart.current?.destroy();
    bloomBarChart.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: BLOOM_COLORS.map((c) => c.label),
        datasets: [
          {
            label: "Questions",
            data: bloomTotals,
            backgroundColor: BLOOM_COLORS.map((c) => c.bg),
            borderColor: BLOOM_COLORS.map((c) => c.border),
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    });
    return () => bloomBarChart.current?.destroy();
  }, [questions, collapsed, loadingQ]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="border border-gray-400 rounded-lg py-4 mb-5 mt-5 w-full px-3">
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between cursor-pointer select-none px-1 py-1 rounded hover:bg-gray-50 transition-colors duration-200"
        onClick={() => setCollapsed((c) => !c)}
      >
        <h5 className="mb-0 flex items-center gap-2">
          <FontAwesomeIcon icon={faChartBar} className="text-blue-600" />
          Class Analytics
        </h5>
        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
          {collapsed ? (
            <>
              <FontAwesomeIcon icon={faChevronDown} className="mr-1" />
              Show
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faChevronUp} className="mr-1" />
              Hide
            </>
          )}
        </span>
      </div>

      {!collapsed && (
        <>
          {loadingQ ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              Loading analytics…
            </div>
          ) : questions.length === 0 ? (
            <p className="text-gray-500 text-sm mt-3 px-1">
              No questions yet — analytics will appear once students start
              asking.
            </p>
          ) : (
            <div className="mt-4 space-y-6">
              {/* ── Stat pills ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatPill
                  icon={<FontAwesomeIcon icon={faUsers} />}
                  label="Students"
                  value={students.length}
                  color="grey"
                />
                <StatPill
                  icon={<FontAwesomeIcon icon={faFire} />}
                  label="Questions"
                  value={totalQuestions}
                  color="grey"
                />
                <StatPill
                  icon={<FontAwesomeIcon icon={faArrowTrendUp} />}
                  label="PaltaQ"
                  value={totalPaltaQ}
                  color="grey"
                />
                <StatPill
                  icon={<FontAwesomeIcon icon={faMedal} />}
                  label="Bloom Tags"
                  value={bloomTotal}
                  color="grey"
                />
              </div>

              {/* ── Charts row ── */}
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
                {/* Bloom donut */}
                <div
                  className="rounded-lg p-4"
                  style={{ border: "1px solid #e5e7eb", background: "#fafafa" }}
                >
                  <h6 className="font-semibold text-gray-700 text-sm">
                    Bloom's Taxonomy Distribution
                  </h6>
                  <div style={{ position: "relative", height: "280px" }}>
                    <canvas ref={bloomPieRef} />
                  </div>
                  {/* Bloom legend pills */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {BLOOM_COLORS.map((c, i) => (
                      <span
                        key={c.label}
                        className="text-sm font-semibold px-4 py-0.5 rounded-full"
                        style={{
                          background: c.bg,
                          color: "#1d1d1dff",
                          border: `1px solid ${c.border}`,
                        }}
                      >
                        {c.label}: {bloomTotals[i]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 7-day trend */}
                <div
                  className="rounded-lg p-4"
                  style={{ border: "1px solid #e5e7eb", background: "#fafafa" }}
                >
                  <h6 className="font-semibold text-gray-700 mb-3 text-sm">
                    7-Day Activity Trend
                  </h6>
                  <div style={{ position: "relative", height: "300px" }}>
                    <canvas ref={trendLineRef} />
                  </div>
                </div>
              </div>

              {/* Bloom bar (full width)
              <div
                className="rounded-lg p-4"
                style={{ border: "1px solid #e5e7eb", background: "#fafafa" }}
              >
                <h6 className="font-semibold text-gray-700 mb-3 text-sm">
                  Bloom's Level Breakdown
                </h6>
                <div style={{ position: "relative", height: "240px" }}>
                  <canvas ref={bloomBarRef} />
                </div>
              </div> */}

              {/* ── Top students ── */}
              <div
                className="rounded-lg p-4"
                style={{ border: "1px solid #e5e7eb", background: "#ebebebff" }}
              >
                <h6 className="font-semibold text-gray-700 mb-3 text-sm flex items-center gap-2">
                  <FontAwesomeIcon icon={faMedal} className="text-amber-500" />
                  Highly Engaged Students
                </h6>
                {topStudents.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No student activity yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-sm w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left font-semibold text-gray-600">
                            #
                          </th>
                          <th className="text-left font-semibold text-gray-600">
                            Name
                          </th>
                          <th className="text-left font-semibold text-gray-600">
                            Questions
                          </th>
                          <th className="text-left font-semibold text-gray-600">
                            PaltaQ
                          </th>
                          <th className="text-left font-semibold text-gray-600">
                            Score
                          </th>
                          <th className="text-left font-semibold text-gray-600">
                            Rank
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {topStudents.map((s, i) => (
                          <tr key={s.userId}>
                            <td className="text-left">
                              {i === 0
                                ? "🥇"
                                : i === 1
                                  ? "🥈"
                                  : i === 2
                                    ? "🥉"
                                    : `${i + 1}`}
                            </td>
                            <td className="font-semibold text-gray-800">
                              {s.user.name}
                            </td>
                            <td>{s.questionCount}</td>
                            <td>{s.paltaQCount}</td>
                            <td>{s.score}</td>
                            <td>
                              <span
                                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{
                                  background: "#e8eaf0ff",
                                  color: "#3730a3",
                                }}
                              >
                                {s.rank}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Quiet students ── */}
              {quietStudents.length > 0 && (
                <div
                  className="rounded-lg p-4"
                  style={{
                    border: "1px solid #e8e8e8ff",
                    background: "#fafafaC",
                  }}
                >
                  <h6 className="font-semibold text-grey-700 mb-2 text-sm">
                    ⚠️ Low-Participation Students ({quietStudents.length})
                  </h6>
                  <p className="text-xs text-grey-600 mb-6">
                    These students have not asked any questions or PaltaQ yet.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {quietStudents.map((s) => (
                      <span
                        key={s.userId}
                        className="text-xs px-2 py-1 rounded-full font-semibold"
                        style={{
                          background: "#f2f2f2ff",
                          color: "#4e4e4eff",
                          border: "1px solid #e0e0e0ff",
                        }}
                      >
                        {s.user.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Discussion pattern summary ── */}
              <DiscussionPatterns questions={questions} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── StatPill ────────────────────────────────────────────────────────────────

const PILL_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  blue: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  orange: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  purple: { bg: "#faf5ff", text: "#7e22ce", border: "#e9d5ff" },
  green: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  grey: { bg: "#f9fafb", text: "#374151", border: "#e5e7eb" },
};

const StatPill: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}> = ({ icon, label, value, color }) => {
  const c = PILL_COLORS[color] ?? PILL_COLORS.blue;
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl py-3 px-2 text-center"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <span style={{ color: c.text, fontSize: "1.15rem" }}>{icon}</span>
      <span
        className="font-bold mt-1"
        style={{ color: c.text, fontSize: "1.4rem", lineHeight: 1.1 }}
      >
        {value}
      </span>
      <span className="text-xs font-bold text-gray-800 mt-0.5">{label}</span>
    </div>
  );
};

// ─── DiscussionPatterns ───────────────────────────────────────────────────────
// Computes simple engagement metrics from question data alone (no extra API call).

const DiscussionPatterns: React.FC<{ questions: Question[] }> = ({
  questions,
}) => {
  if (questions.length === 0) return null;

  // Average score
  const avgScore =
    questions.reduce((s, q) => s + q.score, 0) / questions.length;

  // Category breakdown
  const cats: Record<string, number> = {};
  questions.forEach((q) => {
    cats[q.category] = (cats[q.category] ?? 0) + 1;
  });

  // Unique participants
  const uniqueAskers = new Set(questions.map((q) => q.userId)).size;

  return (
    <div
      className="rounded-lg p-4"
      style={{ border: "1px solid #ebebebff", background: "#fafafa" }}
    >
      <h6 className="font-semibold text-gray-700 mb-3 text-sm">
        Discussion Patterns
      </h6>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-center text-sm">
        <PatternStat label="Avg Final Question Score" value={avgScore.toFixed(1)} />
        <PatternStat
          label="Avg Score Comparison"
          value=""
          custom={<ScoreComparison questions={questions} />}
        />
        <PatternStat
          label="Unique Participants in Single Question"
          value={String(uniqueAskers)}
        />
      </div>
    </div>
  );
};

const PatternStat: React.FC<{
  label: string;
  value: string;
  sub?: string;
  custom?: React.ReactNode;
}> = ({ label, value, sub, custom }) => (
  <div
    className="rounded-lg p-3 flex flex-col items-center justify-center"
    style={{ background: "#ffffffff", border: "1px solid #e2e4e7ff" }}
  >
    <span className="text-sm text-gray-800 mb-1 font-semibold">{label}</span>
    {custom ?? (
      <>
        <span className="font-bold text-gray-800 text-base">{value}</span>
      </>
    )}
  </div>
);

const ScoreComparison: React.FC<{ questions: Question[] }> = ({
  questions,
}) => {
  if (!questions.length)
    return <span className="text-sm text-gray-500">No data</span>;

  const avg = (key: "quban_score" | "llama_score" | "score") => {
    if (!questions.length) return 0;
    return (
      questions.reduce((sum, q) => sum + (q[key] ?? 0), 0) / questions.length
    );
  };

  const quban = avg("quban_score");
  const llama = avg("llama_score");
  const human = avg("score");

  const format = (v: number) => v.toFixed(1);

  return (
    <div className="text-base font-semibold text-gray-800 mt-1 text-center leading-snug flex items-center justify-center gap-4 w-full">
      <div>Quban: {format(quban)}</div>
      <div>Llama: {format(llama)}</div>
    </div>
  );
};

export default FacultyAnalytics;
