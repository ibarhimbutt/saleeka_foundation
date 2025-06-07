
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sampleStudentProfiles, type StudentProfile } from "@/lib/constants";
import { Mail, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminStudentsPage() {
  const students: StudentProfile[] = sampleStudentProfiles;

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="font-headline text-2xl text-primary">Manage Students</CardTitle>
        <CardDescription>View and manage student profiles.</CardDescription>
      </CardHeader>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Interests</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.joinDate}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {student.interests.map(interest => (
                        <span key={interest} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {student.resumeUrl && (
                      <Button asChild variant="outline" size="icon" className="h-8 w-8">
                        <Link href={student.resumeUrl} target="_blank" title="View Resume">
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="outline" size="icon" className="h-8 w-8">
                      <a href={`mailto:${student.email}`} title={`Email ${student.name}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       {students.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No student profiles found.</p>
      )}
    </div>
  );
}
