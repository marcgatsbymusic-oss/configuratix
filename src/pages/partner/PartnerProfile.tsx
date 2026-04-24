import { Store, MapPin, Phone, Mail, Upload, Building2 } from 'lucide-react'

export function PartnerProfile() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Store Profile</h2>
        <p className="text-gray-400 mt-1">Manage your store details and co-branding settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-gray-800 pb-4">
              <Store className="w-5 h-5 text-[#eab676]" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Store Name</label>
                <input 
                  type="text" 
                  defaultValue="John Doe Hardware"
                  className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#eab676] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Store Type</label>
                <select className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#eab676] transition-colors">
                  <option>Hardware Store</option>
                  <option>Pharmacy</option>
                  <option>Restaurant</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Address
              </label>
              <textarea 
                rows={3}
                defaultValue="123 Main Street&#10;Warsaw, 00-001&#10;Poland"
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#eab676] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <input 
                  type="email" 
                  defaultValue="contact@johndoehardware.com"
                  className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#eab676] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone
                </label>
                <input 
                  type="tel" 
                  defaultValue="+48 111 222 333"
                  className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#eab676] transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button className="bg-[#eab676] hover:bg-[#d9a05b] text-black px-6 py-2 rounded-lg font-medium transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Co-Branding</h3>
            <p className="text-sm text-gray-400 mb-6">Upload your logo to appear on the customer landing page when they scan your QR codes.</p>
            
            <div className="border-2 border-dashed border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-800/20 transition-colors cursor-pointer group">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#eab676]/20 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#eab676] transition-colors" />
              </div>
              <span className="font-medium text-white mb-1">Click to upload logo</span>
              <span className="text-xs text-gray-500">SVG, PNG, or JPG (max. 2MB)</span>
            </div>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              Network Group
            </h3>
            <p className="text-sm text-gray-400 mb-4">Your store is an independent partner. If you belong to a larger chain, you can link your account.</p>
            <button className="w-full bg-black border border-gray-800 hover:border-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Link to Chain/Group
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
