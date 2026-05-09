export interface User {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
}

export interface ShopDetails {
    shopName?: string;
    shopAddress?: string;
    shopCity?: string;
    shopPincode?: string;
    gstNumber?: string;
    shopPhone?: string;
    ownerName?: string;
    mobile?: string;
    address?: string; // Sometimes used interchangeably with shopAddress
}

export interface NotificationSettings {
    lowStockAlert?: boolean;
    expiryAlert?: boolean;
    [key: string]: boolean | undefined;
}

export interface PerformanceSettings {
    batterySaver?: boolean;
    lowDataMode?: boolean;
    offlineFirst?: boolean;
    [key: string]: boolean | undefined;
}

export interface StaffPermissions {
    canChangeQty: boolean;      // Can modify +/- item quantities
    canViewKhata: boolean;      // Can see Customer Khata / Udhaar
    canViewSupplier: boolean;   // Can see Supplier Ledger
    canViewAnalytics: boolean;  // Can see Analytics Dashboard
    canViewMargin: boolean;     // Can see Profit Analyzer
    canViewStockValue: boolean; // Can see Stock Value
    canViewImport: boolean;     // Can see Data Import/Export
    canViewSales: boolean;      // Can see Today's Sales KPI
    canViewPendingDue: boolean; // Can see Pending Due KPI
    canAddItems: boolean;       // Can add new items / entries
    canDeleteItems: boolean;    // Can delete items
    canEditItems: boolean;      // Can edit item names
    canViewCRM: boolean;        // Can see Customer CRM
    canViewJobCards: boolean;   // Can see Job Cards
}

export interface Settings {
    staffPermissions?: StaffPermissions;
    dashboardTools?: string[];
    udhaarDue?: number;
    shopName?: string;
    shopAddress?: string;
    shopCity?: string;
    shopPincode?: string;
    gstNumber?: string;
    shopPhone?: string;
    businessAddress?: string;
    invoicePrefix?: string;
    defaultGST?: number | string;
    showBankOnInvoice?: boolean;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankIFSC?: string;
    theme?: string;
    accentColor?: string;
    fontSize?: string;
    shakeToSearch?: boolean;
    pinnedTools?: string[];
    fuzzySearch?: boolean;
    voiceAI?: boolean;
    aiPredictions?: boolean;
    widgets?: {
        aiInsights?: boolean;
        predictions?: boolean;
    } | boolean;
    soundEffects?: boolean;
    highContrast?: boolean;
    reducedMotion?: boolean;
    notifications?: NotificationSettings;
    limit?: number;
    productPassword?: string;
    autoLockTime?: string;
    autoBackup?: string;
    performance?: PerformanceSettings;
    [key: string]: any; // Allow extensibility for now
}

export interface AppData {
    settings?: Settings;
    entries?: any[]; // Todo: Define Entry type
    bills?: any[];   // Todo: Define Bill type
    pages?: any[];   // Used in QuotationMaker
    scannedVehicles?: Array<{
        id: number;
        regNo: string;
        customerName?: string;
        customerPhone?: string;
        scannedAt: string;
    }>;
    lastScannedVehicle?: {
        regNo: string;
        make?: string;
        model?: string;
        customerName?: string;
        customerPhone?: string;
        year?: string;
        mileage?: string;
        notes?: string;
        lastServiceDate?: string;
        scannedAt?: string;
    };
    [key: string]: any;
}

export interface ThemePreset {
    bg: string;
    meta: string;
    isDark: boolean;
    id?: string;
    name?: string;
    colors?: string[];
}

export interface ThemeOption {
    id: string;
    name: string;
    colors: string[];
}
