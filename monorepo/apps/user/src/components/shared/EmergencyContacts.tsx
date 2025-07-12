import React from 'react';

interface Contact {
  name: string;
  phone: string;
  type: string;
}

interface EmergencyContactsProps {
  contacts: Contact[];
}

export const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ contacts }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{contact.name}</span>
              <span className="text-xs text-gray-500">{contact.type}</span>
            </div>
            <a 
              href={`tel:${contact.phone}`} 
              className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
            >
              {contact.phone}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}; 