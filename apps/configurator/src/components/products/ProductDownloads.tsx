import { useTranslation } from 'react-i18next';

interface DownloadItem {
  id: string;
  title: string;
  buttonText: string;
  fileUrl: string;
  iconUrl: string;
  buttonIconUrl?: string;
}

interface ProductDownloadsProps {
  downloads: DownloadItem[];
}

export function ProductDownloads({ downloads }: ProductDownloadsProps) {
  const { t } = useTranslation();

  if (!downloads || downloads.length === 0) return null;

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-6 max-w-7xl">
        <h2 className="text-3xl font-black uppercase mb-8 text-black tracking-widest text-left">
          {t('productDetail.downloads', { defaultValue: 'Downloads' })}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {downloads.map((item) => (
            <div key={item.id} className="border border-gray-200 p-8 flex flex-col items-center text-center transition-shadow hover:shadow-lg bg-white">
              <div className="w-12 h-12 mb-6 flex items-center justify-center">
                <img src={item.iconUrl} alt="icon" className="w-full h-full object-contain opacity-70" />
              </div>
              <p className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-8 border-b border-gray-100 pb-4 w-full">
                {item.title}
              </p>
              <a 
                href={item.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full relative flex items-center justify-center py-3 border border-mammut-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-mammut-gold transition-colors group overflow-hidden"
              >
                {item.buttonIconUrl && (
                  <div 
                    className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-no-repeat bg-left-bottom bg-contain"
                    style={{ backgroundImage: `url(${item.buttonIconUrl})` }}
                  />
                )}
                <span className="relative z-10">{item.buttonText}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
