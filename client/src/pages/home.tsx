import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import WelcomeMessage from "@/components/welcome-message";
import FileUpload from "@/components/file-upload";
import { useIsMobile } from "@/hooks/use-mobile";

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleNewSession = () => {
    setCurrentSessionId(null);
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="font-poppins bg-content-bg text-foreground h-screen overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewSession={handleNewSession}
        onSessionSelect={handleSessionSelect}
        currentSessionId={currentSessionId}
      />

      {/* Main Content */}
      <div className="ml-0 md:ml-64 h-full flex flex-col">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {!currentSessionId ? (
              <>
                <WelcomeMessage />
                <FileUpload 
                  sessionId={currentSessionId}
                  onSessionCreated={setCurrentSessionId}
                />
              </>
            ) : (
              <FileUpload 
                sessionId={currentSessionId}
                onSessionCreated={setCurrentSessionId}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
