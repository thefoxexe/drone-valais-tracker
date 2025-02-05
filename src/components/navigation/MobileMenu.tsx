import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { NavLinks } from "./NavLinks";

interface MobileMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onResourceClick: () => void;
  onInvoiceClick: () => void;
  onLogout: () => void;
}

export const MobileMenu = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  onResourceClick,
  onInvoiceClick,
  onLogout,
}: MobileMenuProps) => {
  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[80%] bg-background p-0">
        <div className="flex flex-col space-y-4 p-4">
          <NavLinks 
            onResourceClick={() => {
              onResourceClick();
              setMobileMenuOpen(false);
            }}
            onInvoiceClick={() => {
              onInvoiceClick();
              setMobileMenuOpen(false);
            }}
            onLogout={onLogout}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};