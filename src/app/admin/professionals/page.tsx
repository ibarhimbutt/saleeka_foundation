
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sampleProfessionalProfiles, type ProfessionalProfile } from "@/lib/constants";
import { Mail, Linkedin, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminProfessionalsPage() {
  const professionals: ProfessionalProfile[] = sampleProfessionalProfiles;

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="font-headline text-2xl text-primary">Manage Professionals</CardTitle>
        <CardDescription>View and manage professional (mentor) profiles.</CardDescription>
      </CardHeader>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.map((professional) => (
                <TableRow key={professional.id}>
                  <TableCell className="font-medium">{professional.name}</TableCell>
                  <TableCell>{professional.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {professional.expertise.map(skill => (
                        <span key={skill} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-sm truncate">{professional.bio}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {professional.linkedinUrl && (
                      <Button asChild variant="outline" size="icon" className="h-8 w-8">
                        <Link href={professional.linkedinUrl} target="_blank" title="View LinkedIn">
                          <Linkedin className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="outline" size="icon" className="h-8 w-8">
                      <a href={`mailto:${professional.email}`} title={`Email ${professional.name}`}>
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
       {professionals.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No professional profiles found.</p>
      )}
    </div>
  );
}

