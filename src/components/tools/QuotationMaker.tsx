import React, { useState, useEffect } from 'react';
import { FileText, MessageCircle, Download, Trash2, Plus, Search, X, ArrowLeft, Package, Sparkles, CheckCircle2, Car } from 'lucide-react';
import VoiceInput from '../VoiceInput';
import { globalToast } from '../../lib/globalToast';

interface QuotationMakerProps {
    onUpdateData?: (data: any) => void;
    onBack?: () => void;
    t: (key: string) => string;
    shopDetails: any;
    data: any;
    isDark: boolean;
}

const COMBO_PACKAGES = [
    {
        id: 'c1',
        name: 'Basic New Car Kit',
        description: 'Essential accessories for a brand new car.',
        discount: 200,
        items: [
            { name: '7D Premium Floor Mats', price: 2500, quantity: 1, brand: 'AutoForm' },
            { name: 'Mud Flaps (Set of 4)', price: 450, quantity: 1, brand: 'OEM Fit' },
            { name: 'Microfiber Cloth Set', price: 300, quantity: 1, brand: '3M' },
            { name: 'Car Perfume Gel', price: 250, quantity: 1, brand: 'Godrej' }
        ]
    },
    {
        id: 'c2',
        name: 'Stage 1 Audio Upgrade',
        description: 'Boost your car audio experience.',
        discount: 1500,
        items: [
            { name: '9-inch Android Stereo 2GB/32GB', price: 6500, quantity: 1, brand: 'Woodman' },
            { name: 'Coaxial Door Speakers 6.5"', price: 2800, quantity: 2, brand: 'JBL' },
            { name: 'Stereo Frame & Wiring Harness', price: 1200, quantity: 1, brand: 'OEM' }
        ]
    },
    {
        id: 'c3',
        name: 'Night Vision Lighting Kit',
        description: 'Ultra-bright LEDs for highway driving.',
        discount: 500,
        items: [
            { name: '130W LED Headlight Bulbs (Pair)', price: 3500, quantity: 1, brand: 'Aozoom' },
            { name: 'LED Fog Lamp Projectors', price: 4200, quantity: 1, brand: 'Iphcar' },
            { name: 'Relay Wiring Kit', price: 850, quantity: 1, brand: 'Hella' }
        ]
    }
];

const QuotationMaker: React.FC<QuotationMakerProps> = ({ t, shopDetails, data, isDark, onBack }) => {
    // State
    const [quoteCust, setQuoteCust] = useState({ name: '', phone: '', address: '', carModel: '' });
    const [quoteItems, setQuoteItems] = useState<any[]>([]);
    const [quoteDiscount, setQuoteDiscount] = useState(0);
    const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
    const [quoteSettings, setQuoteSettings] = useState({ terms: '1. Goods once sold will not be taken back.\n2. Warranty as per manufacturer policy.\n3. Quotation valid for 7 days.', shopAddress: '' });
    
    // UI State
    const [showItemSelector, setShowItemSelector] = useState(false);
    const [showComboSelector, setShowComboSelector] = useState(false);
    const [quoteSearch, setQuoteSearch] = useState('');

    // Shared Styles
    const commonInputClass = `w-full ${isDark ? 'bg-slate-900/50 border-slate-700/50 text-white placeholder-slate-500' : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-400'} border rounded-xl p-3.5 font-medium outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all backdrop-blur-sm`;

    // Load Draft
    useEffect(() => {
        const saved = localStorage.getItem('quote_draft_v2');
        if (saved) {
            try {
                const parse = JSON.parse(saved);
                setQuoteCust(parse.cust || { name: '', phone: '', address: '', carModel: '' });
                setQuoteItems(parse.items || []);
                setQuoteDiscount(parse.discount || 0);
                if (parse.settings) setQuoteSettings(prev => ({ ...prev, ...parse.settings }));
            } catch (e) {
                console.error("Failed to load draft");
            }
        }
    }, []);

    // Save Draft
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (quoteItems.length > 0 || quoteCust.name || quoteCust.carModel) {
                localStorage.setItem('quote_draft_v2', JSON.stringify({
                    cust: quoteCust,
                    items: quoteItems,
                    discount: quoteDiscount,
                    settings: quoteSettings
                }));
            }
        }, 1000);
        return () => clearTimeout(timeout);
    }, [quoteCust, quoteItems, quoteDiscount, quoteSettings]);

    const quoteSubtotal = quoteItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const quoteTotal = quoteSubtotal - quoteDiscount;

    const generatePdfHtml = () => {
        const settings = data?.settings || {};
        const shopNameDisplay = settings.shopName || shopDetails.name || 'AUTO PARTS STORE';
        const addressDisplay = settings.businessAddress || shopDetails.address || 'Premium Car Accessories & Modifications';
        return `
            <html>
                <head>
                    <title>Quotation - ${quoteCust.name}</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Outfit', sans-serif; padding: 40px; color: #1e293b; max-width: 850px; margin: 0 auto; background: #fff; }
                        .header-banner { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: white; padding: 40px; border-radius: 20px; display: flex; justify-content: space-between; align-items: flex-start; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 40px; }
                        .shop-name { font-size: 32px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 2px; background: linear-gradient(to right, #fff, #cbd5e1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                        .shop-tagline { font-size: 14px; color: #94a3b8; margin-top: 5px; font-weight: 300; }
                        .quote-badge { background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 30px; font-weight: 800; letter-spacing: 2px; font-size: 14px; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(5px); }
                        
                        .row { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }
                        .box { background: #f8fafc; padding: 25px; border-radius: 16px; width: 48%; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                        .box-title { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 800; margin-bottom: 12px; letter-spacing: 1px; }
                        .box-value { font-size: 18px; font-weight: 600; color: #0f172a; margin: 0; }
                        .car-badge { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-top: 10px; border: 1px solid #c7d2fe; }
                        
                        table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 30px; }
                        th, td { padding: 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                        th { color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #cbd5e1; }
                        td { font-size: 15px; }
                        .item-name { font-weight: 600; color: #0f172a; }
                        .item-brand { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px; }
                        
                        .totals-container { display: flex; justify-content: flex-end; }
                        .totals { background: #ffffff; padding: 30px; border-radius: 16px; width: 350px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border: 1px solid #f1f5f9; }
                        .tot-row { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 15px; color: #64748b; font-weight: 500; }
                        .tot-row strong { color: #0f172a; }
                        .tot-discount { color: #ef4444 !important; }
                        .tot-final { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 2px dashed #e2e8f0; font-size: 24px; font-weight: 900; color: #4338ca; }
                        
                        .terms { margin-top: 40px; font-size: 13px; color: #64748b; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
                        .terms-title { font-weight: 800; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
                    </style>
                </head>
                <body>
                    <div class="header-banner">
                        <div>
                            <h1 class="shop-name">${shopNameDisplay}</h1>
                            <div class="shop-tagline" style="white-space: pre-wrap;">${addressDisplay}</div>
                            <div class="shop-tagline">
                                ${settings.phone ? `Phone: ${settings.phone} ` : ''}
                                ${settings.email ? `| Email: ${settings.email}` : ''}
                            </div>
                            ${settings.gstNumber ? `<div style="font-weight: 700; margin-top: 10px; color: #cbd5e1;">GSTIN: ${settings.gstNumber}</div>` : ''}
                        </div>
                        <div class="quote-badge">ESTIMATE</div>
                    </div>
                    
                    <div class="row">
                        <div class="box">
                            <div class="box-title">Prepared For</div>
                            <h3 class="box-value">${quoteCust.name || 'Cash Customer'}</h3>
                            <div style="font-size: 14px; color: #475569; margin-top: 5px; font-weight: 500;">${quoteCust.phone}</div>
                            ${quoteCust.carModel ? `<div class="car-badge">🚘 ${quoteCust.carModel}</div>` : ''}
                        </div>
                        <div class="box" style="text-align: right; background: #fdf2f8; border-color: #fce7f3;">
                            <div class="box-title" style="color: #be185d;">Quotation Details</div>
                            <div style="margin-bottom: 8px; font-size: 15px;"><strong>Date:</strong> ${new Date(quoteDate).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</div>
                            <div style="font-size: 15px; color: #be185d;"><strong>Valid Until:</strong> ${new Date(new Date(quoteDate).getTime() + (7 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</div>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Description</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Rate (₹)</th>
                                <th style="text-align: right;">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${quoteItems.map((item, i) => `
                                <tr>
                                    <td style="color: #94a3b8; font-weight: 600;">0${i + 1}</td>
                                    <td>
                                        <div class="item-name">${item.name}</div>
                                        ${item.brand ? `<div class="item-brand">${item.brand}</div>` : ''}
                                    </td>
                                    <td style="text-align: center; font-weight: 600;">${item.quantity}</td>
                                    <td style="text-align: right; font-weight: 500;">${item.price.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                    <td style="text-align: right; font-weight: 700; color: #0f172a;">${(item.price * item.quantity).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="totals-container">
                        <div class="totals">
                            <div class="tot-row">
                                <span>Subtotal</span>
                                <strong>₹${quoteSubtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</strong>
                            </div>
                            ${quoteDiscount > 0 ? `
                            <div class="tot-row tot-discount">
                                <span>Discount</span>
                                <strong>- ₹${quoteDiscount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</strong>
                            </div>
                            ` : ''}
                            <div class="tot-final">
                                <span>Grand Total</span>
                                <span>₹${quoteTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="terms">
                        <div class="terms-title">Terms & Conditions</div>
                        ${quoteSettings.terms.split('\n').map(t => `<div style="margin-bottom: 6px;">• ${t}</div>`).join('')}
                        ${settings.showBankOnInvoice ? `
                        <div style="margin-top: 20px; padding: 15px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; max-width: 350px;">
                            <strong style="color: #0f172a; display: block; margin-bottom: 5px;">Bank Account Details (For Advance Payment):</strong>
                            Name: ${settings.bankAccountName || '-'}<br/>
                            A/C No: ${settings.bankAccountNumber || '-'}<br/>
                            IFSC: ${settings.bankIFSC || '-'}
                        </div>
                        ` : ''}
                    </div>
                </body>
            </html>
        `;
    };

    const handleWhatsAppShare = () => {
        let msg = `*Premium Estimate from ${shopDetails.name}* 🚘✨\nDate: ${new Date(quoteDate).toLocaleDateString('en-IN')}\n\n`;
        msg += `*Customer:* ${quoteCust.name || 'Sir/Madam'}\n`;
        if (quoteCust.carModel) msg += `*Vehicle:* ${quoteCust.carModel}\n`;
        msg += `\n*Modifications/Accessories:*\n`;
        quoteItems.forEach((item, i) => {
            msg += `▫️ ${item.name} x ${item.quantity}\n`;
        });
        msg += `\n*Subtotal:* ₹${quoteSubtotal}`;
        if (quoteDiscount > 0) msg += `\n*Discount Applied:* ₹${quoteDiscount}`;
        msg += `\n*Total Estimate:* ₹${quoteTotal}\n\n`;
        msg += `Let's upgrade your ride! Reply to confirm. 🏎️💨`;

        const encodedMsg = encodeURIComponent(msg);
        let url = quoteCust.phone && quoteCust.phone.length >= 10
            ? `https://wa.me/91${quoteCust.phone.replace(/\D/g, '').slice(-10)}?text=${encodedMsg}`
            : `https://wa.me/?text=${encodedMsg}`;
        window.open(url, '_blank');
    };

    const handlePrint = () => {
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(generatePdfHtml());
            win.document.close();
            setTimeout(() => {
                win.print();
            }, 500);
        }
    };

    const clearQuotation = () => {
        if (window.confirm("Clear all items and start fresh?")) {
            setQuoteItems([]);
            setQuoteCust({ name: '', phone: '', address: '', carModel: '' });
            setQuoteDiscount(0);
            localStorage.removeItem('quote_draft_v2');
        }
    };

    const addCombo = (combo: typeof COMBO_PACKAGES[0]) => {
        const newItems = combo.items.map((i, idx) => ({
            id: 'combo_' + combo.id + '_' + idx + '_' + Date.now(),
            ...i
        }));
        setQuoteItems([...quoteItems, ...newItems]);
        setQuoteDiscount(prev => prev + combo.discount);
        setShowComboSelector(false);
        globalToast(`Added ${combo.name} combo to quote!`, 'success');
    };

    return (
        <div className={`h-full flex flex-col ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} font-sans relative`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-5 border-b shrink-0 ${isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md sticky top-0 z-10 shadow-sm`}>
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className={`p-2 rounded-full transition-all active:scale-95 ${isDark ? 'hover:bg-slate-800 bg-slate-800/50' : 'hover:bg-slate-100 bg-slate-100/50'}`}>
                            <ArrowLeft size={20} className={isDark ? 'text-slate-300' : 'text-slate-700'} />
                        </button>
                    )}
                    <div>
                        <h2 className="text-xl font-black flex items-center gap-2 tracking-tight">
                            <Sparkles className="text-indigo-500" size={22} />
                            Quotation Maker <span className="text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded-full ml-1">PRO</span>
                        </h2>
                    </div>
                </div>
                <button onClick={clearQuotation} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-colors" title="Clear All">
                    <Trash2 size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {/* Customer & Car Details */}
                <div className={`p-6 rounded-3xl ${isDark ? 'bg-slate-900/50 border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.4)]' : 'bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'} backdrop-blur-sm relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Car size={100} /></div>
                    <h4 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Customer & Vehicle
                    </h4>
                    <div className="space-y-4 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                placeholder="Customer Name"
                                className={commonInputClass}
                                value={quoteCust.name}
                                onChange={e => setQuoteCust({ ...quoteCust, name: e.target.value })}
                            />
                            <input
                                placeholder="Phone Number"
                                type="tel"
                                className={commonInputClass}
                                value={quoteCust.phone}
                                onChange={e => setQuoteCust({ ...quoteCust, phone: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    placeholder="Vehicle Model (e.g. Creta 2024)"
                                    className={`${commonInputClass} pl-12 font-bold text-indigo-600 dark:text-indigo-400`}
                                    value={quoteCust.carModel}
                                    onChange={e => setQuoteCust({ ...quoteCust, carModel: e.target.value })}
                                />
                            </div>
                            <input
                                type="date"
                                className={commonInputClass}
                                value={quoteDate}
                                onChange={e => setQuoteDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className={`p-6 rounded-3xl ${isDark ? 'bg-slate-900/50 border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.4)]' : 'bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'} backdrop-blur-sm`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
                        <h4 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Upgrades & Accessories ({quoteItems.length})
                        </h4>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setShowComboSelector(true)}
                                className="flex-1 sm:flex-none bg-gradient-to-r from-orange-400 to-rose-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/30 transition-all active:scale-95"
                            >
                                <Package size={16} /> Add Combo
                            </button>
                            <button
                                onClick={() => setShowItemSelector(true)}
                                className="flex-1 sm:flex-none bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
                            >
                                <Plus size={16} /> Add Item
                            </button>
                        </div>
                    </div>

                    {quoteItems.length === 0 ? (
                        <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${isDark ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50'} flex flex-col items-center justify-center`}>
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                                <Sparkles size={30} className="text-indigo-500" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">No upgrades added yet.</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Add individual items or use Combo Packages for quick building.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quoteItems.map((item, idx) => (
                                <div key={idx} className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} relative group transition-all hover:border-indigo-500/30`}>
                                    <button onClick={() => {
                                        const newItems = [...quoteItems];
                                        newItems.splice(idx, 1);
                                        setQuoteItems(newItems);
                                    }} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity active:scale-90 z-10"><X size={14}/></button>
                                    
                                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                                        <div className="flex-1">
                                            <div className="font-bold text-lg leading-tight">{item.name}</div>
                                            {item.brand && <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 inline-block px-2 py-0.5 rounded-md">{item.brand}</div>}
                                        </div>
                                        <div className="flex items-center gap-3 sm:w-[300px] shrink-0">
                                            <div className="flex-1">
                                                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Qty</div>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className={`w-full text-center p-2 rounded-xl border outline-none font-bold ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'} focus:border-indigo-500 transition-colors`}
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        const newItems = [...quoteItems];
                                                        newItems[idx].quantity = val;
                                                        setQuoteItems(newItems);
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Rate (₹)</div>
                                                <input
                                                    type="number"
                                                    className={`w-full text-right p-2 rounded-xl border outline-none font-bold ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'} focus:border-indigo-500 transition-colors`}
                                                    value={item.price}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        const newItems = [...quoteItems];
                                                        newItems[idx].price = val;
                                                        setQuoteItems(newItems);
                                                    }}
                                                />
                                            </div>
                                            <div className="w-[80px] text-right">
                                                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total</div>
                                                <div className="font-black text-indigo-600 dark:text-indigo-400 pt-2">₹{(item.price * item.quantity).toFixed(0)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Totals */}
                <div className={`p-6 rounded-3xl ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.4)]' : 'bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)]'} backdrop-blur-sm relative overflow-hidden`}>
                    <div className="absolute -right-10 -bottom-10 opacity-5 dark:opacity-10 pointer-events-none">
                        <FileText size={200} />
                    </div>
                    <div className="space-y-4 pb-5 border-b border-dashed dark:border-slate-800 relative z-10">
                        <div className="flex justify-between items-center text-lg">
                            <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Subtotal</span>
                            <span className="font-bold">₹{quoteSubtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-500/10 p-3 rounded-2xl border border-rose-100 dark:border-rose-500/20">
                            <span className="font-bold text-rose-600 dark:text-rose-400">Special Discount (₹)</span>
                            <input
                                type="number"
                                className={`w-32 p-2 rounded-xl border text-right font-black outline-none ${isDark ? 'bg-slate-900 border-rose-500/30 text-white' : 'bg-white border-rose-200 text-rose-600'} focus:border-rose-500`}
                                value={quoteDiscount || ''}
                                placeholder="0"
                                onChange={e => setQuoteDiscount(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between items-end pt-5 relative z-10">
                        <div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Grand Total</div>
                            <span className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">₹{quoteTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className={`p-4 border-t shrink-0 grid grid-cols-2 gap-4 ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white/90'} backdrop-blur-xl pb-safe`}>
                <button
                    onClick={handlePrint}
                    className="py-4 rounded-2xl font-black flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition-all active:scale-95 text-lg"
                >
                    <Download size={22} /> Visual PDF
                </button>
                <button
                    onClick={handleWhatsAppShare}
                    className="py-4 rounded-2xl font-black flex items-center justify-center gap-2 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white hover:brightness-110 shadow-lg shadow-[#25D366]/30 transition-all active:scale-95 text-lg"
                >
                    <MessageCircle size={22} /> Share Quote
                </button>
            </div>

            {/* Combo Package Modal */}
            {showComboSelector && (
                <div className="fixed inset-0 bg-slate-900/80 z-[80] flex flex-col justify-end sm:justify-center sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`w-full sm:max-w-2xl h-[80vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-slate-50 border border-slate-200'} shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95`}>
                        <div className="p-5 border-b dark:border-slate-800 flex justify-between items-center shrink-0 bg-gradient-to-r from-orange-500/10 to-rose-500/10">
                            <div>
                                <h3 className="font-black text-xl flex items-center gap-2"><Package className="text-orange-500"/> Combo Packages</h3>
                                <p className="text-sm text-slate-500 font-medium">Add pre-configured accessory bundles instantly</p>
                            </div>
                            <button onClick={() => setShowComboSelector(false)} className="p-2 bg-white dark:bg-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {COMBO_PACKAGES.map(combo => (
                                <div key={combo.id} className={`p-5 rounded-2xl border-2 transition-all cursor-pointer hover:border-orange-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`} onClick={() => addCombo(combo)}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-black text-lg text-slate-900 dark:text-white">{combo.name}</h4>
                                            <p className="text-sm text-slate-500 font-medium mt-1">{combo.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md mb-1">Save ₹{combo.discount}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {combo.items.map((item, i) => (
                                            <span key={i} className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                                <CheckCircle2 size={12} className="inline mr-1 text-orange-500"/>{item.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Item Selector Modal */}
            {showItemSelector && (
                <div className="fixed inset-0 bg-slate-900/80 z-[70] flex flex-col justify-end sm:justify-center sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`w-full sm:max-w-md h-[70vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col ${isDark ? 'bg-slate-900' : 'bg-white'} shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95`}>
                        <div className="p-5 border-b dark:border-slate-800 flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-lg">Add Items to Quote</h3>
                            <button onClick={() => setShowItemSelector(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20} /></button>
                        </div>
                        <div className="p-4 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex gap-2 relative">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                                    <input
                                        className={commonInputClass.replace('p-3.5', 'p-3 pl-10 border-indigo-200 dark:border-indigo-500/30')}
                                        placeholder="Search inventory..."
                                        value={quoteSearch}
                                        onChange={e => setQuoteSearch(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="absolute right-12 top-1.5 z-10"><VoiceInput onResult={setQuoteSearch} isDark={isDark} /></div>
                                </div>
                                <div className="shrink-0 flex items-center justify-center">
                                    <VoiceInput onResult={setQuoteSearch} isDark={isDark} />
                                </div>
                            </div>
                            {quoteCust.carModel && (
                                <div className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-lg flex items-center justify-center gap-2">
                                    <Sparkles size={14} /> Showing results matching {quoteCust.carModel}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {data?.pages?.filter((item: any) =>
                                (item.itemName || "").toLowerCase().includes(quoteSearch.toLowerCase()) ||
                                (item.barcode && item.barcode.some((b: string) => b.includes(quoteSearch)))
                            ).map((item: any) => (
                                <div
                                    key={item.id}
                                    className={`p-4 rounded-2xl border flex justify-between items-center cursor-pointer transition-all ${isDark ? 'border-slate-800 hover:bg-slate-800 hover:border-indigo-500/50' : 'border-slate-200 hover:bg-indigo-50 hover:border-indigo-300'}`}
                                    onClick={() => {
                                        setQuoteItems([...quoteItems, {
                                            id: item.id,
                                            name: item.itemName,
                                            price: item.purchases && item.purchases.length > 0 ? item.purchases[0].price : 0,
                                            quantity: 1,
                                            brand: item.brand
                                        }]);
                                        setShowItemSelector(false);
                                        setQuoteSearch('');
                                    }}
                                >
                                    <div>
                                        <p className="font-bold text-lg leading-tight">{item.itemName}</p>
                                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{item.brand || 'Inventory Item'}</p>
                                    </div>
                                    <p className="font-black text-indigo-500">₹{item.purchases && item.purchases.length > 0 ? item.purchases[0].price : 0}</p>
                                </div>
                            ))}
                            {/* Manual Entry Fallback */}
                            {quoteSearch && !data?.pages?.find((item: any) => (item.itemName || "").toLowerCase() === quoteSearch.toLowerCase()) && (
                                <div
                                    className={`p-5 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/10 text-center cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors`}
                                    onClick={() => {
                                        setQuoteItems([...quoteItems, {
                                            id: 'manual_' + Date.now(),
                                            name: quoteSearch,
                                            price: 0,
                                            quantity: 1
                                        }]);
                                        setShowItemSelector(false);
                                        setQuoteSearch('');
                                    }}
                                >
                                    <Plus className="mx-auto mb-2 text-indigo-500 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm" size={30} />
                                    <p className="font-black text-indigo-600 dark:text-indigo-400">Add "{quoteSearch}" manually</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuotationMaker;
