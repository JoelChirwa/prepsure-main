import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudentAuth } from "../context/StudentAuthContext";
import { MALAWI_DISTRICTS } from "../data/districts";

export default function StudentSettings() {
    const { student, updateProfile, changePin } = useStudentAuth();
    const [name, setName] = useState(student?.name || "");
    const [classLevel, setClassLevel] = useState(student?.classLevel || "");
    const [school, setSchool] = useState(student?.school || "");
    const [district, setDistrict] = useState(student?.district || "");
    const [sharedPhoneMode, setSharedPhoneMode] = useState(Boolean(student?.sharedPhoneMode));
    const [profileError, setProfileError] = useState("");
    const [profileNotice, setProfileNotice] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [currentPin, setCurrentPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [saving, setSaving] = useState(false);

    async function handleProfileSubmit(event) {
        event.preventDefault();
        setProfileError("");
        setProfileNotice("");
        setSavingProfile(true);

        try {
            await updateProfile({ name, classLevel, school, district, sharedPhoneMode });
            setProfileNotice("Your profile details have been saved.");
        } catch (err) {
            setProfileError(err.message || "Could not save your profile details.");
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setNotice("");

        if (newPin !== confirmPin) {
            setError("The new PINs do not match.");
            return;
        }

        setSaving(true);

        try {
            await changePin({ currentPin, newPin });
            setCurrentPin("");
            setNewPin("");
            setConfirmPin("");
            setNotice("Your PIN has been changed. Your other sessions are now invalid.");
        } catch (err) {
            setError(err.message || "Could not change your PIN.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="mx-auto max-w-3xl space-y-6 p-5 sm:p-8">
            <Button asChild variant="ghost" className="-ml-3 rounded-xl">
                <Link to="/profile">
                    <ArrowLeft size={17} />
                    Back to profile
                </Link>
            </Button>

            <header>
                <h1 className="text-2xl font-bold text-[#30332C]">Account settings</h1>
                <p className="mt-2 text-sm text-[#686B62]">
                    Update your profile, shared-phone preference, and PIN.
                </p>
            </header>

            <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
                <CardContent className="p-6 sm:p-7">
                    <h2 className="font-semibold text-[#30332C]">Profile details</h2>
                    <p className="mt-1 text-sm text-[#686B62]">
                        Update your details used for practice planning.
                    </p>

                    {profileError && (
                        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {profileError}
                        </p>
                    )}
                    {profileNotice && (
                        <p role="status" className="mt-4 rounded-lg border border-[#D9DACE] bg-[#F7F7F2] p-3 text-sm text-[#455333]">
                            {profileNotice}
                        </p>
                    )}

                    <form onSubmit={handleProfileSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="settings-name" className="block text-sm font-medium text-[#42453E]">
                                Full name
                            </label>
                            <input
                                id="settings-name"
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
                            <label htmlFor="settings-school" className="block text-sm font-medium text-[#42453E]">School</label>
                            <input id="settings-school" value={school} onChange={(event) => setSchool(event.target.value)} className="mt-1 w-full rounded-lg border border-[#D9DACE] bg-white px-3 py-2.5 text-sm text-[#30332C] outline-none focus:border-[#87966A] focus:ring-2 focus:ring-[#87966A]/20" />
                        </div>
                        <div>
                            <label htmlFor="settings-district" className="block text-sm font-medium text-[#42453E]">District</label>
                            <select id="settings-district" value={district} onChange={(event) => setDistrict(event.target.value)} className="mt-1 w-full rounded-lg border border-[#D9DACE] bg-white px-3 py-2.5 text-sm text-[#30332C] outline-none focus:border-[#87966A] focus:ring-2 focus:ring-[#87966A]/20">
                                <option value="">Select district (optional)</option>
                                {MALAWI_DISTRICTS.map((districtOption) => (
                                    <option key={districtOption} value={districtOption}>{districtOption}</option>
                                ))}
                            </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-[#42453E] sm:col-span-2">
                            <input type="checkbox" checked={sharedPhoneMode} onChange={(event) => setSharedPhoneMode(event.target.checked)} />
                            Sign out after each session on this shared phone
                        </label>
                        <div>
                            <label htmlFor="settings-class-level" className="block text-sm font-medium text-[#42453E]">
                                Class level
                            </label>
                            <select
                                id="settings-class-level"
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
                            <Button type="submit" disabled={savingProfile} className="rounded-xl">
                                {savingProfile ? "Saving..." : "Save changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
                <CardContent className="p-6 sm:p-7">
                    <h2 className="font-semibold text-[#30332C]">Change PIN</h2>
                    <p className="mt-1 text-sm text-[#686B62]">
                        You will need your current PIN. Other active sessions will be signed out.
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

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <div>
                            <label htmlFor="current-pin" className="block text-sm font-medium text-[#42453E]">
                                Current PIN
                            </label>
                            <input
                                id="current-pin"
                                type="password"
                                autoComplete="one-time-code"
                                required
                                value={currentPin}
                                onChange={(event) => setCurrentPin(event.target.value)}
                                className="mt-1 w-full rounded-lg border border-[#D9DACE] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#87966A] focus:ring-2 focus:ring-[#87966A]/20"
                            />
                        </div>
                        <div>
                            <label htmlFor="settings-new-pin" className="block text-sm font-medium text-[#42453E]">
                                New PIN
                            </label>
                            <input
                                id="settings-new-pin"
                                type="password"
                                autoComplete="new-password"
                                minLength={8}
                                maxLength={128}
                                required
                                value={newPin}
                                onChange={(event) => setNewPin(event.target.value)}
                                className="mt-1 w-full rounded-lg border border-[#D9DACE] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#87966A] focus:ring-2 focus:ring-[#87966A]/20"
                            />
                        </div>
                        <div>
                            <label htmlFor="settings-confirm-pin" className="block text-sm font-medium text-[#42453E]">
                                Confirm new PIN
                            </label>
                            <input
                                id="settings-confirm-pin"
                                type="password"
                                autoComplete="new-password"
                                minLength={8}
                                maxLength={128}
                                required
                                value={confirmPin}
                                onChange={(event) => setConfirmPin(event.target.value)}
                                className="mt-1 w-full rounded-lg border border-[#D9DACE] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#87966A] focus:ring-2 focus:ring-[#87966A]/20"
                            />
                        </div>
                        <Button type="submit" disabled={saving} className="rounded-xl">
                            {saving ? "Updating..." : "Change PIN"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
