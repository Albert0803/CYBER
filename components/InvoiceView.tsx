
import React from 'react';
import { BusinessInfo, Session, Subscription, Order } from '../types';

interface InvoiceViewProps {
  businessInfo: BusinessInfo;
  data: Session | Subscription | Order;
  onClose: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ businessInfo, data, onClose }) => {
  const isSession = (d: any): d is Session => 'durationMinutes' in d;
  const isSubscription = (d: any): d is Subscription => 'startDate' in d;
  const isOrder = (d: any): d is Order => 'item' in d;

  const date = new Date().toLocaleDateString('fr-FR');
  const invoiceId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

  let amount = 0;
  let description = '';

  if (isSession(data)) {
    amount = data.durationMinutes * (data.type === 'CYBER' ? businessInfo.cyberPricePerMin : businessInfo.gamePricePerMin);
    description = `Service ${data.type} - ${data.durationMinutes} minutes`;
  } else if (isSubscription(data)) {
    amount = data.price;
    description = `Abonnement Mensuel ${data.type}`;
  } else if (isOrder(data)) {
    amount = data.price;
    description = `Achat: ${data.item} (${data.category})`;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 no-print"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div id="invoice-content" className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div className="flex items-center gap-4">
              {businessInfo.logo && <img src={businessInfo.logo} alt="Logo" className="w-16 h-16 rounded object-cover" />}
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{businessInfo.name}</h1>
                <p className="text-sm text-slate-500">{businessInfo.address}</p>
                <p className="text-sm text-slate-500">Tél: {businessInfo.phone} | {businessInfo.email}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-indigo-600 uppercase">FACTURE</h2>
              <p className="text-sm font-semibold text-slate-500 mt-2">N° {invoiceId}</p>
              <p className="text-sm text-slate-500">Date: {date}</p>
            </div>
          </div>

          {/* Client & Legal */}
          <div className="grid grid-cols-2 gap-8 py-6 border-b">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Facturé à</p>
              <p className="text-lg font-bold text-slate-800">{(data as any).clientName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Détails Fiscaux</p>
              <p className="text-xs text-slate-600 font-mono">NIF: {businessInfo.nif}</p>
              <p className="text-xs text-slate-600 font-mono">STAT: {businessInfo.stat}</p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="py-4 text-xs font-bold text-slate-400 uppercase">Description</th>
                <th className="py-4 text-xs font-bold text-slate-400 uppercase text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-4 text-slate-800 font-medium">{description}</td>
                <td className="py-4 text-slate-800 text-right font-bold">{amount.toLocaleString()} {businessInfo.currency}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="py-6 text-xl font-bold text-slate-900 text-right pr-4">TOTAL</td>
                <td className="py-6 text-2xl font-black text-indigo-600 text-right">
                  {amount.toLocaleString()} {businessInfo.currency}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="pt-10 text-center border-t">
            <p className="text-sm text-slate-500 font-medium italic">Merci de votre fidélité chez {businessInfo.name} !</p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 no-print">
          <button 
            onClick={() => window.print()}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition"
          >
            Imprimer la Facture
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
