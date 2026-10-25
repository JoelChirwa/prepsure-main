
import {
  FlaskConical,
  ClipboardList,
  ChartNoAxesColumnIncreasing,
  ShieldCheck,
} from "lucide-react";

export const features = [
  {
    title: "Experiments",
    description:
      "Explore Chemistry experiments with step-by-step guidance and safety tips.",
    icon: FlaskConical,
    color: "blue",
    page: "experiments",
  },
  {
    title: "Quizzes",
    description:
      "Test your knowledge with chapter-wise and topic-wise quizzes.",
    icon: ClipboardList,
    color: "green",
    page: "quizzes",
  },
  {
    title: "Progress Tracking",
    description:
      "Monitor your performance, identify weak areas and improve over time.",
    icon: ChartNoAxesColumnIncreasing,
    color: "purple",
    page: "progress",
  },
  {
    title: "Admin Portal",
    description:
      "Manage users, content and system settings for authorized administrators.",
    icon: ShieldCheck,
    color: "orange",
    page: "admin",
  },
];
