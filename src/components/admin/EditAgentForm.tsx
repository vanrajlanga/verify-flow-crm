
import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from 'lucide-react';

interface EditAgentFormProps {
  agent: User;
  onUpdate: (updatedAgent: User) => void;
  onClose: () => void;
  locationData: any;
}

const EditAgentForm = ({ agent, onUpdate, onClose, locationData }: EditAgentFormProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [name, setName] = useState(agent.name);
  const [email, setEmail] = useState(agent.email);
  const [phone, setPhone] = useState(agent.phone || "");
  const [state, setState] = useState(agent.state || "");
  const [district, setDistrict] = useState(agent.district || "");
  const [city, setCity] = useState(agent.city || "");
  const [password, setPassword] = useState("");
  const [baseLocation, setBaseLocation] = useState(agent.baseLocation || "");
  const [maxTravelDistance, setMaxTravelDistance] = useState(agent.maxTravelDistance || "10");
  const [extraChargePerKm, setExtraChargePerKm] = useState(agent.extraChargePerKm || "5");
  
  // Find the district options for the selected state
  const availableDistricts = locationData.states.find((s: any) => s.name === state)?.districts || [];
  
  // Find the city options for the selected district
  const availableCities = availableDistricts.find((d: any) => d.name === district)?.cities || [];

  // Set initial state based on agent's district when component loads
  useEffect(() => {
    if (agent.district && !state) {
      // Find which state contains this district
      for (const s of locationData.states) {
        const foundDistrict = s.districts.find((d: any) => d.name === agent.district);
        if (foundDistrict) {
          setState(s.name);
          break;
        }
      }
    }
    
    if (agent.city && !city) {
      setCity(agent.city);
    }
  }, [agent.district, agent.city, locationData.states, state, city]);

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
      phone,
      state,
      district,
      city,
      baseLocation,
      maxTravelDistance: maxTravelDistance ? parseInt(maxTravelDistance) : 10,
      extraChargePerKm: extraChargePerKm ? parseInt(extraChargePerKm) : 5
    };
    
    if (password) {
      updatedAgent.password = password;
    }
    
    onUpdate(updatedAgent);
    toast({
      title: "Agent updated",
      description: `${name} has been updated successfully.`,
    });
    onClose();
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="basic" className="flex-1">Basic Info</TabsTrigger>
          <TabsTrigger value="location" className="flex-1">Location & Travel</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 pt-4">
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
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
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
        </TabsContent>
        
        <TabsContent value="location" className="space-y-6 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Location Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="state" className="text-sm font-medium">
                  State
                </label>
                <Select 
                  value={state}
                  onValueChange={(value) => {
                    setState(value);
                    setDistrict('');
                    setCity('');
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
                  value={district}
                  onValueChange={(value) => {
                    setDistrict(value);
                    setCity('');
                  }}
                  disabled={availableDistricts.length === 0}
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
                <label htmlFor="city" className="text-sm font-medium">
                  City
                </label>
                <Select 
                  value={city}
                  onValueChange={setCity}
                  disabled={availableCities.length === 0}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder={
                      district ? (availableCities.length === 0 ? "No cities available" : "Select city") : "Select a district first"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((city: any) => (
                      <SelectItem key={city.id} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Base Location & Travel Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="baseLocation" className="text-sm font-medium">
                  Base Location
                </label>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="baseLocation"
                    value={baseLocation}
                    onChange={(e) => setBaseLocation(e.target.value)}
                    placeholder="Enter precise base location address"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  This will be used to calculate distance to assigned leads
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="maxTravel" className="text-sm font-medium">
                    Maximum Travel Distance (KM)
                  </label>
                  <Input
                    id="maxTravel"
                    type="number"
                    min="1"
                    value={maxTravelDistance}
                    onChange={(e) => setMaxTravelDistance(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="extraCharge" className="text-sm font-medium">
                    Extra Charge per KM (₹)
                  </label>
                  <Input
                    id="extraCharge"
                    type="number"
                    min="0"
                    value={extraChargePerKm}
                    onChange={(e) => setExtraChargePerKm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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
