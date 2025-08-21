import { Brain } from "lucide-react";

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
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-helvetica">
          Transform your presentations into beautiful notes and interactive quizzes with AI
        </p>
      </div>
    </>
  );
}
