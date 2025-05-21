
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LocationData {
  states: {
    id: string;
    name: string;
    districts: {
      id: string;
      name: string;
      cities: {
        id: string;
        name: string;
      }[];
    }[];
  }[];
}

interface LocationManagerProps {
  locationData: LocationData;
  setLocationData: React.Dispatch<React.SetStateAction<LocationData>>;
}

const LocationManager = ({ locationData, setLocationData }: LocationManagerProps) => {
  const [newState, setNewState] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newCity, setNewCity] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Effect to save location data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('locationData', JSON.stringify(locationData));
  }, [locationData]);

  const handleAddState = () => {
    if (!newState.trim()) {
      toast({
        title: "State name required",
        description: "Please enter a state name",
        variant: "destructive",
      });
      return;
    }

    const stateId = `state-${Date.now()}`;
    setLocationData(prev => ({
      ...prev,
      states: [...prev.states, { id: stateId, name: newState, districts: [] }]
    }));
    setNewState('');
    toast({
      title: "State added",
      description: `${newState} has been added successfully.`,
    });
  };

  const handleAddDistrict = () => {
    if (!selectedState) {
      toast({
        title: "Select a state",
        description: "Please select a state first",
        variant: "destructive",
      });
      return;
    }

    if (!newDistrict.trim()) {
      toast({
        title: "District name required",
        description: "Please enter a district name",
        variant: "destructive",
      });
      return;
    }

    const districtId = `district-${Date.now()}`;
    
    setLocationData(prev => {
      const updatedStates = prev.states.map(state => {
        if (state.id === selectedState) {
          return {
            ...state,
            districts: [...state.districts, { id: districtId, name: newDistrict, cities: [] }]
          };
        }
        return state;
      });

      return {
        ...prev,
        states: updatedStates
      };
    });

    setNewDistrict('');
    toast({
      title: "District added",
      description: `${newDistrict} has been added to the selected state.`,
    });
  };

  const handleAddCity = () => {
    if (!selectedState || !selectedDistrict) {
      toast({
        title: "Select a district",
        description: "Please select both state and district first",
        variant: "destructive",
      });
      return;
    }

    if (!newCity.trim()) {
      toast({
        title: "City name required",
        description: "Please enter a city name",
        variant: "destructive",
      });
      return;
    }

    const cityId = `city-${Date.now()}`;
    
    setLocationData(prev => {
      const updatedStates = prev.states.map(state => {
        if (state.id === selectedState) {
          const updatedDistricts = state.districts.map(district => {
            if (district.id === selectedDistrict) {
              return {
                ...district,
                cities: [...district.cities, { id: cityId, name: newCity }]
              };
            }
            return district;
          });

          return {
            ...state,
            districts: updatedDistricts
          };
        }
        return state;
      });

      return {
        ...prev,
        states: updatedStates
      };
    });

    setNewCity('');
    toast({
      title: "City added",
      description: `${newCity} has been added to the selected district.`,
    });
  };

  const handleDeleteState = (stateId: string) => {
    setLocationData(prev => ({
      ...prev,
      states: prev.states.filter(state => state.id !== stateId)
    }));
    
    if (selectedState === stateId) {
      setSelectedState(null);
      setSelectedDistrict(null);
    }
    
    toast({
      title: "State deleted",
      description: "The state and all its districts and cities have been deleted.",
    });
  };

  const handleDeleteDistrict = (stateId: string, districtId: string) => {
    setLocationData(prev => {
      const updatedStates = prev.states.map(state => {
        if (state.id === stateId) {
          return {
            ...state,
            districts: state.districts.filter(district => district.id !== districtId)
          };
        }
        return state;
      });

      return {
        ...prev,
        states: updatedStates
      };
    });
    
    if (selectedDistrict === districtId) {
      setSelectedDistrict(null);
    }
    
    toast({
      title: "District deleted",
      description: "The district and all its cities have been deleted.",
    });
  };

  const handleDeleteCity = (stateId: string, districtId: string, cityId: string) => {
    setLocationData(prev => {
      const updatedStates = prev.states.map(state => {
        if (state.id === stateId) {
          const updatedDistricts = state.districts.map(district => {
            if (district.id === districtId) {
              return {
                ...district,
                cities: district.cities.filter(city => city.id !== cityId)
              };
            }
            return district;
          });

          return {
            ...state,
            districts: updatedDistricts
          };
        }
        return state;
      });

      return {
        ...prev,
        states: updatedStates
      };
    });
    
    toast({
      title: "City deleted",
      description: "The city has been deleted.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Location Management</CardTitle>
          <CardDescription>
            Add and manage states, districts, and cities for agent assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* States Management */}
            <div className="space-y-4">
              <h3 className="font-medium">States</h3>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Add new state..." 
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                />
                <Button onClick={handleAddState}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="border rounded-md max-h-72 overflow-y-auto">
                <ul className="divide-y">
                  {locationData.states.map(state => (
                    <li key={state.id} className="p-3 flex justify-between items-center">
                      <button 
                        className={`text-left flex-1 ${selectedState === state.id ? 'font-medium text-primary' : ''}`}
                        onClick={() => {
                          setSelectedState(state.id);
                          setSelectedDistrict(null);
                        }}
                      >
                        {state.name}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({state.districts.length} districts)
                        </span>
                      </button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteState(state.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                  {locationData.states.length === 0 && (
                    <li className="p-3 text-sm text-muted-foreground text-center">
                      No states added yet
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Districts Management */}
            <div className="space-y-4">
              <h3 className="font-medium">Districts</h3>
              <div className="flex space-x-2">
                <Input 
                  placeholder={selectedState ? "Add new district..." : "Select a state first"} 
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  disabled={!selectedState}
                />
                <Button onClick={handleAddDistrict} disabled={!selectedState}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="border rounded-md max-h-72 overflow-y-auto">
                <ul className="divide-y">
                  {selectedState ? (
                    locationData.states.find(s => s.id === selectedState)?.districts.map(district => (
                      <li key={district.id} className="p-3 flex justify-between items-center">
                        <button 
                          className={`text-left flex-1 ${selectedDistrict === district.id ? 'font-medium text-primary' : ''}`}
                          onClick={() => setSelectedDistrict(district.id)}
                        >
                          {district.name}
                          <span className="text-xs text-muted-foreground ml-2">
                            ({district.cities.length} cities)
                          </span>
                        </button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteDistrict(selectedState, district.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </li>
                    )) || []
                  ) : (
                    <li className="p-3 text-sm text-muted-foreground text-center">
                      Select a state to view districts
                    </li>
                  )}
                  {selectedState && locationData.states.find(s => s.id === selectedState)?.districts.length === 0 && (
                    <li className="p-3 text-sm text-muted-foreground text-center">
                      No districts added yet
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Cities Management */}
            <div className="space-y-4">
              <h3 className="font-medium">Cities</h3>
              <div className="flex space-x-2">
                <Input 
                  placeholder={selectedDistrict ? "Add new city..." : "Select a district first"} 
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  disabled={!selectedDistrict}
                />
                <Button onClick={handleAddCity} disabled={!selectedDistrict}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="border rounded-md max-h-72 overflow-y-auto">
                <ul className="divide-y">
                  {selectedState && selectedDistrict ? (
                    locationData.states.find(s => s.id === selectedState)
                      ?.districts.find(d => d.id === selectedDistrict)
                      ?.cities.map(city => (
                        <li key={city.id} className="p-3 flex justify-between items-center">
                          <span className="flex-1">{city.name}</span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteCity(selectedState, selectedDistrict, city.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </li>
                      )) || []
                  ) : (
                    <li className="p-3 text-sm text-muted-foreground text-center">
                      Select a district to view cities
                    </li>
                  )}
                  {selectedState && selectedDistrict && 
                   locationData.states.find(s => s.id === selectedState)
                    ?.districts.find(d => d.id === selectedDistrict)
                    ?.cities.length === 0 && (
                    <li className="p-3 text-sm text-muted-foreground text-center">
                      No cities added yet
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationManager;
