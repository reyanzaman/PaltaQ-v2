/* eslint-disable react/no-unescaped-entities */
"use client";

/// <reference types="react" />

import { nunito } from "@/app/ui/fonts";
import React, { useEffect, useState, useRef } from "react";
import FacultyAnalytics from "./facultyAnalytics";

declare global {
  // Provide a fallback IntrinsicElements so JSX elements like <div> are recognized
  // when the project's global JSX types aren't available to this file.
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleChevronUp,
  faSpinner,
  faRotateRight,
  faLightbulb,
  faBrain,
  faTriangleExclamation,
  faStar,
  faChalkboardTeacher,
} from "@fortawesome/free-solid-svg-icons";

// Use a minimal Topic type locally to avoid importing @prisma/client in client bundle
interface Topic {
  id: string;
  name: string;
  classId: string;
}

interface User {
  id: string;
  name: string;
  image: string;
  email: string;
  is_Admin: boolean;
  is_Faculty: boolean;
  createdAt: string;
  updatedAt: string;
  classes: ClassEnrollment[];
}

interface Class {
  id: string;
  name: string;
  code: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  endsAt: string;
  enrollments: ClassEnrollment[];
  questionnaire: boolean;
  status: boolean;
}

interface ClassFaculty {
  id: string;
  userId: string;
  classId: string;
  user: User;
  class: Class;
}

interface ClassEnrollment {
  id: string;
  userId: string;
  classId: string;
  user: User;
  score: number;
  rank: string;
  questionCount: number;
  paltaQCount: number;
  preQuestionnaire?: { isCompleted: boolean };
  postQuestionnaire?: { isCompleted: boolean };
}

// ─── AI Summary Types ────────────────────────────────────────────────────────
interface ClassSummary {
  summary: string;
  themes: string[];
  misconceptions: string[];
  topQuestions: string[];
  teacherTip?: string;
}

const FacultyClass: React.FC<{ user: User }> = ({ user }) => {
  const [classes, setClasses] = useState<ClassFaculty[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class>();
  const [topics, setTopics] = useState<Topic[]>([]);

  const [className, setClassName] = useState("" as string);
  const [classStartTime, setClassStartTime] = useState("" as string);
  const [classEndTime, setClassEndTime] = useState("" as string);
  const [classDays, setClassDays] = useState<string[]>([]);
  const [classTopic, setClassTopic] = useState("" as string);
  const [topicName, setTopicName] = useState("" as string);

  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  // ─── AI Summary State ────────────────────────────────────────────────────
  const [classSummary, setClassSummary] = useState<ClassSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const summaryCache = useRef<Record<string, ClassSummary>>({});
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const [enrollmentCollapsed, setEnrollmentCollapsed] = useState(false);
  const [questionnaireCollapsed, setQuestionnaireCollapsed] = useState(false);

  const [toggleDelete, setToggleDelete] = useState(null as any);
  const [toggleTopicDelete, setToggleTopicDelete] = useState(null as any);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [toggleRemove, setToggleRemove] = useState(null as any);
  const [editIndex, setEditIndex] = useState(null);

  const [newClassName, setNewClassName] = useState("" as string);
  const [newClassDate, setNewClassDate] = useState("" as string);
  const [newClassQuestionnaire, setNewClassQuestionnaire] = useState(
    false as boolean,
  );
  const [newClassStatus, setNewClassStatus] = useState(true as boolean);
  const [newClassStartTime, setNewClassStartTime] = useState("" as string);
  const [newClassEndTime, setNewClassEndTime] = useState("" as string);
  const [newClassDays, setNewClassDays] = useState<string[]>([]);
  const [toggleUpdate, setToggleUpdate] = useState(null as any);

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/classes?id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        } else {
          // Handle error
          console.error("Failed to fetch classes");
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        setLoading(false);
      }
      setLoading(false);
    };

    const fetchTopics = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/topics?cid=${selectedClass?.id}`);
        if (response.ok) {
          const data = await response.json();
          setTopics(data);
        } else {
          // Handle error
          console.error("Failed to fetch classes");
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        setLoading(false);
      }
      setLoading(false);
    };

    fetchClasses();
    fetchTopics();
  }, [refresh]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const createClass = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (className == "") {
      toast.error("Please enter a class name");
      return;
    }

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          className: className,
          facultyId: user.id,
          startTime: classStartTime || null,
          endTime: classEndTime || null,
          activeDays: classDays,
        }),
      });

      const responseText = await response.json();

      if (response.ok) {
        setClassName("");
        setClassStartTime("");
        setClassEndTime("");
        setClassDays([]);
        setRefresh(!refresh);
        toast.success(responseText.message);
      } else {
        // Handle error
        console.error("Failed to submit class details");
        toast.error(responseText.message);
      }
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };

  const selectClass = (index: any) => {
    setSelectedClass(classes[index].class);
    if (selectedClass === classes[index].class) {
      setSelectedClass(undefined);
    }
  };

  const deleteClass = async (index: any) => {
    try {
      const response = await fetch(
        `/api/classes?id=${classes[index].class.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        setRefresh(!refresh);
        toast.success("Class deleted");
      } else {
        // Handle error
        console.error("Failed to delete class");
        toast.error("Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
    }
    setToggleDelete(null);
  };

  const updateClass = async (index: any) => {
    if (newClassName == "") {
      toast.error("Class name cannot be blank");
      return;
    }

    if (newClassDate == "") {
      toast.error("Date cannot be blank");
      return;
    }

    if (newClassQuestionnaire == null) {
      toast.error("Questionnaire status cannot be blank");
      return;
    }

    try {
      const params = new URLSearchParams({
        cid: classes[index].class.id,
        cname: newClassName,
        cdate: newClassDate,
        qstatus: String(newClassQuestionnaire),
        status: String(newClassStatus),
      });
      if (newClassStartTime) params.set("cstart", newClassStartTime);
      if (newClassEndTime) params.set("cend", newClassEndTime);
      if (newClassDays && newClassDays.length)
        params.set("cdays", newClassDays.join(","));

      const response = await fetch(`/api/classes?${params.toString()}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setRefresh(!refresh);
        toast.success("Class details updated");
        setNewClassStartTime("");
        setNewClassEndTime("");
        setNewClassDays([]);
      } else {
        // Handle error
        console.error("Failed to update class");
        toast.error(data.error ? data.error : "Failed to update class");
      }
    } catch (error) {
      console.error("Error updating class:", error);
    }
    setToggleDelete(null);
  };

  const createTopic = async (e: any) => {
    e.preventDefault();

    if (classTopic == "") {
      toast.error("Please enter a topic name");
      return;
    }

    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId: selectedClass?.id,
          topicName: classTopic,
        }),
      });

      const responseText = await response.json();

      if (response.ok) {
        setClassTopic("");
        setRefresh(!refresh);
        toast.success(responseText.message);
      } else {
        // Handle error
        console.error("Failed to submit class topic");
        toast.error(responseText.message);
      }
    } catch (error) {
      console.error("Error submitting topic:", error);
    }
  };

  const deleteTopic = async (index: any) => {
    try {
      const response = await fetch(`/api/topics?id=${topics[index].id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setRefresh(!refresh);
        toast.success("Topic deleted");
      } else {
        // Handle error
        console.error("Failed to delete topic");
        toast.error("Failed to delete topic");
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
    setToggleTopicDelete(null);
  };

  const updateTopic = async (index: any) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/topics?tid=${topics[index].id}&name=${topicName}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        setRefresh(!refresh);
        toast.success("Topic updated");
      } else {
        // Handle error
        console.error("Failed to update topic");
        toast.error("Failed to update topic");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error updating topic:", error);
      setLoading(false);
    }
    setLoading(false);
    setTopicName("");
    setEditIndex(null);
  };

  const removeStudent = async (index: any) => {
    setLoading(true);
    const chosenclass = selectedClass;
    try {
      const response = await fetch(
        `/api/classes/student?uid=${chosenclass?.enrollments[index].userId}&cid=${chosenclass?.enrollments[index].classId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        setRefresh(!refresh);
        handleCollapse();
        toast.success("User removed");
      } else {
        // Handle error
        console.error("Failed to removed user");
        toast.error("Failed to remove user");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error removing user:", error);
      setLoading(false);
    }
    setLoading(false);
    setToggleRemove(null);
  };

  const unenroll = async (index: any) => {
    setLoading(true);
    const chosenClassEnrollment = classes[index];
    try {
      const response = await fetch(
        `/api/classes/student?uid=${chosenClassEnrollment.userId}&cid=${chosenClassEnrollment.classId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        setRefresh(!refresh);
        handleCollapse();
        toast.success("You have been unenrolled");
      } else {
        // Handle error
        console.error("Failed to unenroll user");
        toast.error("Failed to unenroll user");
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to unenroll user:", error);
      setLoading(false);
    }
    setLoading(false);
    setToggleRemove(null);
  };

  // ─── AI Summary: only fetched on explicit button press ───────────────────
  const fetchSummary = async (forceRefresh = false) => {
    if (!selectedClass?.id) return;

    // localStorage key per user+class
    const metaKey = `paltaq_summary_meta:${user.id}:${selectedClass.id}`;

    const isSameDay = (iso?: string | null) => {
      if (!iso) return false;
      const d = new Date(iso);
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    };

    const isEmptySummary = (s?: ClassSummary | null) => {
      if (!s) return true;
      const noText = !(s.summary && s.summary.trim().length > 0);
      const noThemes = !s.themes || s.themes.length === 0;
      const noMis = !s.misconceptions || s.misconceptions.length === 0;
      const noTop = !s.topQuestions || s.topQuestions.length === 0;
      const noTip = !(s.teacherTip && s.teacherTip.trim().length > 0);
      return noText && noThemes && noMis && noTop && noTip;
    };

    // If not forcing and we already generated today and the stored summary is non-empty, block extra generation
    if (!forceRefresh && lastGenerated && isSameDay(lastGenerated) && !isEmptySummary(classSummary)) {
      // already generated today and has content — nothing to do
      toast.info("A summary has already been generated for this class today.");
      return;
    }

    // Return cached result unless force-refreshing
    if (!forceRefresh && summaryCache.current[selectedClass.id]) {
      setClassSummary(summaryCache.current[selectedClass.id]);
      return;
    }

    if (forceRefresh) delete summaryCache.current[selectedClass.id];

    setSummaryLoading(true);
    setSummaryError("");
    setClassSummary(null);

    try {
      const qRes = await fetch(`/api/questions?cid=${selectedClass.id}`);
      let allQuestions: string[] = [];

      if (qRes.ok) {
        const qData = await qRes.json();
        const arr = Array.isArray(qData) ? qData : (qData.questions ?? []);
        // Limit to top 30 questions to keep token usage low
        allQuestions = arr
          .map((q: any) => q.question ?? q.paltaQ ?? "")
          .filter(Boolean)
          .slice(0, 30);
      }

      if (allQuestions.length === 0) {
        setSummaryLoading(false);
        return;
      }

      const res = await fetch("/api/groq/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: allQuestions }),
      });

      if (!res.ok) throw new Error("Failed to fetch summary");

      const data: ClassSummary = await res.json();
      summaryCache.current[selectedClass.id] = data;
      setClassSummary(data);

      // Persist metadata (summary + timestamp) so we can enforce daily limit and show previous summaries
      try {
        const payload = {
          lastGenerated: new Date().toISOString(),
          summary: data,
        } as any;
        localStorage.setItem(metaKey, JSON.stringify(payload));
        setLastGenerated(payload.lastGenerated);
      } catch (e) {
        console.error("Failed to persist summary meta:", e);
      }
    } catch (err) {
      console.error("Summary fetch error:", err);
      setSummaryError("Could not generate summary. Please try again.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const refreshSummary = () => fetchSummary(true);

  const handleCollapse = () => {
    setSelectedClass(undefined);
    setClassSummary(null);
  };

  // Load persisted summary/meta when a class is selected
  useEffect(() => {
    if (!selectedClass?.id) {
      setClassSummary(null);
      setLastGenerated(null);
      return;
    }

    const metaKey = `paltaq_summary_meta:${user.id}:${selectedClass.id}`;
    try {
      const raw = localStorage.getItem(metaKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.summary) {
          setClassSummary(parsed.summary as ClassSummary);
        }
        if (parsed?.lastGenerated) setLastGenerated(parsed.lastGenerated);
      } else {
        setClassSummary(null);
        setLastGenerated(null);
      }
    } catch (e) {
      console.error("Failed to load summary meta:", e);
      setClassSummary(null);
      setLastGenerated(null);
    }
  }, [selectedClass?.id, refresh]);

  const displayStudents = () => {
    const sortedEnrollments = [...(selectedClass?.enrollments || [])].sort(
      (a, b) => {
        const { key, direction } = sortConfig;
        let valueA =
          key === "status"
            ? a.user.is_Faculty
              ? a.user.id === selectedClass?.creatorId
                ? "Admin"
                : "Faculty"
              : "Student"
            : key in a
              ? (a as any)[key]
              : undefined;
        let valueB =
          key === "status"
            ? b.user.is_Faculty
              ? b.user.id === selectedClass?.creatorId
                ? "Admin"
                : "Faculty"
              : "Student"
            : key in b
              ? (b as any)[key]
              : undefined;

        if (typeof valueA === "string") valueA = valueA.toLowerCase();
        if (typeof valueB === "string") valueB = valueB.toLowerCase();

        if (valueA < valueB) return direction === "asc" ? -1 : 1;
        if (valueA > valueB) return direction === "asc" ? 1 : -1;
        return 0;
      },
    );

    const handleSort = (key: any) => {
      setSortConfig((prevConfig) => ({
        key,
        direction:
          prevConfig.key === key && prevConfig.direction === "asc"
            ? "desc"
            : "asc",
      }));
    };

    if (selectedClass) {
      if (selectedClass.enrollments.length <= 1) {
        return (
          <div>
            <div>
              <h5 className="pl-3">Student list of {selectedClass.name}</h5>
              <p className="lg:pb-3 pb-1 pl-3">
                Users Enrolled: {selectedClass.enrollments.length}
              </p>
            </div>
            <p className="lg:ml-4 ml-3">
              No students or faculties except you have enrolled to this
              classroom yet.
            </p>
          </div>
        );
      } else {
        return (
          <div className="lg:w-full w-full px-2">
            {/* Collapsible header */}
            <div
              className="flex items-center justify-between cursor-pointer select-none pl-3 pr-2 py-1 rounded hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setEnrollmentCollapsed((c) => !c)}
            >
              <div>
                <h5 className="mb-0">
                  Enrollment List of {selectedClass.name}
                </h5>
                <div className="flex flex-row gap-x-2 text-sm text-gray-600">
                  <span>
                    Students:{" "}
                    {
                      selectedClass.enrollments.filter(
                        (e) => !e.user.is_Faculty,
                      ).length
                    }
                  </span>
                  <span>|</span>
                  <span>
                    Faculty:{" "}
                    {
                      selectedClass.enrollments.filter((e) => e.user.is_Faculty)
                        .length
                    }
                  </span>
                </div>
              </div>
              <span className="text-gray-600 text-xs font-semibold uppercase tracking-wide">
                {enrollmentCollapsed ? "▼ Show" : "▲ Hide"}
              </span>
            </div>

            {!enrollmentCollapsed && (
              <div className="overflow-x-auto scrollbar-thin scrollbar-webkit mt-2">
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <table className="table table-responsive-sm lg:mr-0 pr-4">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort("name")}>Name</th>
                        <th onClick={() => handleSort("status")}>Status</th>
                        <th onClick={() => handleSort("score")}>Score</th>
                        <th onClick={() => handleSort("questionCount")}>
                          Questions
                        </th>
                        <th onClick={() => handleSort("paltaQCount")}>
                          PaltaQ
                        </th>
                        <th onClick={() => handleSort("rank")}>Rank</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    {/* ✅ FIXED */}
                    <tbody>
                      {sortedEnrollments.map(
                        (student, index) =>
                          student.user.id !== user.id && (
                            <React.Fragment key={student.userId}>
                              <tr>
                                <td>{student.user.name}</td>
                                <td>
                                  {student.user.is_Faculty
                                    ? student.user.id ===
                                      selectedClass.creatorId
                                      ? "Admin"
                                      : "Faculty"
                                    : "Student"}
                                </td>
                                <td>{student ? student.score : -1}</td>
                                <td>{student ? student.questionCount : -1}</td>
                                <td>{student ? student.paltaQCount : -1}</td>
                                <td>{student ? student.rank : "Unknown"}</td>
                                <td>
                                  {student.user.id !==
                                    selectedClass.creatorId && (
                                    <div onClick={() => setToggleRemove(index)}>
                                      Remove
                                    </div>
                                  )}
                                </td>
                              </tr>

                              {toggleRemove === index && (
                                <tr>
                                  <td colSpan={7}>
                                    <div className="flex justify-end gap-x-4">
                                      <button
                                        onClick={() => removeStudent(index)}
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        onClick={() => setToggleRemove(null)}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      }
    } else {
      return (
        <div>
          <h5 className="lg:pl-4 pl-2">
            Manage students enrolled in your classroom
          </h5>
          <p className="lg:pl-4 pl-2">
            Select a class to view enrolled students.
          </p>
        </div>
      );
    }
  };

  const questionnaireStatus = () => {
    if (selectedClass) {
      const enrollments = selectedClass.enrollments as ClassEnrollment[];

      if (enrollments.length <= 1) {
        return (
          <div>
            <div>
              <h5 className="pl-3">Student list of {selectedClass.name}</h5>
              <p className="lg:pb-3 pb-1 pl-3">
                Users Enrolled: {selectedClass.enrollments.length}
              </p>
            </div>
            <p className="lg:ml-4 ml-3">
              No students or faculties except you have enrolled to this
              classroom yet.
            </p>
          </div>
        );
      } else {
        return (
          <div className="lg:w-full w-[85vw] px-2">
            {/* Collapsible header */}
            <div
              className="flex items-center justify-between cursor-pointer select-none pl-3 pr-2 py-1 rounded hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setQuestionnaireCollapsed((c) => !c)}
            >
              <div>
                <h5 className="mb-0">
                  Questionnaire Status List of {selectedClass.name}
                </h5>
                <div className="flex flex-row flex-wrap gap-x-6 text-sm text-gray-600">
                  <span>
                    Pre-Completed:{" "}
                    {
                      enrollments.filter(
                        (e) =>
                          !e.user.is_Faculty && e.preQuestionnaire?.isCompleted,
                      ).length
                    }
                  </span>
                  <span>
                    Pre-Incomplete:{" "}
                    {
                      enrollments.filter(
                        (e) =>
                          !e.user.is_Faculty &&
                          !e.preQuestionnaire?.isCompleted,
                      ).length
                    }
                  </span>
                  <span>
                    Post-Completed:{" "}
                    {
                      enrollments.filter(
                        (e) =>
                          !e.user.is_Faculty &&
                          e.postQuestionnaire?.isCompleted,
                      ).length
                    }
                  </span>
                  <span>
                    Post-Incomplete:{" "}
                    {
                      enrollments.filter(
                        (e) =>
                          !e.user.is_Faculty &&
                          !e.postQuestionnaire?.isCompleted,
                      ).length
                    }
                  </span>
                </div>
              </div>
              <span className="text-gray-600 text-xs font-semibold uppercase tracking-wide">
                {questionnaireCollapsed ? "▼ Show" : "▲ Hide"}
              </span>
            </div>

            {!questionnaireCollapsed && (
              <div className="overflow-x-auto scrollbar-thin scrollbar-webkit mt-2">
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <table
                    className="table"
                    style={{ tableLayout: "fixed", width: "100%" }}
                  >
                    <thead>
                      <tr>
                        <th style={{ width: "50%" }}>Name</th>
                        <th style={{ width: "25%" }}>Pre-Questionnaire</th>
                        <th style={{ width: "25%" }}>Post-Questionnaire</th>
                      </tr>
                    </thead>

                    {/* ✅ FIXED */}
                    <tbody>
                      {enrollments
                        .filter(
                          (e) => !e.user.is_Faculty && e.user.id !== user.id,
                        )
                        .sort((a, b) => {
                          const direction =
                            sortConfig.direction === "asc" ? 1 : -1;
                          const key = sortConfig.key;

                          if (key === "name")
                            return (
                              a.user.name.localeCompare(b.user.name) * direction
                            );
                          else if (key === "prestatus")
                            return (
                              ((a.preQuestionnaire?.isCompleted ? 1 : 0) -
                                (b.preQuestionnaire?.isCompleted ? 1 : 0)) *
                              direction
                            );
                          else if (key === "poststatus")
                            return (
                              ((a.postQuestionnaire?.isCompleted ? 1 : 0) -
                                (b.postQuestionnaire?.isCompleted ? 1 : 0)) *
                              direction
                            );

                          return 0;
                        })
                        .map((student) => (
                          <tr key={student.userId}>
                            <td>{student.user.name || "Unnamed"}</td>
                            <td>
                              {student.preQuestionnaire?.isCompleted ? (
                                <span className="text-green-600">
                                  Completed
                                </span>
                              ) : (
                                <span className="text-red-600">Incomplete</span>
                              )}
                            </td>
                            <td>
                              {student.postQuestionnaire?.isCompleted ? (
                                <span className="text-green-600">
                                  Completed
                                </span>
                              ) : (
                                <span className="text-red-600">Incomplete</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      }
    } else {
      return (
        <div>
          <h5 className="lg:pl-4 pl-2">
            Manage students enrolled in your classroom
          </h5>
          <p className="lg:pl-4 pl-2">
            Select a class to view enrolled students.
          </p>
        </div>
      );
    }
  };

  const displayTopics = () => {
    if (selectedClass) {
      return (
        <div className="flex lg:flex-row flex-col mt-4 mb-4 lg:w-75 w-full px-2">
          {/* Topic Create */}
          <div className="lg:w-50 w-full lg:mb-0 mb-2 lg:mt-0 mt-4">
            <h5 className="text-neutral-700 pad-l1">
              Set the topics in your classroom
            </h5>
            <p className="pad-l1">
              Students will only be able to ask questions on the topics you set
            </p>
            <form
              onSubmit={createTopic}
              className="flex flex-col lg:pr-20 gap-6 py-2 mb-2"
            >
              <div>
                <label className="pad-l1">Topic Name</label>
                <div className="mar-x1">
                  <input
                    id="classTopic"
                    className="form-control pr-5o5 resize-none py-3 pl-3"
                    placeholder="Create a class topic here"
                    value={classTopic}
                    onChange={(
                      e: React.ChangeEvent<
                        | HTMLInputElement
                        | HTMLTextAreaElement
                        | HTMLSelectElement
                      >,
                    ) => setClassTopic(e.target.value)}
                  />
                </div>
              </div>

              <button className="btn animate-down-2 mar-x1" type="submit">
                Create Topic
              </button>
            </form>
          </div>
          {/* Topic List */}
          <div className="border border-gray-400 rounded-lg px-2 py-4 w-full lg:h-[23.8em] h-[24em] overflow-y-auto scrollbar-thin scrollbar-webkit lg:order-last">
            <h5 className="pad-l1">Topics of {selectedClass?.name}</h5>

            {topics.length !== 0 && (
              <div>
                <p className="pad-l1">Number of topics: {topics.length}</p>
                <table className="table table-hover table-responsive-sm">
                  <thead>
                    <tr>
                      <th className="border-0" scope="col" id="className">
                        Topic Name
                      </th>
                      <th className="border-0" scope="col" id="classCode">
                        Questions
                      </th>
                      <th className="border-0" scope="col" id="classCode">
                        PaltaQ
                      </th>
                      <th className="border-0" scope="col" id="classCode">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topics.map((topic: any, index: any) => (
                      <React.Fragment key={topic.id}>
                        <tr>
                          <td>
                            {editIndex === index ? (
                              <textarea
                                value={topicName}
                                className="bg-gray-300 border border-gray-500 rounded-lg px-2 py-1 w-full resize-none"
                                onChange={(
                                  e: React.ChangeEvent<
                                    | HTMLInputElement
                                    | HTMLTextAreaElement
                                    | HTMLSelectElement
                                  >,
                                ) => setTopicName(e.target.value)}
                              />
                            ) : (
                              topic.name
                            )}
                          </td>

                          <td>{topic.questions}</td>

                          <td>{topic.paltaQBy}</td>

                          <td className="flex lg:flex-row flex-col items-center">
                            {editIndex === index ? (
                              <>
                                <button
                                  className="hover:text-lime-700 transition-colors duration-500 py-1"
                                  onClick={() => updateTopic(index)}
                                  disabled={loading}
                                >
                                  Save
                                </button>
                                <p className="lg:block hidden mx-3 translate-y-2">
                                  |
                                </p>
                                <button
                                  className="hover:text-red-800 transition-colors duration-500 py-1"
                                  onClick={() => {
                                    setEditIndex(null);
                                    setTopicName("");
                                  }}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="hover:text-blue-800 transition-colors duration-500 -translate-y-2 lg:block hidden"
                                  onClick={() => {
                                    setEditIndex(index);
                                    setTopicName(topic.name);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="hover:text-blue-800 transition-colors duration-500 lg:hidden block mb-2"
                                  onClick={() => {
                                    setEditIndex(index);
                                    setTopicName(topic.name);
                                  }}
                                >
                                  Edit
                                </button>

                                {user.id === selectedClass.creatorId && (
                                  <p className="lg:block hidden mx-3">|</p>
                                )}

                                {user.id === selectedClass.creatorId && (
                                  <div>
                                    <div
                                      className="hover:text-red-800 transition-colors duration-500 -translate-y-2 lg:block hidden"
                                      onClick={() =>
                                        setToggleTopicDelete(index)
                                      }
                                    >
                                      Delete
                                    </div>
                                    <button
                                      className="hover:text-red-800 transition-colors duration-500 lg:hidden block"
                                      onClick={() =>
                                        setToggleTopicDelete(index)
                                      }
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </td>
                        </tr>

                        {toggleTopicDelete === index && (
                          <tr key={`${index}-confirm`}>
                            <td colSpan={4} className="w-full">
                              <div className="w-full flex gap-x-4">
                                <button
                                  className="hover:text-red-800 transition-colors duration-500"
                                  onClick={() => deleteTopic(index)}
                                >
                                  Confirm
                                </button>
                                <button
                                  className="hover:text-red-800 transition-colors duration-500"
                                  onClick={() => setToggleTopicDelete(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {topics.length === 0 && (
              <p className="pad-l1">No topics set yet.</p>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="">
          <h5 className="pad-l1">
            Set topics for your students to ask question on
          </h5>
          <p className="pad-l1">Select a class to set topics.</p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading Dashboard...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={`${nunito.className} antialiased flex flex-col`}>
      <h5 className="font-bold pad-l1">Welcome {user.name}</h5>

      {/* Create/Join/View Classrooms */}
      <div className="w-full ">
        <hr></hr>

        {/* Left Part */}
        <div className="w-full my-4">
          <hr className="lg:hidden block"></hr>
          <h5 className="text-neutral-700 pad-l1">Get started by creating your own class</h5>
          {/* Restored create class form */}
          <form onSubmit={createClass} className="flex flex-col lg:pr-20 px py-4 gap-4 mb-2 pad-x1">
            <input
              id="className"
              className="form-control pr-5o5 resize-none py-3 pl-3"
              placeholder="Enter your class name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
            <button className="btn animate-down-2" type="submit">Create Class</button>
          </form>

          <h5 className="pad-l1 pt-8 text-neutral-700 pb-2">
            Use the "Classes taught by you" panel to add class details including
            start/end times and active days.
          </h5>
          <hr className="lg:hidden block"></hr>
        </div>

        {/* Right Part */}
        <div className="border border-gray-400 rounded-lg px-2 py-4 lg:w-full w-[95%] mx-auto lg:h-[28em] h-[23.5em] overflow-y-auto scrollbar-thin scrollbar-webkit">
          <h5 className="pl-3">Classes taught by you</h5>

          {classes.length !== 0 && (
            <div>
              <p className="pl-3">Number of classes: {classes.length}</p>

              <table className="table table-hover table-responsive-sm">
                <thead>
                  <tr>
                    <th className="border-0" scope="col" id="className">
                      Class Name
                    </th>
                    <th className="border-0" scope="col" id="classCode">
                      Class Code
                    </th>
                    <th className="border-0" scope="col" id="classCode">
                      Semester End
                    </th>
                    <th className="border-0" scope="col" id="classCode">
                      Questionnaire
                    </th>
                    <th className="border-0" scope="col" id="classCode">
                      Status
                    </th>
                    <th className="border-0" scope="col" id="classCode">
                      Schedule
                    </th>
                    <th className="border-0" scope="col" id="classCode">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((classItem: any, index: any) => (
                    <tr key={classItem.class.id}>
                      <td>
                        {toggleUpdate === index ? (
                          <input
                            type="text"
                            value={newClassName}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => setNewClassName(e.target.value)}
                            className="form-control"
                          />
                        ) : (
                          classItem.class.name
                        )}
                      </td>
                      <td>{classItem.class.code}</td>
                      <td>
                        {toggleUpdate === index ? (
                          <input
                            type="date"
                            value={newClassDate}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => setNewClassDate(e.target.value)}
                            className="form-control"
                          />
                        ) : classItem.class.endsAt ? (
                          new Date(classItem.class.endsAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )
                        ) : (
                          <div className="text-rose-800">N/A</div>
                        )}
                      </td>
                      <td>
                        {toggleUpdate === index ? (
                          <select
                            value={newClassQuestionnaire.toString()}
                            onChange={(
                              e: React.ChangeEvent<HTMLSelectElement>,
                            ) =>
                              setNewClassQuestionnaire(
                                e.target.value === "true",
                              )
                            }
                            className="form-control"
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        ) : classItem.class.questionnaire ? (
                          <div className="text-green-800">Active</div>
                        ) : (
                          <div className="text-rose-800">Inactive</div>
                        )}
                      </td>
                      <td>
                        {toggleUpdate === index ? (
                          <select
                            value={newClassStatus.toString()}
                            onChange={(
                              e: React.ChangeEvent<HTMLSelectElement>,
                            ) => setNewClassStatus(e.target.value === "true")}
                            className="form-control"
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        ) : classItem.class.status ? (
                          <div className="text-green-800">Active</div>
                        ) : (
                          <div className="text-rose-800">Inactive</div>
                        )}
                      </td>
                      <td>
                        {toggleUpdate === index ? (
                          <div className="pb-2">
                            <div className="flex flex-row gap-3 items-center mb-3 flex-wrap">
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                  Start
                                </label>
                                <input
                                  type="time"
                                  value={newClassStartTime}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                  ) => setNewClassStartTime(e.target.value)}
                                  className="form-control w-auto text-sm"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                  End
                                </label>
                                <input
                                  type="time"
                                  value={newClassEndTime}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                  ) => setNewClassEndTime(e.target.value)}
                                  className="form-control w-auto text-sm"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide invisible">
                                  _
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewClassStartTime("");
                                    setNewClassEndTime("");
                                    setNewClassDays([]);
                                  }}
                                  style={{
                                    boxShadow:
                                      "3px 3px 6px #b8b9be, -3px -3px 6px #ffffff",
                                    background: "#e6e7ee",
                                  }}
                                  className="px-3 py-[6px] rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-600 transition-colors duration-200 hover:bg-[#e0e1e8] border-0 hover:scale-105"
                                >
                                  Unset
                                </button>
                              </div>
                            </div>
                            <div className="mb-2">
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Active Days
                              </label>
                            </div>
                            <div className="flex flex-row gap-2 flex-wrap items-center mb-2">
                              {[
                                "Sun",
                                "Mon",
                                "Tue",
                                "Wed",
                                "Thu",
                                "Fri",
                                "Sat",
                              ].map((d) => (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => {
                                    if (newClassDays.includes(d))
                                      setNewClassDays((prev) =>
                                        prev.filter((x) => x !== d),
                                      );
                                    else
                                      setNewClassDays((prev) => [...prev, d]);
                                  }}
                                  style={
                                    newClassDays.includes(d)
                                      ? {
                                          boxShadow:
                                            "inset 2px 2px 5px #5a8a9f, inset -2px -2px 5px #8fd3f4",
                                          background: "#2d7a9a",
                                          color: "#fff",
                                        }
                                      : {
                                          boxShadow:
                                            "3px 3px 6px #b8bec9, -3px -3px 6px #ffffff",
                                          background: "#e0e5ec",
                                          color: "#6b7280",
                                        }
                                  }
                                  className="px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-200 border-0 hover:scale-105"
                                >
                                  {d}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : classItem.class.startTime ||
                          classItem.class.endTime ||
                          (classItem.class.activeDays &&
                            classItem.class.activeDays.length) ? (
                          <div>
                            {classItem.class.startTime &&
                            classItem.class.endTime ? (
                              <div className="text-sm">
                                {classItem.class.startTime} -{" "}
                                {classItem.class.endTime}
                              </div>
                            ) : (
                              <div className="text-sm">Partial</div>
                            )}
                            {classItem.class.activeDays &&
                            classItem.class.activeDays.length ? (
                              <div className="text-xs">
                                {classItem.class.activeDays.join(", ")}
                              </div>
                            ) : (
                              <div className="text-xs">Everyday</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-rose-800">Not set</div>
                        )}
                      </td>
                      {/* Actions Tab */}
                      <td className="">
                        <div className="flex-col">
                          <div className="flex lg:flex-row flex-col items-center">
                            <button
                              className="hover:text-blue-800 transition-colors duration-500 -translate-y-2 lg:block hidden"
                              onClick={() => {
                                selectClass(index);
                                setRefresh(!refresh);
                              }}
                            >
                              Select
                            </button>
                            <button
                              className="hover:text-blue-800 transition-colors duration-500 lg:hidden block mb-2"
                              onClick={() => {
                                selectClass(index);
                                setRefresh(!refresh);
                              }}
                            >
                              Select
                            </button>

                            <p className="lg:block hidden mx-2">|</p>

                            {user.id === classItem.class.creatorId && (
                              <>
                                <div>
                                  {classItem.class.endsAt && (
                                    <div className="flex flex-row items-center">
                                      <button
                                        className="hover:text-lime-800 transition-colors duration-500 lg:-translate-y-2 -translate-y-1"
                                        onClick={() => {
                                          setNewClassName(classItem.class.name);
                                          setNewClassDate(
                                            formatDate(classItem.class.endsAt),
                                          );
                                          setNewClassQuestionnaire(
                                            classItem.class.questionnaire,
                                          );
                                          setNewClassStartTime(
                                            classItem.class.startTime ?? "",
                                          );
                                          setNewClassEndTime(
                                            classItem.class.endTime ?? "",
                                          );
                                          setNewClassDays(
                                            classItem.class.activeDays ?? [],
                                          );
                                          setToggleUpdate(index);
                                          setToggleDelete(null);
                                        }}
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {classItem.class.code !== "0E8E5F" && (
                                  <p className="lg:block hidden mx-2">|</p>
                                )}
                              </>
                            )}

                            {user.id === classItem.class.creatorId ? (
                              <div>
                                <div
                                  className="hover:text-red-800 transition-colors duration-500 -translate-y-2 lg:block hidden"
                                  onClick={() => {
                                    setToggleDelete(index);
                                    setToggleUpdate(null);
                                  }}
                                >
                                  Delete
                                </div>

                                <button
                                  className="hover:text-red-800 transition-colors duration-500 lg:hidden block"
                                  onClick={() => {
                                    setToggleDelete(index);
                                    setToggleUpdate(null);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            ) : (
                              <div>
                                <div
                                  className="hover:text-red-800 transition-colors duration-500 -translate-y-2 lg:block hidden"
                                  onClick={() => setToggleDelete(index)}
                                >
                                  Unenroll
                                </div>

                                <button
                                  className="hover:text-red-800 transition-colors duration-500 lg:hidden block"
                                  onClick={() => setToggleDelete(index)}
                                >
                                  Unenroll
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Update Toggle */}
                          {user.id == classItem.class.creatorId &&
                            toggleUpdate === index && (
                              <div className="w-full flex gap-x-4 mt-1">
                                <button
                                  className="hover:text-green-800 transition-colors duration-500"
                                  onClick={() => {
                                    setToggleUpdate(null);
                                    updateClass(index);
                                  }}
                                >
                                  Confirm
                                </button>
                                <span>|</span>
                                <button
                                  className="hover:text-red-800 transition-colors duration-500"
                                  onClick={() => setToggleUpdate(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}

                          {/* Delete Toggle */}
                          {user.id !== classItem.class.creatorId ? (
                            <div>
                              {toggleDelete === index && (
                                <div className="w-full flex gap-x-4">
                                  <button
                                    className="hover:text-green-800 transition-colors duration-500"
                                    onClick={() => {
                                      unenroll(index);
                                      setToggleDelete(null);
                                    }}
                                  >
                                    Confirm
                                  </button>
                                  <span>|</span>
                                  <button
                                    className="hover:text-red-800 transition-colors duration-500"
                                    onClick={() => setToggleDelete(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              {toggleDelete === index && (
                                <div className="w-full flex gap-x-4">
                                  <button
                                    className="hover:text-green-800 transition-colors duration-500"
                                    onClick={() => {
                                      deleteClass(index);
                                      setToggleDelete(null);
                                    }}
                                  >
                                    Confirm
                                  </button>
                                  <span>|</span>
                                  <button
                                    className="hover:text-red-800 transition-colors duration-500"
                                    onClick={() => setToggleDelete(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {classes.length === 0 && (
            <p className="lg:pl-4 pl-3">No classes created yet.</p>
          )}
        </div>
      </div>

      {/* Classroom Title */}
      <div>
        <hr className="border-b border-gray-400"></hr>

        <div className="flex flex-row justify-between">
          <div>
            <h4 className="text-sky-800 pl-5 lg:pl-2">
              {selectedClass?.name} Classroom
            </h4>
            {!selectedClass && (
              <p className="lg:pl-2 pl-5 my-0">
                {"Please select a class from the table above"}
              </p>
            )}
          </div>
          {selectedClass && (
            <div>
              <button
                onClick={handleCollapse}
                className="animate-down-2 font-bold mt-2 mr-4 h-fit lg:block hidden"
              >
                Deselect
                <FontAwesomeIcon className="px-2" icon={faCircleChevronUp} />
              </button>
              <button
                onClick={handleCollapse}
                className="lg:hidden block text-xl mr-[1em]"
              >
                <FontAwesomeIcon icon={faCircleChevronUp} />
              </button>
            </div>
          )}
        </div>
        <hr className="border-b border-gray-400"></hr>
      </div>

      {selectedClass ? (
        <div>
          {/* Display Topics */}
          <div className="mb-4 w-full">{displayTopics()}</div>

          <hr className="lg:block hidden"></hr>

          {/* Display Questionnaire Status */}
          <div className="border border-gray-400 rounded-lg py-4 mb-5 w-full">
            {questionnaireStatus()}
          </div>

          <hr className="lg:block hidden"></hr>

          {/* AI Class Summary */}
          <div className="border border-gray-400 rounded-lg py-4 mb-5 mt-5 w-full px-3">
            <div className="flex items-center justify-between mb-3">
              <h5 className="mb-0 pl-1">
                <FontAwesomeIcon
                  icon={faBrain}
                  className="mr-2 text-indigo-500"
                />
                AI Class Summary
              </h5>
              {/* Button rules:
                  - while loading: no action buttons
                  - if we have a summary and lastGenerated is today:
                      - if summary empty => show Refresh
                      - else => show nothing (one-per-day)
                  - if we have a summary and lastGenerated NOT today: show Regenerate
                  - if no summary and not generated today: show Generate
              */}
              {!summaryLoading && (
                (() => {
                  const metaKey = `paltaq_summary_meta:${user.id}:${selectedClass?.id}`;
                  const isSameDay = (iso?: string | null) => {
                    if (!iso) return false;
                    const d = new Date(iso);
                    const now = new Date();
                    return (
                      d.getFullYear() === now.getFullYear() &&
                      d.getMonth() === now.getMonth() &&
                      d.getDate() === now.getDate()
                    );
                  };

                  const isEmptySummary = (s?: ClassSummary | null) => {
                    if (!s) return true;
                    const noText = !(s.summary && s.summary.trim().length > 0);
                    const noThemes = !s.themes || s.themes.length === 0;
                    const noMis = !s.misconceptions || s.misconceptions.length === 0;
                    const noTop = !s.topQuestions || s.topQuestions.length === 0;
                    const noTip = !(s.teacherTip && s.teacherTip.trim().length > 0);
                    return noText && noThemes && noMis && noTop && noTip;
                  };

                  // if we have classSummary
                  if (classSummary) {
                    // if generated today
                    if (lastGenerated && isSameDay(lastGenerated)) {
                      // if summary is empty — allow refresh
                      if (isEmptySummary(classSummary)) {
                        return (
                          <button
                            onClick={refreshSummary}
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                            title="Refresh summary"
                          >
                            <FontAwesomeIcon icon={faRotateRight} className="mr-1" />
                            Refresh
                          </button>
                        );
                      }
                      // else show nothing (limit reached)
                      return null;
                    }

                    // we have a summary but not generated today => allow regenerate
                    return (
                      <button
                        onClick={() => fetchSummary(true)}
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                        title="Regenerate summary"
                      >
                        <FontAwesomeIcon icon={faRotateRight} className="mr-1" />
                        Regenerate
                      </button>
                    );
                  }

                  // no classSummary -> don't show Generate in header to avoid duplicate buttons;
                  // the main content area shows the primary "Generate Summary" button instead.
                  if (!classSummary) {
                    return null;
                  }

                  return null;
                })()
              )}
            </div>

            {/* Loading */}
            {summaryLoading && (
              <div className="text-center py-4">
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  size="2x"
                  className="text-indigo-400 mb-2"
                />
                <p className="text-gray-500 mb-0">
                  Analyzing classroom discussions…
                </p>
              </div>
            )}

            {/* Error */}
            {!summaryLoading && summaryError && (
              <div
                className="alert alert-warning d-flex align-items-center"
                role="alert"
              >
                <span>{summaryError}</span>
                <button
                  onClick={refreshSummary}
                  className="btn btn-sm btn-warning ml-3"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Content */}
            {!summaryLoading && !summaryError && classSummary && (
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 py-2">
                {/* Overview */}
                <div className="card border-light p-4 lg:col-span-2">
                  <h6 className="font-bold text-gray-700 mb-2">
                    <FontAwesomeIcon
                      icon={faLightbulb}
                      className="mr-2 text-yellow-400"
                    />
                    Discussion Overview
                  </h6>
                  <p className="text-gray-700 mb-0 leading-relaxed">
                    {classSummary.summary}
                  </p>
                </div>

                {/* Key Themes */}
                <div className="card border-light p-4">
                  <h6 className="font-bold text-gray-700 mb-3">
                    🔑 Key Themes & Concepts
                  </h6>
                  {classSummary.themes.length === 0 ? (
                    <p className="text-gray-700 text-sm mb-0">
                      No themes detected yet.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {classSummary.themes.map((theme) => (
                        <span
                          key={theme}
                          className="badge"
                          style={{
                            backgroundColor: "#e5e8f0ff",
                            color: "#3730a3",
                            padding: "0.4em 0.75em",
                            borderRadius: "9999px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Misconceptions */}
                <div className="card border-light p-4">
                  <h6 className="font-bold text-gray-700 mb-3">
                    <FontAwesomeIcon
                      icon={faTriangleExclamation}
                      className="mr-2 text-orange-400"
                    />
                    Common Misconceptions
                  </h6>
                  {classSummary.misconceptions.length === 0 ? (
                    <p className="text-gray-700 text-sm mb-0">
                      No misconceptions detected — great work!
                    </p>
                  ) : (
                    <ul className="list-disc pl-4 mb-0 space-y-1">
                      {classSummary.misconceptions.map((m) => (
                        <li key={m} className="text-gray-700 text-sm">
                          {m}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Top Questions */}
                <div className="card border-light p-4 lg:col-span-2">
                  <h6 className="font-bold text-gray-700 mb-3">
                    <FontAwesomeIcon
                      icon={faStar}
                      className="mr-2 text-amber-400"
                    />
                    Highlighted High-Quality Questions
                  </h6>
                  {classSummary.topQuestions.length === 0 ? (
                    <p className="text-gray-700 text-sm mb-0">
                      No questions to highlight yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {classSummary.topQuestions.map((q, i) => (
                        <div
                          key={i}
                          className="d-flex align-items-start gap-2 p-3 rounded border-l border-l-4 border-amber-400 w-fit pr-8"
                          style={{
                            backgroundColor: "#f1f1f1ff",
                            borderLeft: "3px solid #fbbf24",
                          }}
                        >
                          <span
                            className="flex-shrink-0 font-bold text-amber-500"
                            style={{ minWidth: "1.25rem" }}
                          >
                            {i + 1}.
                          </span>
                          <span className="text-gray-700 text-sm pt-0.5">{q}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Teacher Guidance */}
                <div className="card border-light p-4 lg:col-span-2">
                <h6 className="font-bold text-gray-700 mb-3">
                    <FontAwesomeIcon
                    icon={faChalkboardTeacher} // or faUserTie if you prefer
                    className="mr-2 text-indigo-400"
                    />
                    Teaching Tip
                </h6>

                <p className="text-gray-700 text-sm mb-0 leading-relaxed">
                    {classSummary.teacherTip || "No guidance available yet."}
                </p>
                </div>
              </div>
            )}

            {/* When there's no generated summary, or generation allowed, show explanatory / Generate UI
                If classSummary is null and not loading, the header button will allow generating. */}
            {!summaryLoading && !summaryError && !classSummary && (
              <div className="text-left pb-4">
                <p className="text-gray-700 text-sm mb-6 ml-1">
                  Click below to generate an AI summary of this class's
                  discussions.
                </p>
                <button
                  onClick={() => fetchSummary(false)}
                  className="btn btn-primary d-flex align-items-center gap-2 ml-1"
                >
                  <FontAwesomeIcon icon={faBrain} />
                  Generate Summary
                </button>
              </div>
            )}
          </div>

          <hr className="lg:block hidden"></hr>

          {/* ── Analytics Dashboard ── */}
          <FacultyAnalytics
            selectedClass={selectedClass}
            currentUserId={user.id}
          />

          <hr className="lg:block hidden"></hr>

          {/* Display Students */}
          <div className="border border-gray-400 rounded-lg py-4 mt-5 mb-5 w-full">
            {displayStudents()}
          </div>
        </div>
      ) : (
        <div className="my-4"></div>
      )}
    </div>
  );
};

export default FacultyClass;
