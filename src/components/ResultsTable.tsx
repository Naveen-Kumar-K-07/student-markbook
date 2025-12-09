import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface StudentResult {
  id: string;
  name: string;
  roll_number: string;
  totalMarks: number;
  maxPossibleMarks: number;
  percentage: number;
  status: "Pass" | "Fail";
  rank: number;
  subjectCount: number;
}

interface ResultsTableProps {
  refreshTrigger: number;
}

export function ResultsTable({ refreshTrigger }: ResultsTableProps) {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [refreshTrigger]);

  const fetchResults = async () => {
    setLoading(true);
    
    // Fetch students
    const { data: students } = await supabase.from("students").select("*");
    
    // Fetch all marks with subject info
    const { data: marks } = await supabase
      .from("marks")
      .select("*, subjects(name, max_marks, passing_marks)");
    
    if (!students) {
      setLoading(false);
      return;
    }

    // Calculate results for each student
    const studentResults: StudentResult[] = students.map((student) => {
      const studentMarks = marks?.filter((m) => m.student_id === student.id) || [];
      
      const totalMarks = studentMarks.reduce((sum, m) => sum + m.marks_obtained, 0);
      const maxPossibleMarks = studentMarks.reduce((sum, m) => sum + (m.subjects?.max_marks || 100), 0);
      const percentage = maxPossibleMarks > 0 ? (totalMarks / maxPossibleMarks) * 100 : 0;
      
      // Check if passed in all subjects
      const passedAll = studentMarks.every((m) => {
        const passingMarks = m.subjects?.passing_marks || 35;
        return m.marks_obtained >= passingMarks;
      });
      
      return {
        id: student.id,
        name: student.name,
        roll_number: student.roll_number,
        totalMarks,
        maxPossibleMarks,
        percentage: Math.round(percentage * 100) / 100,
        status: studentMarks.length > 0 && passedAll ? "Pass" : "Fail",
        rank: 0,
        subjectCount: studentMarks.length,
      };
    });

    // Sort by percentage and assign ranks
    studentResults.sort((a, b) => b.percentage - a.percentage);
    studentResults.forEach((result, index) => {
      result.rank = result.subjectCount > 0 ? index + 1 : 0;
    });

    setResults(studentResults);
    setLoading(false);
  };

  const filteredResults = results.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankBadge = (rank: number) => {
    if (rank === 0) return null;
    if (rank === 1) return <Badge className="bg-yellow-500 hover:bg-yellow-600">🥇 1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 hover:bg-gray-500">🥈 2nd</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600 hover:bg-amber-700">🥉 3rd</Badge>;
    return <Badge variant="outline">{rank}th</Badge>;
  };

  return (
    <Card className="shadow-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg gradient-hero">
                <Trophy className="h-5 w-5 text-primary-foreground" />
              </div>
              Student Results
            </CardTitle>
            <CardDescription>View rankings, percentages, and pass/fail status</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No results found. Add students and their marks to see results.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Subjects</TableHead>
                  <TableHead className="text-right">Total Marks</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>{getRankBadge(result.rank)}</TableCell>
                    <TableCell className="font-medium">{result.roll_number}</TableCell>
                    <TableCell>{result.name}</TableCell>
                    <TableCell className="text-center">{result.subjectCount}</TableCell>
                    <TableCell className="text-right">
                      {result.totalMarks} / {result.maxPossibleMarks}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {result.percentage}%
                    </TableCell>
                    <TableCell className="text-center">
                      {result.subjectCount > 0 ? (
                        <Badge
                          className={
                            result.status === "Pass"
                              ? "bg-success hover:bg-success/90"
                              : "bg-destructive hover:bg-destructive/90"
                          }
                        >
                          {result.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline">No Marks</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
