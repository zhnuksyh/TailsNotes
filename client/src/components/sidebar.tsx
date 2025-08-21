import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, X, FileText, File } from "lucide-react";
import { useSessions } from "@/hooks/use-sessions";
import { formatDistanceToNow } from "date-fns";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewSession: () => void;
  onSessionSelect: (sessionId: string) => void;
  currentSessionId: string | null;
}

export default function Sidebar({ 
  isOpen, 
  onClose, 
  onNewSession, 
  onSessionSelect,
  currentSessionId 
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: sessions = [], isLoading } = useSessions();

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (session: any) => {
    return session.filesCount > 0 ? <FileText className="h-4 w-4 text-primary" /> : <File className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className={`
      fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border text-sidebar-foreground z-50 
      transform transition-transform duration-300
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-poppins font-semibold text-gradient-orange">TailsNotes</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground p-1"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* New Session Button */}
          <Button 
            className="w-full bg-gradient-orange-yellow hover:hover:bg-primary/90 text-primary-foreground font-medium transition-all"
            onClick={onNewSession}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>
        
        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-input text-foreground placeholder-muted-foreground border-border focus:border-primary pl-10 transition-all"
            />
          </div>
        </div>
        
        {/* Chat History */}
        <div className="flex-1 overflow-hidden px-4">
          <div className="text-xs text-muted-foreground uppercase font-medium mb-3 tracking-wide font-helvetica">
            Recent Sessions
          </div>
          
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 bg-muted rounded-lg animate-pulse">
                    <div className="h-4 bg-muted-foreground/20 rounded mb-2" />
                    <div className="h-3 bg-muted-foreground/20 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredSessions.length > 0 ? (
              <div className="space-y-2">
                {filteredSessions.map((session) => (
                  <Button
                    key={session.id}
                    variant="ghost"
                    className={`
                      w-full text-left p-3 rounded-lg transition-all duration-200 group h-auto
                      ${currentSessionId === session.id ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent/50'}
                    `}
                    onClick={() => onSessionSelect(session.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex-shrink-0 mt-1">
                        {getFileIcon(session)}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-sm font-medium text-sidebar-foreground truncate font-poppins">
                          {session.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 font-helvetica">
                          {formatDistanceToNow(new Date(session.createdAt!), { addSuffix: true })}
                        </div>
                        <div className="text-xs text-muted-foreground/70 mt-1 font-helvetica">
                          {session.notesCount} notes • {session.quizQuestionsCount} questions
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm font-poppins">No sessions found</p>
                {searchTerm && (
                  <p className="text-xs mt-1 font-helvetica">Try a different search term</p>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center font-helvetica">
            Built by <span className="text-gradient-orange font-medium">HedgeTech</span>
          </div>
        </div>
      </div>
    </div>
  );
}
