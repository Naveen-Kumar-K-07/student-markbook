import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StudentFormProps {
  onStudentAdded: () => void;
}

export function StudentForm({ onStudentAdded }: StudentFormProps) {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !rollNumber.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    
    const { error } = await supabase
      .from("students")
      .insert({ name: name.trim(), roll_number: rollNumber.trim() });

    if (error) {
      if (error.code === "23505") {
        toast.error("Roll number already exists");
      } else {
        toast.error("Failed to add student");
      }
    } else {
      toast.success("Student added successfully");
      setName("");
      setRollNumber("");
      onStudentAdded();
    }
    
    setLoading(false);
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-300 animate-slide-up">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 rounded-lg gradient-primary">
            <UserPlus className="h-5 w-5 text-primary-foreground" />
          </div>
          Add New Student
        </CardTitle>
        <CardDescription>Register a new student in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Student Name</Label>
            <Input
              id="name"
              placeholder="Enter student name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rollNumber">Roll Number</Label>
            <Input
              id="rollNumber"
              placeholder="Enter roll number"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full gradient-primary hover:opacity-90 transition-opacity"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Student
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
