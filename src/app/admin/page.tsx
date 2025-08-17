
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { sampleStudentProfiles, sampleMentorProfiles, sampleOrganizationProfiles, sampleDonorProfiles } from "@/lib/constants";
import { Users, Briefcase, Building2, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Students", value: sampleStudentProfiles.length, icon: Users, color: "text-blue-500", href: "/admin/students" },
    { title: "Total Mentors", value: sampleMentorProfiles.length, icon: Briefcase, color: "text-green-500", href: "/admin/mentors" },
    { title: "Total Organizations", value: sampleOrganizationProfiles.length, icon: Building2, color: "text-purple-500", href: "/admin/organizations" },
    { title: "Total Donors", value: sampleDonorProfiles.length, icon: Heart, color: "text-red-500", href: "/admin/donors" },
  ];

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of Saleeka platform data.</p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Button asChild variant="link" className="p-0 h-auto text-xs text-muted-foreground mt-1">
                <Link href={stat.href}>View All &rarr;</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="font-headline text-2xl font-semibold mb-4 text-primary">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manage Content</CardTitle>
              <CardDescription>Edit blog posts, programs, etc. (Placeholder)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled>Go to Content Manager</Button>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Settings</CardTitle>
              <CardDescription>Configure site settings. (Placeholder)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled>Configure Settings</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
