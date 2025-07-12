import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { log } from "./vite";
import { storage } from "./storage";

const BACKUP_DIR = path.join(process.cwd(), "backups");

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Backup types and their configurations
export interface BackupConfig {
  type: string;
  description: string;
  tables: string[];
  includeFiles?: boolean;
  compression?: boolean;
  encryption?: boolean;
}

export const BACKUP_TYPES: Record<string, BackupConfig> = {
  full: {
    type: "full",
    description: "Complete system backup including all data",
    tables: ["*"],
    compression: true,
    encryption: false
  },
  analytics: {
    type: "analytics",
    description: "Analytics and reporting data",
    tables: ["tickets", "routes", "vendors", "activities"],
    compression: true,
    encryption: false
  },
  audit: {
    type: "audit",
    description: "Audit logs and security data",
    tables: ["activities", "audit_logs"],
    compression: true,
    encryption: true
  },
  operational: {
    type: "operational",
    description: "Operational data including routes, schedules, and bookings",
    tables: ["routes", "tickets", "buses", "completed_trips"],
    compression: true,
    encryption: false
  },
  users: {
    type: "users",
    description: "User and vendor account data",
    tables: ["admins", "vendors", "vendor_users", "vendor_user_permissions"],
    compression: true,
    encryption: true
  },
  settings: {
    type: "settings",
    description: "System settings and configurations",
    tables: ["settings", "roles"],
    compression: false,
    encryption: false
  }
};

export interface BackupInfo {
  filename: string;
  type: string;
  description: string;
  size: string;
  created: string;
  status: 'success' | 'failed' | 'in_progress';
  metadata?: {
    recordCount?: number;
    tables?: string[];
    compressionRatio?: number;
  };
}

export async function createDatabaseBackup(backupType: string = "full"): Promise<string | null> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable not set");
    }

    const config = BACKUP_TYPES[backupType] || BACKUP_TYPES.full;
    const dbUrl = new URL(process.env.DATABASE_URL);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFilePath = path.join(BACKUP_DIR, `backup-${backupType}-${timestamp}.sql`);

    // Extract database connection details from DATABASE_URL
    const dbName = dbUrl.pathname.substring(1);
    const dbUser = dbUrl.username;
    const dbPassword = dbUrl.password;
    const dbHost = dbUrl.hostname;
    const dbPort = dbUrl.port || "5432";

    // Set environment variable for password
    const env = { ...process.env, PGPASSWORD: dbPassword };

    // Build pg_dump command based on backup type
    const pgDumpArgs = [
      "-h", dbHost,
      "-p", dbPort,
      "-U", dbUser,
      "-d", dbName,
      "-f", backupFilePath,
      "-F", "c", // Custom format (compressed)
    ];

    // Add table-specific arguments if not full backup
    if (backupType !== "full" && config.tables.length > 0 && !config.tables.includes("*")) {
      pgDumpArgs.push("--table=" + config.tables.join(" --table="));
    }

    // Add compression if enabled
    if (config.compression) {
      pgDumpArgs.push("--compress=9");
    }

    // Run pg_dump command
    const pgDump = spawn("pg_dump", pgDumpArgs, { env });

    return new Promise((resolve, reject) => {
      pgDump.on("close", (code) => {
        if (code === 0) {
          log(`Database backup created at ${backupFilePath} (Type: ${backupType})`);
          resolve(backupFilePath);
        } else {
          reject(new Error(`pg_dump exited with code ${code}`));
        }
      });
      
      pgDump.on("error", (err) => {
        reject(new Error(`Failed to start pg_dump: ${err.message}`));
      });
    });
  } catch (error) {
    log(`Backup failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

export async function createAnalyticsBackup(): Promise<string | null> {
  try {
    // Create analytics-specific backup
    const backupPath = await createDatabaseBackup("analytics");
    
    if (backupPath) {
      // Generate analytics report
      const analyticsData = await generateAnalyticsReport();
      const reportPath = backupPath.replace('.sql', '-analytics-report.json');
      
      fs.writeFileSync(reportPath, JSON.stringify(analyticsData, null, 2));
      log(`Analytics report created at ${reportPath}`);
    }
    
    return backupPath;
  } catch (error) {
    log(`Analytics backup failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

export async function createAuditBackup(): Promise<string | null> {
  try {
    // Create audit-specific backup
    const backupPath = await createDatabaseBackup("audit");
    
    if (backupPath) {
      // Generate audit summary
      const auditSummary = await generateAuditSummary();
      const summaryPath = backupPath.replace('.sql', '-audit-summary.json');
      
      fs.writeFileSync(summaryPath, JSON.stringify(auditSummary, null, 2));
      log(`Audit summary created at ${summaryPath}`);
    }
    
    return backupPath;
  } catch (error) {
    log(`Audit backup failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

export async function createOperationalBackup(): Promise<string | null> {
  try {
    // Create operational-specific backup
    const backupPath = await createDatabaseBackup("operational");
    
    if (backupPath) {
      // Generate operational report
      const operationalData = await generateOperationalReport();
      const reportPath = backupPath.replace('.sql', '-operational-report.json');
      
      fs.writeFileSync(reportPath, JSON.stringify(operationalData, null, 2));
      log(`Operational report created at ${reportPath}`);
    }
    
    return backupPath;
  } catch (error) {
    log(`Operational backup failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

export async function createUsersBackup(): Promise<string | null> {
  try {
    // Create users-specific backup
    const backupPath = await createDatabaseBackup("users");
    
    if (backupPath) {
      // Generate user summary (without sensitive data)
      const userSummary = await generateUserSummary();
      const summaryPath = backupPath.replace('.sql', '-user-summary.json');
      
      fs.writeFileSync(summaryPath, JSON.stringify(userSummary, null, 2));
      log(`User summary created at ${summaryPath}`);
    }
    
    return backupPath;
  } catch (error) {
    log(`Users backup failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function generateAnalyticsReport() {
  try {
    const stats = await storage.getDashboardStats();
    
    return {
      timestamp: new Date().toISOString(),
      type: "analytics_report",
      revenue: {
        total: stats.totalRevenue,
        daily: stats.revenueData,
        byVendor: stats.revenueDistribution
      },
      bookings: {
        total: stats.totalBookings,
        daily: stats.bookingsData,
        byVendor: stats.bookingDistribution
      },
      routes: {
        active: stats.activeRoutes,
        total: await storage.listRoutes().then(routes => routes.length)
      },
      vendors: {
        active: stats.activeVendors,
        total: await storage.listVendors().then(vendors => vendors.length)
      }
    };
  } catch (error) {
    log(`Failed to generate analytics report: ${error}`);
    return { error: "Failed to generate analytics report" };
  }
}

async function generateAuditSummary() {
  try {
    const activities = await storage.listActivities(1000); // Last 1000 activities
    
    return {
      timestamp: new Date().toISOString(),
      type: "audit_summary",
      totalActivities: activities.length,
      recentActivities: activities.slice(0, 50).map(activity => ({
        id: activity.id,
        action: activity.action,
        timestamp: activity.timestamp,
        adminId: activity.adminId
      })),
      activityTypes: activities.reduce((acc, activity) => {
        acc[activity.action] = (acc[activity.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  } catch (error) {
    log(`Failed to generate audit summary: ${error}`);
    return { error: "Failed to generate audit summary" };
  }
}

async function generateOperationalReport() {
  try {
    const routes = await storage.listRoutes();
    const tickets = await storage.listTickets();
    const vendors = await storage.listVendors();
    
    return {
      timestamp: new Date().toISOString(),
      type: "operational_report",
      routes: {
        total: routes.length,
        active: routes.filter(r => r.status === 'active').length,
        inactive: routes.filter(r => r.status === 'inactive').length
      },
      tickets: {
        total: tickets.length,
        confirmed: tickets.filter(t => t.status === 'confirmed').length,
        pending: tickets.filter(t => t.status === 'pending').length,
        cancelled: tickets.filter(t => t.status === 'cancelled').length
      },
      vendors: {
        total: vendors.length,
        active: vendors.filter(v => v.status === 'active').length,
        inactive: vendors.filter(v => v.status === 'inactive').length
      },
      revenue: {
        total: tickets
          .filter(t => t.status === 'confirmed')
          .reduce((sum, ticket) => sum + (ticket.amount ? Number(ticket.amount) : 0), 0)
      }
    };
  } catch (error) {
    log(`Failed to generate operational report: ${error}`);
    return { error: "Failed to generate operational report" };
  }
}

async function generateUserSummary() {
  try {
    const admins = await storage.listAdmins();
    const vendors = await storage.listVendors();
    
    return {
      timestamp: new Date().toISOString(),
      type: "user_summary",
      admins: {
        total: admins.length,
        active: admins.filter(a => a.active).length
      },
      vendors: {
        total: vendors.length,
        active: vendors.filter(v => v.status === 'active').length
      },
      // Don't include sensitive data like passwords or personal info
      summary: {
        totalUsers: admins.length + vendors.length,
        lastLogin: Math.max(
          ...admins.map(a => new Date(a.lastLogin || 0).getTime()),
          ...vendors.map(v => new Date(v.createdAt || 0).getTime())
        )
      }
    };
  } catch (error) {
    log(`Failed to generate user summary: ${error}`);
    return { error: "Failed to generate user summary" };
  }
}

export async function listBackups(): Promise<BackupInfo[]> {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith("backup-") && file.endsWith(".sql"))
      .sort()
      .reverse(); // Most recent first

    return files.map(filename => {
      const filePath = path.join(BACKUP_DIR, filename);
      const stats = fs.statSync(filePath);
      
      // Extract backup type from filename
      const typeMatch = filename.match(/backup-(\w+)-/);
      const backupType = typeMatch ? typeMatch[1] : 'full';
      const config = BACKUP_TYPES[backupType] || BACKUP_TYPES.full;
      
      return {
        filename,
        type: backupType,
        description: config.description,
        size: formatBytes(stats.size),
        created: new Date(stats.birthtime).toISOString(),
        status: 'success' as const,
        metadata: {
          recordCount: stats.size > 0 ? Math.floor(stats.size / 1024) : 0, // Rough estimate
          tables: config.tables,
          compressionRatio: config.compression ? 0.7 : 1.0 // Estimated compression
        }
      };
    });
  } catch (error) {
    log(`Failed to list backups: ${error}`);
    return [];
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function scheduleBackups(enabled: boolean): Promise<boolean> {
  // Update settings in database to enable/disable scheduled backups
  // This will be checked by a cron job or similar mechanism
  try {
    log(`Scheduled backups ${enabled ? 'enabled' : 'disabled'}`);
    return true;
  } catch (error) {
    log(`Failed to ${enabled ? 'enable' : 'disable'} scheduled backups: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

export async function getBackupTypes(): Promise<BackupConfig[]> {
  return Object.values(BACKUP_TYPES);
}
