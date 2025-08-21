import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

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
      <div className={`transition-all duration-300 h-full flex flex-col ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-3xl">
            <FileUpload 
              sessionId={currentSessionId}
              onSessionCreated={setCurrentSessionId}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
