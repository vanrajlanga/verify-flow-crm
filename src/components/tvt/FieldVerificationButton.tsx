
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FieldVerificationButtonProps {
  leadId: string;
  fieldName: string;
  fieldValue: string;
  currentUserId: string;
  isVerified?: boolean;
  verificationNotes?: string;
  onVerificationUpdate?: () => void;
}

const FieldVerificationButton = ({ 
  leadId, 
  fieldName, 
  fieldValue, 
  currentUserId,
  isVerified = false,
  verificationNotes = '',
  onVerificationUpdate 
}: FieldVerificationButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState(verificationNotes);
  const [verified, setVerified] = useState(isVerified);
  const [loading, setLoading] = useState(false);

  const handleVerification = async (isVerifiedValue: boolean) => {
    setLoading(true);
    try {
      // First check if a record exists
      const { data: existingRecord } = await supabase
        .from('field_verifications')
        .select('*')
        .eq('lead_id', leadId)
        .eq('field_name', fieldName)
        .single();

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('field_verifications')
          .update({
            is_verified: isVerifiedValue,
            verified_by: currentUserId,
            verified_at: new Date().toISOString(),
            verification_notes: notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('field_verifications')
          .insert({
            lead_id: leadId,
            field_name: fieldName,
            is_verified: isVerifiedValue,
            verified_by: currentUserId,
            verified_at: new Date().toISOString(),
            verification_notes: notes
          });

        if (error) throw error;
      }

      setVerified(isVerifiedValue);
      setIsOpen(false);
      
      if (onVerificationUpdate) {
        onVerificationUpdate();
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      // Fallback to localStorage if database fails
      const key = `verification_${leadId}_${fieldName}`;
      localStorage.setItem(key, JSON.stringify({
        isVerified: isVerifiedValue,
        verifiedBy: currentUserId,
        verifiedAt: new Date().toISOString(),
        notes: notes
      }));
      setVerified(isVerifiedValue);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={verified ? "default" : "outline"} 
            size="sm"
            className={verified ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Phone className="h-3 w-3 mr-1" />
            {verified ? "Verified" : "Verify"}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Field: {fieldName}</DialogTitle>
            <DialogDescription>
              Call the customer to verify this information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium">Current Value:</Label>
              <p className="text-sm mt-1">{fieldValue || 'Not provided'}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Verification Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes from the verification call..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => handleVerification(true)}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Verified
              </Button>
              <Button 
                onClick={() => handleVerification(false)}
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-1" />
                Not Verified
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {verified && (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <Check className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      )}
    </div>
  );
};

export default FieldVerificationButton;
