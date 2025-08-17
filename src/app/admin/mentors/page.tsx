
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sampleMentorProfiles, type MentorProfile } from "@/lib/constants";
import { Mail, Linkedin, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminMentorsPage() {
  const mentors: MentorProfile[] = sampleMentorProfiles;

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="font-headline text-2xl text-primary">Manage Mentors</CardTitle>
        <CardDescription>View and manage mentor profiles.</CardDescription>
      </CardHeader>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mentors.map((mentor) => (
                <TableRow key={mentor.id}>
                  <TableCell className="font-medium">{mentor.name}</TableCell>
                  <TableCell>{mentor.email}</TableCell>
                  <TableCell>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {mentor.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {mentor.expertise.map(skill => (
                        <span key={skill} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-sm truncate">{mentor.bio}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {mentor.linkedinUrl && (
                      <Button asChild variant="outline" size="icon" className="h-8 w-8">
                        <Link href={mentor.linkedinUrl} target="_blank" title="View LinkedIn">
                          <Linkedin className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="outline" size="icon" className="h-8 w-8">
                      <a href={`mailto:${mentor.email}`} title={`Email ${mentor.name}`}>
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
       {mentors.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No mentor profiles found.</p>
      )}
    </div>
  );
}

