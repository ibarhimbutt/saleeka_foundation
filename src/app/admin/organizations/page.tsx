
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sampleOrganizationProfiles, type OrganizationProfile } from "@/lib/constants";
import { Mail, ExternalLink, Info } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function AdminOrganizationsPage() {
  const organizations: OrganizationProfile[] = sampleOrganizationProfiles;

  const getStatusVariant = (status: OrganizationProfile['status']) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Pending': return 'secondary';
      case 'Inactive': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="font-headline text-2xl text-primary">Manage Organizations</CardTitle>
        <CardDescription>View and manage organization profiles.</CardDescription>
      </CardHeader>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Project Areas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>{org.contactEmail}</TableCell>
                  <TableCell>{org.industry}</TableCell>
                  <TableCell>
                     <div className="flex flex-wrap gap-1 max-w-xs">
                        {org.projectAreas.map(area => (
                          <span key={area} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                            {area}
                          </span>
                        ))}
                      </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(org.status)}>{org.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="icon" className="h-8 w-8">
                      <Link href={org.website} target="_blank" title="Visit Website">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="icon" className="h-8 w-8">
                      <a href={`mailto:${org.contactEmail}`} title={`Email ${org.name}`}>
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
      {organizations.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No organization profiles found.</p>
      )}
    </div>
  );
}
