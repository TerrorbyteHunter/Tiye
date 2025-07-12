import { storage } from '../storage';
import { Setting, InsertSetting } from '../../shared/schema';

export interface SettingsService {
  getSetting(name: string): Promise<Setting | undefined>;
  getSettingsByPrefix(prefix: string): Promise<Setting[]>;
  createSetting(setting: InsertSetting): Promise<Setting>;
  updateSetting(name: string, value: string): Promise<Setting | undefined>;
  listSettings(): Promise<Setting[]>;
  deleteSetting(name: string): Promise<boolean>;
  getSettingsGroup(group: string): Promise<Record<string, any>>;
  updateSettingsGroup(group: string, settings: Record<string, any>): Promise<void>;
  validateSetting(name: string, value: string): boolean;
  getSettingMetadata(name: string): SettingMetadata | undefined;
}

export interface SettingMetadata {
  name: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'select' | 'switch' | 'number' | 'url' | 'password';
  label: string;
  description: string;
  options?: { value: string; label: string }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  group: string;
  category: string;
}

export class SettingsServiceImpl implements SettingsService {
  private settingMetadata: Map<string, SettingMetadata> = new Map();

  constructor() {
    this.initializeMetadata();
  }

  private initializeMetadata() {
    // System Settings
    this.addMetadata('system_name', {
      name: 'system_name',
      type: 'text',
      label: 'System Name',
      description: 'The name of the system as displayed to users',
      validation: { required: true, min: 1, max: 100 },
      group: 'system',
      category: 'General'
    });

    this.addMetadata('system_timezone', {
      name: 'system_timezone',
      type: 'select',
      label: 'System Timezone',
      description: 'Default timezone for the system',
      options: [
        { value: 'Africa/Lusaka', label: 'Africa/Lusaka (GMT+2)' },
        { value: 'UTC', label: 'UTC (GMT+0)' },
        { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
        { value: 'Europe/London', label: 'Europe/London (GMT+0)' }
      ],
      group: 'system',
      category: 'General'
    });

    this.addMetadata('system_language', {
      name: 'system_language',
      type: 'select',
      label: 'System Language',
      description: 'Default language for the system',
      options: [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'pt', label: 'Portuguese' }
      ],
      group: 'system',
      category: 'General'
    });

    // Contact Settings
    this.addMetadata('contact_email', {
      name: 'contact_email',
      type: 'email',
      label: 'Contact Email',
      description: 'Primary support email address',
      validation: { required: true },
      group: 'contact',
      category: 'Contact'
    });

    this.addMetadata('contact_phone', {
      name: 'contact_phone',
      type: 'phone',
      label: 'Contact Phone',
      description: 'Primary support phone number',
      validation: { required: true },
      group: 'contact',
      category: 'Contact'
    });

    this.addMetadata('contact_address', {
      name: 'contact_address',
      type: 'textarea',
      label: 'Contact Address',
      description: 'Physical address for the company',
      group: 'contact',
      category: 'Contact'
    });

    // Notification Settings
    this.addMetadata('notification_email_enabled', {
      name: 'notification_email_enabled',
      type: 'switch',
      label: 'Email Notifications',
      description: 'Enable email notifications for system events',
      group: 'notification',
      category: 'Notifications'
    });

    this.addMetadata('notification_sms_enabled', {
      name: 'notification_sms_enabled',
      type: 'switch',
      label: 'SMS Notifications',
      description: 'Enable SMS notifications for system events',
      group: 'notification',
      category: 'Notifications'
    });

    this.addMetadata('notification_webhook_url', {
      name: 'notification_webhook_url',
      type: 'url',
      label: 'Webhook URL',
      description: 'Webhook URL for external notifications',
      group: 'notification',
      category: 'Notifications'
    });

    // Security Settings
    this.addMetadata('security_session_timeout', {
      name: 'security_session_timeout',
      type: 'number',
      label: 'Session Timeout (minutes)',
      description: 'Session timeout in minutes',
      validation: { min: 5, max: 1440 },
      group: 'security',
      category: 'Security'
    });

    this.addMetadata('security_password_min_length', {
      name: 'security_password_min_length',
      type: 'number',
      label: 'Minimum Password Length',
      description: 'Minimum password length for users',
      validation: { min: 6, max: 50 },
      group: 'security',
      category: 'Security'
    });

    this.addMetadata('security_two_factor_enabled', {
      name: 'security_two_factor_enabled',
      type: 'switch',
      label: 'Two-Factor Authentication',
      description: 'Enable two-factor authentication for admin accounts',
      group: 'security',
      category: 'Security'
    });

    // Backup Settings
    this.addMetadata('backup_scheduled', {
      name: 'backup_scheduled',
      type: 'switch',
      label: 'Scheduled Backups',
      description: 'Enable scheduled automatic backups',
      group: 'backup',
      category: 'Backup'
    });

    this.addMetadata('backup_frequency', {
      name: 'backup_frequency',
      type: 'select',
      label: 'Backup Frequency',
      description: 'How often to create automatic backups',
      options: [
        { value: 'hourly', label: 'Hourly' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' }
      ],
      group: 'backup',
      category: 'Backup'
    });

    this.addMetadata('backup_retention_days', {
      name: 'backup_retention_days',
      type: 'select',
      label: 'Retention (days)',
      description: 'Number of days to retain backups',
      options: [
        { value: '7', label: '7 days' },
        { value: '30', label: '30 days' },
        { value: '90', label: '90 days' },
        { value: '365', label: '1 year' }
      ],
      group: 'backup',
      category: 'Backup'
    });
  }

  private addMetadata(name: string, metadata: SettingMetadata) {
    this.settingMetadata.set(name, metadata);
  }

  async getSetting(name: string): Promise<Setting | undefined> {
    return await storage.getSetting(name);
  }

  async getSettingsByPrefix(prefix: string): Promise<Setting[]> {
    const allSettings = await storage.listSettings();
    return allSettings.filter(setting => setting.name.startsWith(prefix));
  }

  async createSetting(setting: InsertSetting): Promise<Setting> {
    return await storage.createSetting(setting);
  }

  async updateSetting(name: string, value: string): Promise<Setting | undefined> {
    // Validate the setting value
    if (!this.validateSetting(name, value)) {
      throw new Error(`Invalid value for setting ${name}`);
    }

    return await storage.updateSetting(name, value);
  }

  async listSettings(): Promise<Setting[]> {
    return await storage.listSettings();
  }

  async deleteSetting(name: string): Promise<boolean> {
    // Check if setting exists
    const setting = await storage.getSetting(name);
    if (!setting) {
      return false;
    }

    // For now, we'll just update the setting to empty string
    // In a real implementation, you might want to actually delete it
    await storage.updateSetting(name, '');
    return true;
  }

  async getSettingsGroup(group: string): Promise<Record<string, any>> {
    const settings = await this.getSettingsByPrefix(group + '_');
    const result: Record<string, any> = {};
    
    for (const setting of settings) {
      const key = setting.name.replace(group + '_', '');
      result[key] = setting.value;
    }
    
    return result;
  }

  async updateSettingsGroup(group: string, settings: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      const settingName = `${group}_${key}`;
      await this.updateSetting(settingName, value.toString());
    }
  }

  validateSetting(name: string, value: string): boolean {
    const metadata = this.getSettingMetadata(name);
    if (!metadata) {
      return true; // No metadata means no validation rules
    }

    const { validation, type } = metadata;

    // Required validation
    if (validation?.required && (!value || value.trim() === '')) {
      return false;
    }

    // Type-specific validation
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        if (validation?.min !== undefined && num < validation.min) return false;
        if (validation?.max !== undefined && num > validation.max) return false;
        return true;
      
      case 'switch':
        return value === 'true' || value === 'false';
      
      case 'select':
        if (!metadata.options) return true;
        return metadata.options.some(option => option.value === value);
      
      default:
        // Text validation
        if (validation?.min !== undefined && value.length < validation.min) return false;
        if (validation?.max !== undefined && value.length > validation.max) return false;
        if (validation?.pattern) {
          const regex = new RegExp(validation.pattern);
          return regex.test(value);
        }
        return true;
    }
  }

  getSettingMetadata(name: string): SettingMetadata | undefined {
    return this.settingMetadata.get(name);
  }

  getAllMetadata(): SettingMetadata[] {
    return Array.from(this.settingMetadata.values());
  }

  getMetadataByGroup(group: string): SettingMetadata[] {
    return Array.from(this.settingMetadata.values()).filter(meta => meta.group === group);
  }

  getMetadataByCategory(category: string): SettingMetadata[] {
    return Array.from(this.settingMetadata.values()).filter(meta => meta.category === category);
  }
}

export const settingsService = new SettingsServiceImpl(); 