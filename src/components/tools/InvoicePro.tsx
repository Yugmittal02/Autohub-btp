import VoiceInput from '../VoiceInput';
import React, { useState, useEffect } from "react";
import { ArrowLeft, Share2, MoreVertical, Calendar, Phone, Search, ScanBarcode, User, Plus, Trash2, Edit2, FileText, ChevronDown, Percent, Package, X, CheckCircle, Smartphone, CheckCircle2, MessageSquare, Download, Camera, XCircle, Loader2, Receipt, ShieldCheck, Car } from "lucide-react";
import { BarcodeScanner } from './BarcodeScanner';
import { globalToast } from '../../lib/globalToast';

export const InvoicePro = ({ onBack, shopName, t, data, isDark, onUpdateData }) => {
  const [invoiceNumber] = useState(Date.now().toString().slice(-6));
  const [date] = useState(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [customerType, setCustomerType] = useState("Walk-in Customer");
  const [mobile, setMobile] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [discount, setDiscount] = useState(0);

  const lastScannedVehicle = data?.lastScannedVehicle;
  const canUseLastScanned = !!lastScannedVehicle?.regNo;
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", qty: 1, rate: 0, gst: 18 });
  
  const filteredInventory = React.useMemo(() => { 
      if (!data || !data.pages) return []; 
      return data.pages.filter(p => p.itemName && p.itemName.toLowerCase().includes((newItem.name || "").toLowerCase())); 
  }, [data, newItem.name]);

  const [items, setItems] = useState([]);

  // Load Draft
  useEffect(() => {
    const saved = localStorage.getItem('invoice_draft_v2');
    if (saved) {
        try {
            const parse = JSON.parse(saved);
            setItems(parse.items || []);
            setMobile(parse.mobile || "");
            setVehicleNumber(parse.vehicleNumber || "");
            setCustomerType(parse.customerType || "Walk-in Customer");
            setPaymentMode(parse.paymentMode || "Cash");
            setDiscount(parse.discount || 0);
        } catch (e) {
            console.error("Failed to load draft");
        }
    }
  }, []);

  // Save Draft
  useEffect(() => {
      const timeout = setTimeout(() => {
          if (items.length > 0 || mobile || vehicleNumber) {
              localStorage.setItem('invoice_draft_v2', JSON.stringify({
                  items, mobile, vehicleNumber, customerType, paymentMode, discount
              }));
          }
      }, 1000);
      return () => clearTimeout(timeout);
  }, [items, mobile, vehicleNumber, customerType, paymentMode, discount]);

  const subtotal = items.reduce((acc, item) => acc + (item.rate * item.qty), 0);
  const totalGst = items.reduce((acc, item) => acc + (item.amount - (item.rate * item.qty)), 0);
  const total = subtotal + totalGst - discount;

  const handleUseLastScanned = () => {
    if (!lastScannedVehicle) return;
    if (lastScannedVehicle.customerPhone) {
      setMobile(String(lastScannedVehicle.customerPhone));
    }
    setVehicleNumber(lastScannedVehicle.regNo);
    setCustomerType("Regular Customer");
    globalToast(`Linked vehicle ${lastScannedVehicle.regNo}`, 'success');
  };

  const handleClearLastScanned = () => {
    if (!onUpdateData) return;
    onUpdateData({ lastScannedVehicle: null });
    globalToast('Removed last scanned vehicle', 'info');
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowSuccessCard(true);
      localStorage.removeItem('invoice_draft_v2');
    }, 1200);
  };

  const handleScanner = () => {
    setIsScanning(true);
  };

  const generatePdfHtml = () => {
      const settings = data?.settings || {};
      return `
          <html>
              <head>
                  <title>Tax Invoice - ${invoiceNumber}</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                      body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 20px; color: #1e293b; max-width: 800px; margin: 0 auto; background: #fff; }
                      .header-banner { border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
                      .shop-name { font-size: 36px; font-weight: 900; margin: 0; text-transform: uppercase; color: #0f172a; letter-spacing: -1px; }
                      .shop-tagline { font-size: 14px; color: #64748b; margin-top: 5px; font-weight: 500; }
                      .inv-title { font-size: 24px; font-weight: 800; color: #10b981; margin: 0; text-transform: uppercase; text-align: right; }
                      
                      .row { display: flex; justify-content: space-between; margin-bottom: 30px; }
                      .box { background: #f8fafc; padding: 15px 20px; border-radius: 8px; width: 45%; border: 1px solid #e2e8f0; }
                      .box-title { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 8px; }
                      .box-value { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0; }
                      
                      table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                      th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                      th { background: #f1f5f9; color: #475569; font-weight: 700; font-size: 12px; text-transform: uppercase; }
                      td { font-size: 14px; font-weight: 500; }
                      .item-name { font-weight: 700; color: #0f172a; }
                      .item-hsn { font-size: 11px; color: #94a3b8; display: block; margin-top: 2px; }
                      
                      .totals-container { display: flex; justify-content: flex-end; margin-bottom: 40px; }
                      .totals { background: #f8fafc; padding: 20px; border-radius: 8px; width: 300px; border: 1px solid #e2e8f0; }
                      .tot-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #475569; }
                      .tot-row strong { color: #0f172a; }
                      .tot-final { display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px dashed #cbd5e1; font-size: 20px; font-weight: 800; color: #10b981; }
                      
                      .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
                      .sign-line { width: 150px; border-bottom: 1px solid #0f172a; margin-bottom: 5px; height: 40px; }
                  </style>
              </head>
              <body>
                  <div class="header-banner">
                      <div>
                          <h1 class="shop-name">${shopName || 'AUTO PARTS STORE'}</h1>
                          ${settings.businessAddress ? `<div class="shop-tagline" style="white-space: pre-wrap;">${settings.businessAddress}</div>` : ''}
                          <div class="shop-tagline">
                              ${settings.phone ? `Phone: ${settings.phone} ` : ''}
                              ${settings.email ? `| Email: ${settings.email}` : ''}
                          </div>
                          ${settings.gstNumber ? `<div style="font-weight: 700; margin-top: 10px; color: #0f172a;">GSTIN: ${settings.gstNumber}</div>` : ''}
                      </div>
                      <div>
                          <h2 class="inv-title">TAX INVOICE</h2>
                          <div style="font-weight: 600; font-size: 14px; color: #0f172a; margin-top: 5px; text-align: right;">#${settings.invoicePrefix || 'INV'}-${invoiceNumber}</div>
                          <div style="font-size: 14px; color: #64748b; text-align: right;">${date}</div>
                      </div>
                  </div>
                  
                  <div class="row">
                      <div class="box">
                          <div class="box-title">Billed To</div>
                          <div class="box-value">${customerType}</div>
                          <div style="font-size: 14px; color: #475569; margin-top: 4px;">${mobile || 'No Mobile Provided'}</div>
                          ${vehicleNumber ? `<div style="margin-top: 8px; display: inline-block; background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 12px;">🚗 ${vehicleNumber}</div>` : ''}
                      </div>
                      <div class="box">
                          <div class="box-title">Payment Info</div>
                          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                              <span style="color: #64748b; font-size: 14px;">Mode:</span>
                              <span style="font-weight: 700; color: #0f172a;">${paymentMode}</span>
                          </div>
                          <div style="display: flex; justify-content: space-between;">
                              <span style="color: #64748b; font-size: 14px;">Status:</span>
                              <span style="font-weight: 700; color: #10b981;">PAID</span>
                          </div>
                      </div>
                  </div>
                  
                  <table>
                      <thead>
                          <tr>
                              <th>#</th>
                              <th>Item Name</th>
                              <th style="text-align: center;">Qty</th>
                              <th style="text-align: right;">Rate (₹)</th>
                              <th style="text-align: center;">GST</th>
                              <th style="text-align: right;">Amount (₹)</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${items.map((item, i) => `
                              <tr>
                                  <td style="color: #94a3b8;">${i + 1}</td>
                                  <td>
                                      <span class="item-name">${item.name}</span>
                                      <span class="item-hsn">HSN: ${item.hsn}</span>
                                  </td>
                                  <td style="text-align: center;">${item.qty}</td>
                                  <td style="text-align: right;">${item.rate.toFixed(2)}</td>
                                  <td style="text-align: center;">${item.gst}%</td>
                                  <td style="text-align: right; font-weight: 700;">${item.amount.toFixed(2)}</td>
                              </tr>
                          `).join('')}
                      </tbody>
                  </table>
                  
                  <div class="totals-container">
                      <div class="totals">
                          <div class="tot-row">
                              <span>Subtotal</span>
                              <strong>₹${subtotal.toFixed(2)}</strong>
                          </div>
                          <div class="tot-row">
                              <span>Total GST</span>
                              <strong>₹${totalGst.toFixed(2)}</strong>
                          </div>
                          ${discount > 0 ? `
                          <div class="tot-row" style="color: #ef4444;">
                              <span>Discount</span>
                              <strong>- ₹${discount.toFixed(2)}</strong>
                          </div>
                          ` : ''}
                          <div class="tot-final">
                              <span>Grand Total</span>
                              <span>₹${total.toFixed(2)}</span>
                          </div>
                      </div>
                  </div>
                  
                  <div class="footer">
                      <div>
                          <strong>Terms & Conditions</strong><br>
                          1. Goods once sold will not be taken back.<br>
                          2. Warranty strictly against manufacturing defects as per company policy.
                          ${settings.showBankOnInvoice ? `
                          <div style="margin-top: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; max-width: 300px;">
                              <strong style="color: #0f172a;">Bank Account Details:</strong><br/>
                              Name: ${settings.bankAccountName || '-'}<br/>
                              A/C No: ${settings.bankAccountNumber || '-'}<br/>
                              IFSC: ${settings.bankIFSC || '-'}
                          </div>
                          ` : ''}
                      </div>
                      <div style="text-align: right;">
                          <div class="sign-line"></div>
                          <strong>Authorized Signatory</strong>
                      </div>
                  </div>
              </body>
          </html>
      `;
  };

  const handlePrint = () => {
      globalToast("Generating print layout...", "info");
      const win = window.open('', '_blank');
      if (win) {
          win.document.write(generatePdfHtml());
          win.document.close();
          setTimeout(() => {
              win.print();
          }, 500);
      } else {
          globalToast("Popup blocked! Allow popups to print.", "error");
      }
  };

  const shareText = `🧾 *Retail Invoice | ${shopName || "KRIXOV"}*\nInv No: #${invoiceNumber}\nDate: ${date}\n\n${vehicleNumber ? `*Vehicle:* ${vehicleNumber}\n` : ''}*Billed To:* ${customerType}\n\n*Items:*\n${items.map(i => `▫️ ${i.name} x ${i.qty}`).join('\n')}\n\n*Grand Total:* ₹${total.toFixed(2)}\n*Payment Mode:* ${paymentMode} ✅\n\nThank you for shopping with us! Drive Safe! 🚗✨`;

  const handleShareWhatsapp = () => {
    let url = mobile && mobile.length >= 10
        ? `https://wa.me/91${mobile.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(shareText)}`
        : `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareSMS = () => {
    window.open(`sms:?body=${encodeURIComponent(shareText)}`, '_self');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoiceNumber}`,
          text: shareText,
        });
      } catch (err) {}
    } else {
      setShowShareOptions(true);
    }
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.rate) {
      globalToast("Please enter item name and rate!", "warning");
      return;
    }
    const rate = parseFloat(String(newItem.rate));
    const amount = (rate * newItem.qty) * (1 + (newItem.gst / 100));
    setItems([...items, { ...newItem, rate, amount, id: Date.now(), hsn: "0000" }]);
    setNewItem({ name: "", qty: 1, rate: 0, gst: 18 });
    setSearchTerm("");
    globalToast("Item added to bill!", "success");
  };

  const deleteItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };
  
  // Shared styles
  const commonInputClass = `w-full ${isDark ? 'bg-slate-900/50 border-slate-700/50 text-white placeholder-slate-500' : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400'} border rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all backdrop-blur-sm`;

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} font-sans relative overflow-hidden animate-in fade-in duration-300`}>
      
      {/* Scanner Loading Visual Modal */}
      {isScanning && (
        <div className="absolute inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center animate-in fade-in backdrop-blur-sm">
          <div className="text-white mb-6 text-[18px] font-bold flex items-center gap-2">
            <Camera className="animate-pulse text-emerald-400" /> Scan Barcode
          </div>
          <div className="w-full max-w-md h-72 bg-black rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
            <BarcodeScanner
              onScan={(scanned) => {
                setIsScanning(false);
                if (!scanned) return;
                setSearchTerm(scanned);
                setNewItem({...newItem, name: `Scanned: ${scanned}`});
                globalToast("Barcode Scanned! Set rate & add.", "success");
              }}
              onClose={() => setIsScanning(false)}
            />
          </div>
          <button onClick={() => setIsScanning(false)} className="mt-8 bg-white/10 hover:bg-white/20 px-8 py-3.5 rounded-2xl text-white backdrop-blur-md font-bold flex items-center gap-2 transition-all active:scale-95">
            <XCircle size={20} /> Cancel
          </button>
        </div>
      )}

      {/* Share Actions Standard Modal Layer */}
      {showShareOptions && (
        <div className="absolute inset-0 bg-slate-900/60 z-50 flex items-end justify-center animate-in fade-in backdrop-blur-sm" onClick={() => setShowShareOptions(false)}>
          <div className={`${isDark ? 'bg-slate-900' : 'bg-white'} w-full rounded-t-[32px] p-6 animate-in slide-in-from-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.2)]`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black flex items-center gap-2"><Share2 className="text-emerald-500"/> Share Options</h3>
              <button onClick={() => setShowShareOptions(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
               <button onClick={handleShareWhatsapp} className={`flex flex-col items-center gap-3 p-4 rounded-2xl ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} active:scale-95 transition-all`}>
                  <div className="w-14 h-14 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center"><MessageSquare size={28} /></div>
                  <span className="text-[13px] font-bold">WhatsApp</span>
               </button>
               <button onClick={handleShareSMS} className={`flex flex-col items-center gap-3 p-4 rounded-2xl ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} active:scale-95 transition-all`}>
                  <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center"><MessageSquare size={28} /></div>
                  <span className="text-[13px] font-bold">Messages</span>
               </button>
               <button onClick={handlePrint} className={`flex flex-col items-center gap-3 p-4 rounded-2xl ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} active:scale-95 transition-all`}>
                  <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center"><Download size={28} /></div>
                  <span className="text-[13px] font-bold">Print/PDF</span>
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`flex items-center justify-between p-5 border-b shrink-0 ${isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md sticky top-0 z-20 shadow-sm`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`p-2 rounded-full transition-all active:scale-95 ${isDark ? 'hover:bg-slate-800 bg-slate-800/50' : 'hover:bg-slate-100 bg-slate-100/50'}`}>
            <ArrowLeft size={20} className={isDark ? 'text-slate-300' : 'text-slate-700'} />
          </button>
          <div>
            <h1 className="text-xl font-black flex items-center gap-2 tracking-tight">
              <Receipt className="text-emerald-500" size={22} />
              Invoice Pro
            </h1>
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">#{invoiceNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowShareOptions(true)} className="flex items-center gap-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95">
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-48 hide-scrollbar">
        {/* Top Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Identity Card */}
            <div className={`p-5 rounded-3xl ${isDark ? 'bg-slate-900/50 border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.4)]' : 'bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'} backdrop-blur-sm relative overflow-hidden flex flex-col justify-between`}>
              <div className="absolute -right-4 -bottom-4 opacity-5"><ShieldCheck size={100} /></div>
              <div>
                <h2 className="text-2xl font-black text-emerald-500 uppercase tracking-wide mb-1">{shopName || "KRIXOV"}</h2>
                <p className="text-sm font-bold text-slate-500 tracking-wider">RETAIL INVOICE</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 relative z-10">
                <button onClick={() => globalToast("Device calendar triggered", "info")} className={`flex items-center gap-1.5 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'} px-3 py-1.5 rounded-lg text-xs font-bold transition-colors active:scale-95`}>
                  <Calendar size={14} /> {date}
                </button>
                <button onClick={() => setShowPaymentModal(true)} className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors active:scale-95 cursor-pointer">
                  <span className="w-4 h-4 bg-emerald-500 rounded-full text-white flex items-center justify-center text-[10px]">₹</span>
                  {paymentMode} <ChevronDown size={14} />
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <div className={`p-5 rounded-3xl ${isDark ? 'bg-slate-900/50 border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.4)]' : 'bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'} backdrop-blur-sm`}>
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Billed To
                </h4>
                <button onClick={() => setShowCustomerModal(true)} className={`text-xs font-bold ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'} px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all`}>
                  {customerType} <ChevronDown size={14} />
                </button>
              </div>

              {canUseLastScanned && !vehicleNumber && (
                <div className="flex items-center justify-between mb-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl px-3 py-2 animate-in fade-in">
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <ScanBarcode size={14}/> Scanned: {lastScannedVehicle.regNo}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleUseLastScanned} className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm hover:scale-105 transition-all">Link</button>
                    <button onClick={handleClearLastScanned} className="text-xs font-bold text-slate-400 hover:text-slate-500"><X size={14}/></button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="tel" 
                    placeholder="Customer Phone (Optional)"
                    className={`${commonInputClass} pl-10 text-sm`}
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Car size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Vehicle Reg No (e.g. DL-8C-xxxx)"
                    className={`${commonInputClass} pl-10 text-sm font-bold uppercase text-emerald-600 dark:text-emerald-400`}
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>
        </div>

        {/* Add Item Smart Row */}
        <div className={`p-4 sm:p-5 rounded-3xl ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-lg' : 'bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-md'} relative`}>
           <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                <input 
                  placeholder="Search item to bill..."
                  className={`w-full ${isDark ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-300'} border-2 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all`}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-12 top-2 z-10"><VoiceInput onResult={setSearchTerm} isDark={isDark} /></div>
              </div>
              <button onClick={handleScanner} className="w-[52px] h-[52px] rounded-2xl bg-slate-900 text-white dark:bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg active:scale-95 transition-all">
                <ScanBarcode size={24} />
              </button>
           </div>

           {/* Quick Add Form */}
           <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-950/50 border border-slate-800' : 'bg-slate-100/50 border border-slate-200'} flex flex-col sm:flex-row items-center gap-3`}>
              <div className="w-full sm:flex-1 relative">
                <input
                  placeholder="Item Name"
                  className={`${commonInputClass} text-sm`}
                  value={newItem.name}
                  onChange={e => { setNewItem({...newItem, name: e.target.value}); setShowItemDropdown(true); }}
                  onFocus={() => setShowItemDropdown(true)}
                />
                {showItemDropdown && (newItem.name) && filteredInventory.length > 0 && (
                  <div className={`absolute z-50 top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-2xl shadow-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} overflow-hidden animate-in fade-in slide-in-from-top-2`}>
                    {filteredInventory.map(page => (
                        <div 
                          key={page.id}
                          className={`p-4 border-b last:border-0 cursor-pointer transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-100 hover:bg-emerald-50'}`}
                          onClick={() => {
                            const defaultPrice = page.purchases && page.purchases.length > 0 ? page.purchases[0].price : 0;
                            setNewItem({ ...newItem, name: page.itemName, rate: defaultPrice });
                            setShowItemDropdown(false);
                          }}
                        >
                          <div className="text-sm font-bold">{page.itemName}</div>
                          <div className="text-xs font-semibold text-emerald-500 mt-1">₹{page.purchases && page.purchases.length > 0 ? page.purchases[0].price : 0}</div>
                        </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex w-full sm:w-auto items-center gap-2">
                <div className="w-20">
                  <input type="number" placeholder="Qty" className={`${commonInputClass} text-center`} value={newItem.qty || ""} onChange={e => setNewItem({...newItem, qty: parseInt(e.target.value) || 0})} />
                </div>
                <div className="w-24">
                  <input type="number" placeholder="Rate ₹" className={`${commonInputClass} text-right`} value={newItem.rate || ""} onChange={e => setNewItem({...newItem, rate: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="w-[70px] relative">
                  <select className={`${commonInputClass} px-2 appearance-none`} value={newItem.gst} onChange={e => setNewItem({...newItem, gst: parseInt(e.target.value)})}>
                    <option value={0}>0%</option><option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option><option value={28}>28%</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                </div>
                <button onClick={handleAddItem} className="w-[46px] h-[46px] rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-all shrink-0">
                  <Plus size={22} strokeWidth={3} />
                </button>
              </div>
           </div>
        </div>

        {/* Existing Items List */}
        <div className={`rounded-3xl ${isDark ? 'bg-slate-900/50 border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.4)]' : 'bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'} overflow-hidden backdrop-blur-sm`}>
          <div className={`flex justify-between items-center p-5 border-b ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
            <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Billed Items</h3>
            <span className="text-xs font-bold bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md">{items.length}</span>
          </div>

          {items.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-center opacity-70">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Package size={30} className="text-slate-400" />
              </div>
              <p className="font-bold text-lg mb-1">Cart is empty</p>
              <p className="text-sm font-medium text-slate-500">Scan or search items to start billing</p>
            </div>
          ) : (
            <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {items.map((item, idx) => (
                <div key={item.id} className="p-4 sm:p-5 flex gap-4 group relative items-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                   <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                     {idx + 1}
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="text-base font-bold truncate">{item.name}</h4>
                     <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase">HSN: {item.hsn}</span>
                       {item.gst > 0 && <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded flex items-center gap-0.5">GST {item.gst}%</span>}
                     </div>
                   </div>
                   <div className="text-right flex flex-col items-end justify-center">
                     <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{item.amount.toFixed(2)}</span>
                     <span className="text-xs font-bold text-slate-500 mt-0.5">{item.qty} × ₹{item.rate.toFixed(1)}</span>
                   </div>
                   <button onClick={() => deleteItem(item.id)} className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-rose-100 dark:hover:bg-rose-500/20 active:scale-90 shrink-0 ml-2">
                     <Trash2 size={16} />
                   </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Summary & Actions */}
      <div className={`absolute bottom-0 left-0 right-0 z-30 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'} border-t backdrop-blur-xl pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]`}>
        {/* Bill Total Summaries Card */}
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-8 flex flex-wrap gap-4 items-center justify-between md:justify-start">
             <div className={`px-4 py-2 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Subtotal</p>
               <p className="text-sm font-black">₹{subtotal.toFixed(2)}</p>
             </div>
             <div className="text-slate-300 dark:text-slate-700 hidden md:block">+</div>
             <div className={`px-4 py-2 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total GST</p>
               <p className="text-sm font-black text-slate-700 dark:text-slate-300">₹{totalGst.toFixed(2)}</p>
             </div>
             <div className="text-slate-300 dark:text-slate-700 hidden md:block">-</div>
             <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 ${isDark ? 'bg-rose-950/30' : 'bg-rose-50'} border border-rose-100 dark:border-rose-900/30`}>
               <div>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-0.5">Discount (₹)</p>
                  <input type="number" placeholder="0" value={discount || ''} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="w-20 bg-transparent text-sm font-black text-rose-600 outline-none" />
               </div>
             </div>
          </div>
          
          <div className="md:col-span-4 flex gap-3">
             <button onClick={handleGenerate} disabled={isGenerating || items.length === 0} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-lg flex justify-between items-center px-6 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100">
                <span className="flex items-center gap-2">
                   {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle size={24} strokeWidth={2.5}/>} 
                   Generate
                </span>
                <span className="text-2xl">₹{total.toFixed(0)}</span>
             </button>
          </div>
        </div>
      </div>

      {/* APPLE-PAY STYLE GENERATED BILL SUCCESS OVERLAY */}
      {showSuccessCard && (
         <div className={`absolute inset-0 z-[100] flex flex-col p-6 animate-in slide-in-from-bottom-12 duration-500 ${isDark ? 'bg-slate-950' : 'bg-emerald-50'} flex-1 h-full overflow-y-auto w-full`}>
            <div className="pt-4 pb-2 flex justify-end w-full relative z-10">
                <button onClick={() => { setShowSuccessCard(false); setItems([]); }} className={`p-3 rounded-full transition-all active:scale-90 ${isDark ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-slate-900 shadow-sm hover:bg-slate-100'}`}><X size={24} strokeWidth={3}/></button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto relative z-10">
                <div className="w-28 h-28 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-8 animate-in zoom-in spin-in-12 duration-700 shadow-2xl shadow-emerald-500/40 border-[6px] border-emerald-400/30">
                    <CheckCircle2 size={60} strokeWidth={3} />
                </div>
                
                <h2 className="text-3xl font-black mb-2 text-center tracking-tight text-slate-900 dark:text-white">Payment Success</h2>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold mb-8 text-lg bg-emerald-500/10 px-4 py-1.5 rounded-full">Invoice #{invoiceNumber} Generated</p>
                
                <div className={`w-full p-8 rounded-3xl mb-8 shadow-2xl shadow-slate-200/50 dark:shadow-none ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                    <div className="flex flex-col items-center mb-6 pb-6 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-2">Amount Billed</span>
                        <span className="font-black text-5xl text-slate-900 dark:text-white tracking-tighter">₹{total.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-bold">Vehicle</span>
                            <span className="font-black text-slate-900 dark:text-white">{vehicleNumber || 'Not Specified'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-bold">Customer</span>
                            <span className="font-black text-slate-900 dark:text-white truncate max-w-[150px] text-right">{customerType}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-bold">Items Sold</span>
                            <span className="font-black text-slate-900 dark:text-white">{items.length} Products</span>
                        </div>
                        <div className="flex justify-between items-center text-sm pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500 font-bold">Mode</span>
                            <span className="font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg uppercase tracking-wider">{paymentMode}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-3 mt-auto">
                    <button onClick={handleShareWhatsapp} className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-2xl font-black text-lg shadow-[0_8px_20px_rgba(37,211,102,0.3)] active:scale-95 transition-transform">
                       <MessageSquare size={22} fill="currentColor" /> Send WhatsApp Receipt
                    </button>
                    <button onClick={handlePrint} className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-lg active:scale-95 transition-transform border-2 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
                       <Download size={22} /> Print PDF Bill
                    </button>
                    <button onClick={() => { setShowSuccessCard(false); setItems([]); globalToast("Ready for New Bill", "info"); }} className="w-full py-4 mt-2 rounded-2xl text-slate-500 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors active:scale-95 uppercase tracking-widest text-sm">
                        Create New Bill
                    </button>
                </div>
            </div>
         </div>
      )}

      {/* Select Payment Modal */}
      {showPaymentModal && (
        <div className="absolute inset-0 bg-slate-900/60 z-50 flex items-end justify-center animate-in fade-in backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}>
          <div className={`${isDark ? 'bg-slate-900' : 'bg-white'} w-full rounded-t-[32px] p-6 pb-safe animate-in slide-in-from-bottom`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Payment Mode</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
               {["Cash", "UPI / QR Code", "Credit Card", "Store Credit"].map(mode => (
                  <button key={mode} onClick={() => { setPaymentMode(mode); setShowPaymentModal(false); globalToast(`Payment set to ${mode}`, "success"); }} className={`p-4 rounded-2xl border-2 text-center transition-all ${paymentMode === mode ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black shadow-sm" : `border-transparent ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'} font-bold`}`}>
                     {mode}
                  </button>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* Select Customer Mode */}
      {showCustomerModal && (
        <div className="absolute inset-0 bg-slate-900/60 z-50 flex items-end justify-center animate-in fade-in backdrop-blur-sm" onClick={() => setShowCustomerModal(false)}>
          <div className={`${isDark ? 'bg-slate-900' : 'bg-white'} w-full rounded-t-[32px] p-6 pb-safe animate-in slide-in-from-bottom`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Customer Type</h3>
              <button onClick={() => setShowCustomerModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={20}/></button>
            </div>
            <div className="flex flex-col gap-3 mb-4">
               {["Walk-in Customer", "Regular Customer", "B2B / Wholesale", "Exempt Customer"].map(type => (
                  <button key={type} onClick={() => { setCustomerType(type); setShowCustomerModal(false); }} className={`p-4 rounded-2xl border-2 text-left transition-all ${customerType === type ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black shadow-sm" : `border-transparent ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'} font-bold`}`}>
                     {type}
                  </button>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default InvoicePro;
