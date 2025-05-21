
import { useState } from 'react';
import { User } from '@/utils/mockData';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditAgentFormProps {
  agent: User;
  onUpdate: (updatedAgent: User) => void;
  onClose: () => void;
  locationData: any;
}

const EditAgentForm = ({ agent, onUpdate, onClose, locationData }: EditAgentFormProps) => {
  const [name, setName] = useState(agent.name);
  const [email, setEmail] = useState(agent.email);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState(agent.district || "");
  const [password, setPassword] = useState("");
  
  const availableDistricts = locationData.states.find((s: any) => s.name === state)?.districts || [];

  const handleUpdate = () => {
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Error",
        description: "Name and email are required.",
        variant: "destructive",
      });
      return;
    }

    const updatedAgent: User = {
      ...agent,
      name,
      email,
      district: district || agent.district
    };
    
    onUpdate(updatedAgent);
    toast({
      title: "Agent updated",
      description: `${name} has been updated successfully.`,
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="state" className="text-sm font-medium">
            State
          </label>
          <Select 
            onValueChange={(value) => {
              setState(value);
              setDistrict('');
            }}
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {locationData.states.map((state: any) => (
                <SelectItem key={state.id} value={state.name}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="district" className="text-sm font-medium">
            District
          </label>
          <Select 
            onValueChange={setDistrict}
            defaultValue={district}
            disabled={availableDistricts.length === 0 && !state}
          >
            <SelectTrigger id="district">
              <SelectValue placeholder={
                state ? (availableDistricts.length === 0 ? "No districts available" : "Select district") : "Select a state first"
              } />
            </SelectTrigger>
            <SelectContent>
              {availableDistricts.map((district: any) => (
                <SelectItem key={district.id} value={district.name}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            New Password (optional)
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            placeholder="Leave blank to keep current password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleUpdate}>
          Update Agent
        </Button>
      </div>
    </div>
  );
};

export default EditAgentForm;
