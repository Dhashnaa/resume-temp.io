import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Trash2, Download, Eye } from "lucide-react";

type Resume = {
  id: string;
  title: string;
  lastModified: string;
  status: "draft" | "complete";
};

const sampleResumes: Resume[] = [
  {
    id: "1",
    title: "Software Engineer Resume",
    lastModified: "2 hours ago",
    status: "complete",
  },
  {
    id: "2", 
    title: "Product Manager Resume",
    lastModified: "1 day ago",
    status: "draft",
  },
  {
    id: "3",
    title: "UX Designer Resume",
    lastModified: "3 days ago",
    status: "complete",
  },
];

type DashboardProps = {
  onCreateNew: () => void;
  onEditResume: (id: string) => void;
};

export function Dashboard({ onCreateNew, onEditResume }: DashboardProps) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            My Resumes
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and create professional resumes
          </p>
        </div>
        <Button
          onClick={onCreateNew}
          variant="hero"
          size="lg"
          className="animate-scale-in"
        >
          <FileText className="h-5 w-5" />
          Create New Resume
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sampleResumes.map((resume, index) => (
          <Card
            key={resume.id}
            className="hover:shadow-card transition-smooth cursor-pointer group animate-fade-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg line-clamp-1">
                    {resume.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Modified {resume.lastModified}
                  </p>
                </div>
                <Badge
                  variant={resume.status === "complete" ? "default" : "secondary"}
                  className="ml-2"
                >
                  {resume.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditResume(resume.id)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                <Button size="sm" variant="outline" className="hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sampleResumes.length === 0 && (
        <Card className="text-center py-12 animate-fade-up">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No resumes yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first professional resume to get started
            </p>
            <Button onClick={onCreateNew} variant="hero" size="lg">
              Create Your First Resume
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}