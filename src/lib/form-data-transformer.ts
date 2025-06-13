
import { v4 as uuidv4 } from 'uuid';
import { Lead, Address, AdditionalDetails } from '@/utils/mockData';

export const transformFormDataToLead = (formData: any): Lead => {
  console.log('Transforming form data to Lead format:', formData);
  
  // Create primary address from addresses array
  const primaryAddress: Address = formData.addresses?.[0] ? {
    type: formData.addresses[0].type || 'Residence',
    street: formData.addresses[0].street || '',
    city: formData.addresses[0].city || '',
    district: formData.addresses[0].district || '',
    state: formData.addresses[0].state || '',
    pincode: formData.addresses[0].pincode || ''
  } : {
    type: 'Residence',
    street: '',
    city: '',
    district: '',
    state: '',
    pincode: ''
  };

  // Create additional details
  const additionalDetails: AdditionalDetails = {
    company: formData.company || '',
    designation: formData.designation || '',
    workExperience: formData.workExperience || '',
    propertyType: formData.propertyType || '',
    ownershipStatus: formData.ownershipStatus || '',
    propertyAge: formData.propertyAge || '',
    monthlyIncome: formData.monthlyIncome || '',
    annualIncome: formData.annualIncome || '',
    otherIncome: formData.otherIncome || '',
    phoneNumber: formData.phone || '',
    email: formData.email || '',
    leadType: formData.vehicleType || '',
    loanAmount: formData.loanAmount || '',
    loanType: formData.vehicleType || '',
    vehicleBrandName: formData.vehicleBrand || '',
    vehicleModelName: formData.vehicleModel || '',
    bankBranch: formData.initiatedUnderBranch || '',
    addresses: formData.addresses?.slice(1) || [], // Additional addresses excluding primary
    coApplicant: formData.hasCoApplicant && formData.coApplicant ? {
      name: formData.coApplicant.name || '',
      age: formData.coApplicant.age ? Number(formData.coApplicant.age) : undefined,
      phone: formData.coApplicant.phone || '',
      email: formData.coApplicant.email || '',
      relation: formData.coApplicant.relationship || '',
      occupation: '',
      monthlyIncome: ''
    } : undefined
  };

  // Create the Lead object
  const lead: Lead = {
    id: uuidv4(),
    name: formData.name || '',
    age: formData.age ? Number(formData.age) : 0,
    job: formData.designation || '',
    address: primaryAddress,
    additionalDetails,
    status: 'Pending',
    bank: formData.bankName || '',
    visitType: 'Residence',
    assignedTo: '',
    createdAt: new Date(),
    documents: [],
    instructions: formData.instructions || ''
  };

  console.log('Transformed lead data:', lead);
  return lead;
};
