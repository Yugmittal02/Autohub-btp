import { z } from 'zod';

// Profile Settings Schema
export const ProfileSchema = z.object({
    shopName: z.string().min(2, "Shop Name must be at least 2 characters"),
    phone: z.string().min(10, "Invalid Mobile Number").optional().or(z.literal('')),
    email: z.string().email("Invalid Email Address").optional().or(z.literal('')),
    gstNumber: z.string().optional().or(z.literal('')),
    businessAddress: z.string().optional(),
    invoicePrefix: z.string().optional(),
    defaultGST: z.string().or(z.number()).optional(),
    showBankOnInvoice: z.boolean().optional(),
    bankAccountName: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    bankIFSC: z.string().optional(),
}).catchall(z.any()); // Allow other settings like staffPermissions to pass through


// Quotation Customer Schema
export const QuotationCustomerSchema = z.object({
    name: z.string().min(1, "Customer Name is required"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits").or(z.literal('')).optional(),
    address: z.string().optional()
});

// Quotation Item Schema
export const QuotationItemSchema = z.object({
    name: z.string().min(1, "Item Name is required"),
    qty: z.number().min(1, "Quantity must be at least 1"),
    rate: z.number().min(0, "Rate cannot be negative"),
});

// Full Quotation Schema
export const QuotationSchema = z.object({
    cust: QuotationCustomerSchema,
    items: z.array(QuotationItemSchema).min(1, "Add at least one item to the quotation"),
    discount: z.number().min(0).optional()
});
