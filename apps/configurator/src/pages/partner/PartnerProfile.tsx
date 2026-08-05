import { Store, MapPin, Phone, Mail, Upload, Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function PartnerProfile() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-mammut-white">{t('partner.profile.title')}</h2>
        <p className="text-gray-400 mt-1">{t('partner.profile.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-mammut-darker border border-gray-800 rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-mammut-white flex items-center gap-2 border-b border-gray-800 pb-4">
              <Store className="w-5 h-5 text-mammut-gold" />
              {t('partner.profile.basicInfo')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">{t('partner.profile.storeName')}</label>
                <input 
                  type="text" 
                  defaultValue="Ferreteria 88"
                  className="w-full bg-mammut-black border border-gray-800 rounded-lg px-4 py-2 text-mammut-white focus:outline-none focus:border-mammut-gold transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">{t('partner.profile.storeType')}</label>
                <select className="w-full bg-mammut-black border border-gray-800 rounded-lg px-4 py-2 text-mammut-white focus:outline-none focus:border-mammut-gold transition-colors">
                  <option>{t('partner.profile.types.hardware')}</option>
                  <option>{t('partner.profile.types.pharmacy')}</option>
                  <option>{t('partner.profile.types.restaurant')}</option>
                  <option>{t('partner.profile.types.other')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {t('partner.profile.address')}
              </label>
              <textarea 
                rows={3}
                defaultValue="123 Main Street&#10;Warsaw, 00-001&#10;Poland"
                className="w-full bg-mammut-black border border-gray-800 rounded-lg px-4 py-2 text-mammut-white focus:outline-none focus:border-mammut-gold transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {t('partner.profile.email')}
                </label>
                <input 
                  type="email" 
                  defaultValue="info@ferreteria88.com"
                  className="w-full bg-mammut-black border border-gray-800 rounded-lg px-4 py-2 text-mammut-white focus:outline-none focus:border-mammut-gold transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {t('partner.profile.phone')}
                </label>
                <input 
                  type="tel" 
                  defaultValue="+48 111 222 333"
                  className="w-full bg-mammut-black border border-gray-800 rounded-lg px-4 py-2 text-mammut-white focus:outline-none focus:border-mammut-gold transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button className="bg-mammut-gold hover:bg-[#d9a05b] text-black px-6 py-2 rounded-lg font-medium transition-colors">
                {t('partner.profile.saveChanges')}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-mammut-darker border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-mammut-white mb-4">{t('partner.profile.cobranding')}</h3>
            <p className="text-sm text-gray-400 mb-6">{t('partner.profile.cobrandingDesc')}</p>
            
            <div className="border-2 border-dashed border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-800/20 transition-colors cursor-pointer group">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-mammut-gold/20 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-mammut-gold transition-colors" />
              </div>
              <span className="font-medium text-mammut-white mb-1">{t('partner.profile.clickToUpload')}</span>
              <span className="text-xs text-gray-500">{t('partner.profile.fileTypes')}</span>
            </div>
          </div>

          <div className="bg-mammut-darker border border-gray-800 rounded-xl p-6">
             <h3 className="text-lg font-semibold text-mammut-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              {t('partner.profile.networkGroup')}
            </h3>
            <p className="text-sm text-gray-400 mb-4">{t('partner.profile.networkDesc')}</p>
            <button className="w-full bg-mammut-black border border-gray-800 hover:border-gray-700 text-mammut-white px-4 py-2 rounded-lg font-medium transition-colors">
              {t('partner.profile.linkChain')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
