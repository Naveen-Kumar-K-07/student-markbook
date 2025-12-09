import { useState } from "react";
import { StudentForm } from "@/components/StudentForm";
import { MarksForm } from "@/components/MarksForm";
import { ResultsTable } from "@/components/ResultsTable";
import { StatsCards } from "@/components/StatsCards";
import { GraduationCap } from "lucide-react";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground py-8 sm:py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="p-3 sm:p-4 bg-primary-foreground/10 backdrop-blur-sm rounded-2xl">
              <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
                Student Marks Manager
              </h1>
              <p className="text-primary-foreground/80 mt-1 text-sm sm:text-base">
                Track, manage and analyze student academic performance
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <section>
          <StatsCards refreshTrigger={refreshTrigger} />
        </section>

        {/* Forms Section */}
        <section className="grid md:grid-cols-2 gap-6">
          <StudentForm onStudentAdded={triggerRefresh} />
          <MarksForm onMarksAdded={triggerRefresh} refreshTrigger={refreshTrigger} />
        </section>

        {/* Results Table */}
        <section>
          <ResultsTable refreshTrigger={refreshTrigger} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container max-w-6xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Student Marks Management System • Built with Lovable</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
