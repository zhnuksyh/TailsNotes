import { Brain, FileUp, StickyNote, HelpCircle, Info } from "lucide-react";

export default function WelcomeMessage() {
  return (
    <>
      {/* Welcome Section */}
      <div className="text-center mb-16">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-orange-yellow rounded-2xl mb-6 shadow-lg">
            <Brain className="text-primary-foreground h-10 w-10" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-foreground mb-6 font-poppins">
          Welcome to <span className="text-gradient-orange">TailsNotes</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed font-helvetica">
          Transform your presentations into beautiful notes and interactive quizzes with AI
        </p>
        
        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          <div className="flex flex-col items-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-gradient-orange rounded-xl flex items-center justify-center mb-4">
              <FileUp className="text-primary-foreground h-7 w-7" />
            </div>
            <h3 className="font-semibold text-foreground mb-3 font-poppins">Smart Upload</h3>
            <p className="text-sm text-muted-foreground text-center font-helvetica">Upload PDF and PowerPoint files with intelligent content extraction</p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-gradient-yellow rounded-xl flex items-center justify-center mb-4">
              <StickyNote className="text-primary-foreground h-7 w-7" />
            </div>
            <h3 className="font-semibold text-foreground mb-3 font-poppins">AI Notes</h3>
            <p className="text-sm text-muted-foreground text-center font-helvetica">Generate structured, comprehensive notes from your content</p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-gradient-orange-yellow rounded-xl flex items-center justify-center mb-4">
              <HelpCircle className="text-primary-foreground h-7 w-7" />
            </div>
            <h3 className="font-semibold text-foreground mb-3 font-poppins">Smart Quizzes</h3>
            <p className="text-sm text-muted-foreground text-center font-helvetica">Create interactive quizzes to test your understanding</p>
          </div>
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-14 h-14 bg-gradient-orange-yellow rounded-xl flex items-center justify-center flex-shrink-0">
            <Info className="text-primary-foreground h-7 w-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-foreground mb-6 font-poppins">Quick Start</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gradient-orange text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 font-poppins">1</div>
                <div>
                  <div className="font-semibold text-foreground font-poppins">Upload Your Slides</div>
                  <div className="text-muted-foreground text-sm font-helvetica mt-1">Drag and drop PDF or PowerPoint files</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gradient-yellow text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 font-poppins">2</div>
                <div>
                  <div className="font-semibold text-foreground font-poppins">Choose Options</div>
                  <div className="text-muted-foreground text-sm font-helvetica mt-1">Select notes, quizzes, or both</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gradient-orange-yellow text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 font-poppins">3</div>
                <div>
                  <div className="font-semibold text-foreground font-poppins">AI Processing</div>
                  <div className="text-muted-foreground text-sm font-helvetica mt-1">Let AI analyze and generate learning materials</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-border">
              <div className="flex items-center gap-2 text-primary text-sm font-medium font-poppins">
                <Info className="h-4 w-4" />
                <span>Pro Tip</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 font-helvetica">
                Upload slides with clear structure for best AI analysis results
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
