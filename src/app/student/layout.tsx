import { AuthSync } from "@/components/providers/AuthSync";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { StudentSidebar } from "@/components/student/StudentSidebar";

export default function StudentLayout({ children }: LayoutProps<"/student">) {
  return (
    <StoreProvider>
      <AuthSync />
      <div className="min-h-screen bg-slate-100 flex">
        <StudentSidebar />
        <main className="flex-1 overflow-auto bg-slate-50">{children}</main>
      </div>
    </StoreProvider>
  );
}
