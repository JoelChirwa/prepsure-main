import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  GraduationCap,
  Mail,
  Settings,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudentAuth } from "../context/StudentAuthContext";

export default function StudentProfile() {
  const { student, updateProfile } = useStudentAuth();
  const [name, setName] = useState(student?.name || "");
  const [classLevel, setClassLevel] = useState(student?.classLevel || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const studentName = student?.name?.trim() || "Student";
  const phone = student?.phone || "Not specified";

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await updateProfile({ name, classLevel });
      setNotice("Your profile has been updated.");
    } catch (err) {
      setError(err.message || "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  }

  const initials = studentName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "ST";

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8">
      <Button asChild variant="ghost" className="-ml-3 rounded-xl">
        <Link to="/student">
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>
      </Button>

      {/* Profile Header Hero */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#39452D] via-[#566440] to-[#738258] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold tracking-tight text-white ring-4 ring-white/10 backdrop-blur-sm">
              {initials}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-xs font-semibold text-[#F0EFE7] backdrop-blur-md">
                  <GraduationCap size={14} />
                  Student Account
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-[#E2E9D7]">
                  <CheckCircle2 size={12} />
                  Active
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {studentName}
              </h1>

              <p className="mt-1 flex items-center gap-2 text-sm text-[#E6E9DF]">
                <Mail size={14} className="shrink-0 text-[#D1DDB4]" />
                <span className="truncate">{phone}</span>
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Profile Features Hub */}
      <div>
        <h2 className="font-heading text-lg font-bold text-[#30332C]">
          Your Profile Hub
        </h2>
        <p className="mt-1 text-sm text-[#686B62]">
          Manage your saved practical work, study achievements, and account settings.
        </p>
      </div>

      <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
        <CardContent className="p-6 sm:p-7">
          <h2 className="font-semibold text-[#30332C]">Student details</h2>
          <p className="mt-1 text-sm text-[#686B62]">
            Keep your name, class level, and account details up to date.
          </p>

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="mt-4 rounded-lg border border-[#D9DACE] bg-[#F7F7F2] p-3 text-sm text-[#455333]">
              {notice}
            </p>
          )}

          <form onSubmit={handleProfileSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-[#42453E]">
                Full name
              </label>
              <input
                id="profile-name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#D9DACE] bg-white px-3 py-2.5 text-sm text-[#30332C] outline-none focus:border-[#87966A] focus:ring-2 focus:ring-[#87966A]/20"
              />
            </div>
            <div>
              <label htmlFor="profile-class-level" className="block text-sm font-medium text-[#42453E]">
                Class level
              </label>
              <select
                id="profile-class-level"
                required
                value={classLevel}
                onChange={(event) => setClassLevel(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#D9DACE] bg-white px-3 py-2.5 text-sm text-[#30332C] outline-none focus:border-[#87966A] focus:ring-2 focus:ring-[#87966A]/20"
              >
                <option value="" disabled>Select your class level</option>
                <option value="Form 1">Form 1</option>
                <option value="Form 2">Form 2</option>
                <option value="Form 3">Form 3</option>
                <option value="Form 4">Form 4</option>
                <option value="Private candidate">Private candidate</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving} className="rounded-xl">
                {saving ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Saved Experiments Card */}
        <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm transition hover:border-[#B8C39A] hover:shadow-md">
          <CardContent className="flex flex-col p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#E7EADF] text-[#66734F]">
              <BookmarkCheck size={24} />
            </div>

            <h3 className="mt-4 text-base font-semibold text-[#30332C]">
              Saved Experiments
            </h3>

            <p className="mt-2 flex-1 text-sm leading-6 text-[#55584F]">
              Bookmark important practical experiments for quick revision before exams.
            </p>

            <Link
              to="/saved-experiments"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#66734F] hover:text-[#455333]"
            >
              Open saved experiments
              <ArrowRight size={15} />
            </Link>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm transition hover:border-[#B8C39A] hover:shadow-md">
          <CardContent className="flex flex-col p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#ECEDE6] text-[#55584F]">
              <Settings size={24} />
            </div>

            <h3 className="mt-4 text-base font-semibold text-[#30332C]">
              Account Settings
            </h3>

            <p className="mt-2 flex-1 text-sm leading-6 text-[#55584F]">
              Manage your display name, password security, and study notification options.
            </p>

            <Link
              to="/settings"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#66734F] hover:text-[#455333]"
            >
              Go to settings
              <ArrowRight size={15} />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Account Info Details */}
      <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
        <CardContent className="space-y-4 p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#E7EADF] text-[#66734F]">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-[#30332C]">
                Security & Role Information
              </h3>
              <p className="text-xs text-[#686B62]">
                Details about your current PrepSure authentication session.
              </p>
            </div>
          </div>

          <div className="grid gap-4 border-t border-[#ECEDE6] pt-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E1E2D9] bg-[#F7F7F2] p-4">
              <span className="text-xs font-medium text-[#85897D]">Account Type</span>
              <p className="mt-1 font-semibold text-[#30332C]">Student Portal</p>
            </div>
            <div className="rounded-xl border border-[#E1E2D9] bg-[#F7F7F2] p-4">
              <span className="text-xs font-medium text-[#85897D]">Status</span>
              <p className="mt-1 font-semibold text-[#596443]">Active Session</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
