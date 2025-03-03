
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthorizationSectionProps {
  requiresAuth: boolean;
  authLink: string;
  onRequiresAuthChange: (value: boolean) => void;
  onAuthLinkChange: (value: string) => void;
}

export const AuthorizationSection = ({
  requiresAuth,
  authLink,
  onRequiresAuthChange,
  onAuthLinkChange
}: AuthorizationSectionProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="requires_authorization" 
          checked={requiresAuth}
          onCheckedChange={(checked) => onRequiresAuthChange(checked === true)}
        />
        <Label htmlFor="requires_authorization">Nécessite une autorisation</Label>
      </div>
      
      {requiresAuth && (
        <div className="mt-2">
          <Label htmlFor="authorization_link">Lien vers les informations d'autorisation</Label>
          <Input 
            id="authorization_link" 
            value={authLink}
            onChange={(e) => onAuthLinkChange(e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}
    </div>
  );
};
