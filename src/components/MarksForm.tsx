import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  roll_number: string;
}

interface Subject {
  id: string;
  name: string;
  max_marks: number;
}

interface MarksFormProps {
  onMarksAdded: () => void;
  refreshTrigger: number;
}

export function MarksForm({ onMarksAdded, refreshTrigger }: MarksFormProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [maxMarks, setMaxMarks] = useState(100);

  useEffect(() => {
    fetchStudents();
    fetchSubjects();
  }, [refreshTrigger]);

  const fetchStudents = async () => {
    const { data } = await supabase.from("students").select("*").order("name");
    if (data) setStudents(data);
  };

  const fetchSubjects = async () => {
    const { data } = await supabase.from("subjects").select("*").order("name");
    if (data) setSubjects(data);
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) setMaxMarks(subject.max_marks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !selectedSubject || marks === "") {
      toast.error("Please fill in all fields");
      return;
    }

    const marksNum = parseInt(marks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > maxMarks) {
      toast.error(`Marks must be between 0 and ${maxMarks}`);
      return;
    }

    setLoading(true);
    
    const { error } = await supabase
      .from("marks")
      .upsert(
        { 
          student_id: selectedStudent, 
          subject_id: selectedSubject, 
          marks_obtained: marksNum 
        },
        { onConflict: 'student_id,subject_id' }
      );

    if (error) {
      toast.error("Failed to save marks");
    } else {
      toast.success("Marks saved successfully");
      setMarks("");
      onMarksAdded();
    }
    
    setLoading(false);
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-300 animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 rounded-lg gradient-success">
            <BookOpen className="h-5 w-5 text-accent-foreground" />
          </div>
          Enter Marks
        </CardTitle>
        <CardDescription>Record marks for a student in a subject</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Student</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.roll_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Select Subject</Label>
            <Select value={selectedSubject} onValueChange={handleSubjectChange}>
              <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Choose a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="marks">Marks Obtained (Max: {maxMarks})</Label>
            <Input
              id="marks"
              type="number"
              min="0"
              max={maxMarks}
              placeholder={`Enter marks (0-${maxMarks})`}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full gradient-success hover:opacity-90 transition-opacity"
            disabled={loading || students.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Marks
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
