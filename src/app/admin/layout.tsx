import SceneBackground from "@/components/3d/SceneBackground";
import { StoreProvider } from "@/components/providers/StoreProvider";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <StoreProvider>
      <div className="relative min-h-screen grid-bg flex">
        <SceneBackground />
        {children}
      </div>
    </StoreProvider>
  );
}
