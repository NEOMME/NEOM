import SceneBackground from "@/components/3d/SceneBackground";
import { AuthSync } from "@/components/providers/AuthSync";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { StudentSidebar } from "@/components/student/StudentSidebar";

export default function StudentLayout({ children }: LayoutProps<"/student">) {
  return (
    <StoreProvider>
      <AuthSync />
      <div className="relative min-h-screen grid-bg flex">
        <SceneBackground />
        <StudentSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </StoreProvider>
  );
}
