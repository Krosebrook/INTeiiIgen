import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Building2, Plus, Users, Settings, Trash2, UserPlus, Crown, Loader2 } from "lucide-react";

interface Organization {
  id: number;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
}

interface OrganizationMember {
  id: number;
  organizationId: number;
  userId: string;
  role: string;
  createdAt: string;
}

function CreateOrgDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/organizations", { name, slug });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      toast({ title: "Organization created", description: "Your organization is ready." });
      setOpen(false);
      setName("");
      setSlug("");
      onSuccess();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create organization", variant: "destructive" });
    },
  });

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-org">
          <Plus className="h-4 w-4 mr-2" />
          New Organization
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              data-testid="input-org-name"
              placeholder="My Company"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-slug">Slug</Label>
            <Input
              id="org-slug"
              data-testid="input-org-slug"
              placeholder="my-company"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            />
            <p className="text-sm text-muted-foreground">
              Used in URLs and identifiers
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            data-testid="button-submit-org"
            onClick={() => createMutation.mutate()}
            disabled={!name || !slug || createMutation.isPending}
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MembersList({ organizationId, isOwner }: { organizationId: number; isOwner: boolean }) {
  const { toast } = useToast();
  const [newMemberId, setNewMemberId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");

  const { data: members = [], isLoading } = useQuery<OrganizationMember[]>({
    queryKey: [`/api/organizations/${organizationId}/members`],
  });

  const addMemberMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/organizations/${organizationId}/members`, { memberUserId: newMemberId, role: newMemberRole });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${organizationId}/members`] });
      toast({ title: "Member added", description: "New member has been added to the organization." });
      setNewMemberId("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add member", variant: "destructive" });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      await apiRequest("DELETE", `/api/organizations/${organizationId}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${organizationId}/members`] });
      toast({ title: "Member removed", description: "Member has been removed from the organization." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to remove member", variant: "destructive" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/organizations/${organizationId}/members/${memberId}`, { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${organizationId}/members`] });
      toast({ title: "Role updated", description: "Member role has been updated." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update role", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
        <div className="flex-1 space-y-2 w-full sm:w-auto">
          <Label htmlFor="member-id">User ID</Label>
          <Input
            id="member-id"
            data-testid="input-member-id"
            placeholder="Enter user ID to invite"
            value={newMemberId}
            onChange={(e) => setNewMemberId(e.target.value)}
            disabled={!isOwner}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="member-role">Role</Label>
          <Select value={newMemberRole} onValueChange={setNewMemberRole} disabled={!isOwner}>
            <SelectTrigger id="member-role" className="w-32" data-testid="select-member-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          data-testid="button-add-member"
          onClick={() => addMemberMutation.mutate()}
          disabled={!newMemberId || !isOwner || addMemberMutation.isPending}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      <div className="space-y-2 pt-4 border-t">
        <h4 className="font-medium">Members ({members.length})</h4>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members yet.</p>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-md gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate max-w-[200px]">{member.userId}</span>
                  <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                    {member.role === "owner" && <Crown className="h-3 w-3 mr-1" />}
                    {member.role}
                  </Badge>
                </div>
                {isOwner && member.role !== "owner" && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={member.role}
                      onValueChange={(role) => updateRoleMutation.mutate({ memberId: member.id, role })}
                    >
                      <SelectTrigger className="w-24" data-testid={`select-role-${member.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-testid={`button-remove-member-${member.id}`}
                      onClick={() => removeMemberMutation.mutate(member.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrganizationCard({ org, currentUserId }: { org: Organization; currentUserId?: string }) {
  const { toast } = useToast();
  const [showMembers, setShowMembers] = useState(false);
  const isOwner = org.ownerId === currentUserId;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/organizations/${org.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      toast({ title: "Organization deleted", description: "The organization has been deleted." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete organization", variant: "destructive" });
    },
  });

  return (
    <Card data-testid={`card-org-${org.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">{org.name}</CardTitle>
              <CardDescription className="truncate">/{org.slug}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isOwner && (
              <Badge variant="secondary">
                <Crown className="h-3 w-3 mr-1" />
                Owner
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            data-testid={`button-manage-members-${org.id}`}
            onClick={() => setShowMembers(!showMembers)}
          >
            <Users className="h-4 w-4 mr-2" />
            Members
          </Button>
          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid={`button-delete-org-${org.id}`}>
                  <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Organization?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{org.name}" and all associated data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        
        {showMembers && (
          <div className="mt-4 pt-4 border-t">
            <MembersList organizationId={org.id} isOwner={isOwner} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function OrganizationsPage() {
  const { user } = useAuth();
  
  const { data: organizations = [], isLoading } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">
            Manage your organizations and team members
          </p>
        </div>
        <CreateOrgDialog onSuccess={() => {}} />
      </div>

      {organizations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Organizations</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first organization to collaborate with your team.
            </p>
            <CreateOrgDialog onSuccess={() => {}} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {organizations.map((org) => (
            <OrganizationCard 
              key={org.id} 
              org={org} 
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
