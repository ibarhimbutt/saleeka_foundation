"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Calendar, MapPin, Users, Search, Filter } from 'lucide-react';
import SectionTitle from '@/components/shared/SectionTitle';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  location: string;
  duration: string;
  teamSize: number;
  organization: {
    id: string;
    name: string;
    logo?: string;
    industry: string;
  };
  status: 'open' | 'in-progress' | 'completed';
  postedDate: string;
  deadline: string;
  compensation?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log('Fetching projects from API...');
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        console.log('Projects data received:', data);
        setProjects(data.projects || []);
      } else {
        console.error('Failed to fetch projects');
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.organization.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || project.category === categoryFilter;
    const matchesStatus = !statusFilter || project.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(projects.map(p => p.category))];
  const statuses = ['open', 'in-progress', 'completed'];

  if (loading) {
    return (
      <div className="container py-12">
        <LoadingSpinner size="lg" text="Loading projects..." />
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-8">
      <SectionTitle
        title="Explore Projects"
        subtitle="Discover real-world projects from organizations looking for talented students like you"
      />

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects by title, description, or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter || "all"} onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map(status => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    {/* Project Stats */}
    <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Project Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{projects.length}</div>
            <div className="text-sm text-muted-foreground">Total Projects</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {projects.filter(p => p.status === 'open').length}
            </div>
            <div className="text-sm text-muted-foreground">Open Positions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {projects.filter(p => p.status === 'in-progress').length}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(projects.map(p => p.organization.id)).size}
            </div>
            <div className="text-sm text-muted-foreground">Organizations</div>
          </div>
        </div>
      </div>
      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground">
            {searchTerm || (categoryFilter && categoryFilter !== "all") || (statusFilter && statusFilter !== "all")
              ? 'Try adjusting your search criteria'
              : 'Check back later for new project opportunities'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                  <Badge variant="outline">{project.category}</Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">{project.organization.name}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {project.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {project.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.skills.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{project.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{project.teamSize} people</span>
                  </div>
                  {project.compensation && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-green-600">{project.compensation}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button className="w-full" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

  
    </div>
  );
}
