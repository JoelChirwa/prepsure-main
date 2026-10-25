import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useStudentAuth } from "../context/StudentAuthContext";

function getInitials(name) {
    return name
        ?.trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "U";
}

function ProfileAvatar({ user, name }) {
    const [imageFailed, setImageFailed] = useState(false);
    const imageUrl =
        user.profilePicture || user.avatarUrl || user.photoURL || user.picture;

    return (
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#D0D4C4] bg-[#E7EADF] text-sm font-bold text-[#596443]">
            {imageUrl && !imageFailed ? (
                <img
                    src={imageUrl}
                    alt=""
                    className="size-full object-cover"
                    onError={() => setImageFailed(true)}
                />
            ) : (
                getInitials(name)
            )}
        </span>
    );
}

export default function WorkspaceHeader({ role }) {
    const { user: admin } = useAuth();
    const { student } = useStudentAuth();
    const isAdmin = role === "admin";
    const user = isAdmin ? admin : student;

    if (!user) return null;

    const name =
        user.name?.trim() || (isAdmin ? "Administrator" : "Student");

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#D9DACE] bg-white/95 px-4 text-[#30332C] backdrop-blur sm:px-6 md:px-8">
            <Link
                to={isAdmin ? "/admin" : "/student"}
                className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#87966A] md:hidden"
            >
                <img
                    src="/logo.png"
                    alt=""
                    className="h-9 w-12 rounded-lg bg-white object-contain p-1"
                />
                <span>
                    <span className="block font-heading text-base font-bold tracking-tight text-[#20231D]">
                        PrepSure
                    </span>
                    <span className="block text-[9px] font-semibold tracking-[0.12em] text-[#66734F]">
                        {isAdmin ? "ADMIN WORKSPACE" : "SCIENCE WORKSPACE"}
                    </span>
                </span>
            </Link>

            <div className="hidden text-sm font-medium text-[#686B62] md:block">
                {isAdmin ? "Admin workspace" : "Student workspace"}
            </div>

            {isAdmin ? (
                <div className="flex items-center gap-3">
                    <div className="hidden text-right sm:block">
                        <p className="text-sm font-semibold text-[#30332C]">
                            {name}
                        </p>
                        <p className="text-xs text-[#686B62]">Administrator</p>
                    </div>
                    <ProfileAvatar user={user} name={name} />
                </div>
            ) : (
                <Link
                    to="/profile"
                    aria-label={`Open ${name}'s profile`}
                    className="flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#87966A] focus-visible:ring-offset-2"
                >
                    <span className="hidden text-right sm:block">
                        <span className="block text-sm font-semibold text-[#30332C]">
                            {name}
                        </span>
                        <span className="block text-xs text-[#686B62]">
                            My profile
                        </span>
                    </span>
                    <ProfileAvatar user={user} name={name} />
                </Link>
            )}
        </header>
    );
}
