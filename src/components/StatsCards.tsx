import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, Award, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StatsCardsProps {
  refreshTrigger: number;
}

export function StatsCards({ refreshTrigger }: StatsCardsProps) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    passRate: 0,
    avgPercentage: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    const { count: studentCount } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });
    
    const { count: subjectCount } = await supabase
      .from("subjects")
      .select("*", { count: "exact", head: true });
    
    const { data: students } = await supabase.from("students").select("id");
    const { data: marks } = await supabase
      .from("marks")
      .select("*, subjects(max_marks, passing_marks)");

    let passCount = 0;
    let totalPercentage = 0;
    let studentsWithMarks = 0;

    students?.forEach((student) => {
      const studentMarks = marks?.filter((m) => m.student_id === student.id) || [];
      if (studentMarks.length > 0) {
        studentsWithMarks++;
        const totalMarks = studentMarks.reduce((sum, m) => sum + m.marks_obtained, 0);
        const maxMarks = studentMarks.reduce((sum, m) => sum + (m.subjects?.max_marks || 100), 0);
        const percentage = (totalMarks / maxMarks) * 100;
        totalPercentage += percentage;
        
        const passedAll = studentMarks.every((m) => {
          return m.marks_obtained >= (m.subjects?.passing_marks || 35);
        });
        if (passedAll) passCount++;
      }
    });

    setStats({
      totalStudents: studentCount || 0,
      totalSubjects: subjectCount || 0,
      passRate: studentsWithMarks > 0 ? Math.round((passCount / studentsWithMarks) * 100) : 0,
      avgPercentage: studentsWithMarks > 0 ? Math.round(totalPercentage / studentsWithMarks) : 0,
    });
  };

  const statItems = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      gradient: "gradient-primary",
    },
    {
      label: "Subjects",
      value: stats.totalSubjects,
      icon: BookOpen,
      gradient: "gradient-success",
    },
    {
      label: "Pass Rate",
      value: `${stats.passRate}%`,
      icon: Award,
      gradient: "gradient-hero",
    },
    {
      label: "Avg. Percentage",
      value: `${stats.avgPercentage}%`,
      icon: TrendingUp,
      gradient: "gradient-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <Card 
          key={item.label} 
          className="shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-slide-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 sm:p-3 rounded-xl ${item.gradient}`}>
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.label}</p>
                <p className="text-xl sm:text-2xl font-bold">{item.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
