
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sampleDonorProfiles, type DonorProfile } from "@/lib/constants";
import { Mail, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminDonorsPage() {
  const donors: DonorProfile[] = sampleDonorProfiles;

  const getStatusVariant = (status: DonorProfile['status']) => {
    return status === 'Processed' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="font-headline text-2xl text-primary">Manage Donors</CardTitle>
        <CardDescription>View and manage donor profiles and contributions.</CardDescription>
      </CardHeader>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Donation Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donors.map((donor) => (
                <TableRow key={donor.id}>
                  <TableCell className="font-medium">{donor.name}</TableCell>
                  <TableCell>{donor.email || 'N/A'}</TableCell>
                  <TableCell>{donor.donationDate}</TableCell>
                  <TableCell className="text-right font-mono">${donor.amount.toLocaleString()}</TableCell>
                  <TableCell>{donor.type}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(donor.status)}>{donor.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {donor.email && (
                      <Button asChild variant="outline" size="icon" className="h-8 w-8">
                        <a href={`mailto:${donor.email}`} title={`Email ${donor.name}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {donors.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No donor profiles found.</p>
      )}
    </div>
  );
}

