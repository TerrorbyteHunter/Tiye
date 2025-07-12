import React from 'react';
import { AuditLogs } from '@/components/audit-logs';
import { Shield, Activity, Clock, AlertTriangle, FileText, Database } from 'lucide-react';

export default function AuditLogsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl mb-8 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Audit Logs</h1>
              <p className="text-blue-100">Monitor system activity and track user actions for security and compliance</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="hidden md:block w-1 h-12 bg-white/30 rounded-full"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">1,247</div>
                  <div className="text-xs text-blue-200">Total Logs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-xs text-blue-200">Today's Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-xs text-blue-200">Alerts</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Activity className="mr-2 h-4 w-4" />
                Export Logs
              </button>
              <button className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <AlertTriangle className="mr-2 h-4 w-4" />
                View Alerts
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <AuditLogs />
      </div>
    </div>
  );
} 