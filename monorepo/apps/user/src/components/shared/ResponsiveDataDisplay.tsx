import React from 'react';
import { ResponsiveWrapper } from './ResponsiveWrapper';
import { useResponsive } from '../../hooks/use-responsive';

interface DataItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
  date?: string;
  price?: string;
  [key: string]: any;
}

interface ResponsiveDataDisplayProps {
  data: DataItem[];
  title?: string;
  className?: string;
  onItemClick?: (item: DataItem) => void;
}

export function ResponsiveDataDisplay({ 
  data, 
  title, 
  className = '',
  onItemClick 
}: ResponsiveDataDisplayProps) {
  return (
    <div className={className}>
      {title && (
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      )}
      <ResponsiveWrapper
        mobile={<MobileDataCards data={data} onItemClick={onItemClick} />}
        desktop={<DesktopDataTable data={data} onItemClick={onItemClick} />}
      />
    </div>
  );
}

function MobileDataCards({ 
  data, 
  onItemClick 
}: { 
  data: DataItem[]; 
  onItemClick?: (item: DataItem) => void;
}) {
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div 
          key={item.id}
          onClick={() => onItemClick?.(item)}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
            {item.status && (
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${item.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${item.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {item.status}
              </span>
            )}
          </div>
          
          {item.description && (
            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
          )}
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            {item.date && <span>{item.date}</span>}
            {item.price && <span className="font-semibold text-green-600">{item.price}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function DesktopDataTable({ 
  data, 
  onItemClick 
}: { 
  data: DataItem[]; 
  onItemClick?: (item: DataItem) => void;
}) {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr 
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.description || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {item.status && (
                  <span className={`
                    inline-flex px-2 py-1 text-xs font-semibold rounded-full
                    ${item.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${item.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {item.status}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.date || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                {item.price || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 