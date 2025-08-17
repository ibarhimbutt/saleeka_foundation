import SectionTitle from '@/components/shared/SectionTitle';
import InvolvementCard from '@/components/get-involved/InvolvementCard';
import { involvementTypes } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Placeholder forms for different involvement types
const StudentForm = () => (
  <Card className="w-full max-w-lg mx-auto">
    <CardHeader>
      <CardTitle className="font-headline">Student Registration</CardTitle>
      <CardDescription>Join our community to find mentors and projects.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="student-name">Full Name</Label>
        <Input id="student-name" placeholder="Your Full Name" />
      </div>
      <div>
        <Label htmlFor="student-email">Email</Label>
        <Input id="student-email" type="email" placeholder="Your Email" />
      </div>
      <div>
        <Label htmlFor="student-resume">Resume (Optional)</Label>
        <Input id="student-resume" type="file" />
      </div>
      <div>
        <Label htmlFor="student-interests">Interests/Skills</Label>
        <Textarea id="student-interests" placeholder="Tell us about your interests and skills" />
      </div>
      <Button className="w-full">Register</Button>
    </CardContent>
  </Card>
);

const MentorForm = () => {
  const categories = [
    'Software Engineering',
    'Data Science',
    'Product Management',
    'Marketing',
    'Design',
    'Business',
    'Healthcare',
    'Education'
  ];

  return (
   <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="font-headline">Become a Mentor</CardTitle>
        <CardDescription>Share your expertise and guide aspiring students.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="mentor-name">Full Name</Label>
          <Input id="mentor-name" placeholder="Your Full Name" />
        </div>
        <div>
          <Label htmlFor="mentor-email">Email</Label>
          <Input id="mentor-email" type="email" placeholder="Your Email" />
        </div>
        <div>
          <Label htmlFor="mentor-category">Primary Category *</Label>
          <select id="mentor-category" className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="mentor-expertise">Area of Expertise</Label>
          <Input id="mentor-expertise" placeholder="e.g., Software Engineering, Marketing" />
        </div>
        <div>
          <Label htmlFor="mentor-linkedin">LinkedIn Profile (Optional)</Label>
          <Input id="mentor-linkedin" placeholder="Your LinkedIn URL" />
        </div>
        <Button className="w-full">Offer Mentorship</Button>
      </CardContent>
    </Card>
  );
};

const OrganizationForm = () => (
  <Card className="w-full max-w-lg mx-auto">
    <CardHeader>
      <CardTitle className="font-headline">Post a Project</CardTitle>
      <CardDescription>Offer real-world projects for students.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="org-name">Organization Name</Label>
        <Input id="org-name" placeholder="Your Organization's Name" />
      </div>
      <div>
        <Label htmlFor="project-title">Project Title</Label>
        <Input id="project-title" placeholder="Title of the Project" />
      </div>
      <div>
        <Label htmlFor="project-desc">Project Description</Label>
        <Textarea id="project-desc" placeholder="Describe the project and required skills" />
      </div>
      <Button className="w-full">Submit Project</Button>
    </CardContent>
  </Card>
);

const DonorForm = () => (
  <Card className="w-full max-w-lg mx-auto">
    <CardHeader>
      <CardTitle className="font-headline">Support Saleeka Foundation</CardTitle>
      <CardDescription>Your contribution helps us empower more individuals.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Thank you for considering a donation to Saleeka Foundation. Your support is vital for our programs.
        Please contact us at <a href="mailto:info@saleeka.org" className="text-primary hover:underline">info@saleeka.org</a> for donation details or click the button below.
      </p>
      <Button className="w-full">Donate Now (External Link)</Button>
       <p className="text-xs text-muted-foreground text-center pt-2">You will be redirected to our secure donation portal.</p>
    </CardContent>
  </Card>
);


export default async function GetInvolvedPage({ 
  searchParams 
}: { 
  searchParams?: Promise<{ tab?: string }> 
}) {
  const params = searchParams ? await searchParams : undefined;
  const initialTab = params?.tab && involvementTypes.some(type => type.id === params.tab)
    ? params.tab
    : involvementTypes[0].id;

  return (
    <div className="space-y-16">
      <SectionTitle
        title="Get Involved with Saleeka"
        subtitle="There are many ways to contribute and be a part of our growing community. Find your way to make an impact."
      />

      <section className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {involvementTypes.map((item) => (
            <InvolvementCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="container">
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="mentors">Mentors</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="donors">Donors</TabsTrigger>
          </TabsList>
          <TabsContent value="students"><StudentForm /></TabsContent>
          <TabsContent value="mentors"><MentorForm /></TabsContent>
          <TabsContent value="organizations"><OrganizationForm /></TabsContent>
          <TabsContent value="donors"><DonorForm /></TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
