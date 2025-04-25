import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { Document, Comment, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CommentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

export default function CommentsModal({ open, onOpenChange, document }: CommentsModalProps) {
  const [commentText, setCommentText] = useState("");
  const { user } = useAuth();
  
  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/documents/${document?.id}/comments`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!document?.id && open,
  });
  
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!document?.id && open && !!user?.isAdmin,
  });
  
  const addCommentMutation = useMutation({
    mutationFn: async (commentData: { documentId: number; text: string }) => {
      const res = await apiRequest("POST", "/api/comments", commentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${document?.id}/comments`] });
      setCommentText("");
    },
  });
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!document?.id || !commentText.trim()) return;
    
    addCommentMutation.mutate({
      documentId: document.id,
      text: commentText.trim()
    });
  };
  
  // Helper function to get user data for a comment
  const getUserForComment = (userId: number) => {
    return users?.find(u => u.id === userId) || null;
  };
  
  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-montserrat">
            Comentarios: <span className="text-primary">{document?.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-4 my-4 min-h-[300px]">
          {isLoading ? (
            // Loading skeletons
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <Skeleton className="w-8 h-8 rounded-full mr-2" />
                    <div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </div>
            ))
          ) : comments && comments.length > 0 ? (
            // Comments list
            comments.map((comment) => {
              const commentUser = getUserForComment(comment.userId);
              const userName = commentUser?.fullName || "Usuario";
              const initials = getInitials(userName);
              
              return (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-medium mr-2">
                        <span>{initials}</span>
                      </div>
                      <div>
                        <span className="font-medium text-secondary">{userName}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-secondary">{comment.text}</p>
                </div>
              );
            })
          ) : (
            // No comments message
            <div className="text-center py-12 text-muted-foreground">
              No hay comentarios para este documento.
            </div>
          )}
        </div>
        
        <DialogFooter className="border-t border-gray-200 pt-4">
          <form className="flex w-full" onSubmit={handleSubmitComment}>
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Añadir un comentario..."
              className="flex-1 mr-2"
            />
            <Button 
              type="submit" 
              className="flex items-center"
              disabled={!commentText.trim() || addCommentMutation.isPending}
            >
              <Send className="h-4 w-4 mr-1" /> Enviar
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
