import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';

export function IntelligentHome() {
  const { t } = useTranslation();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden bg-[#1a1a1a]">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/intelligent-home/hero-bg.webp" 
            alt="Smart home solutions" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black !text-white uppercase tracking-widest mb-4">
            Smart home solutions
          </h1>
        </div>
      </section>

      {/* Remote Control Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-16 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-8 relative">
                Remote control
                <div className="absolute -left-6 lg:-left-16 top-1/2 -translate-y-1/2 w-4 lg:w-12 h-[2px] bg-mammut-gold" />
              </h2>
              <div className="text-gray-600 space-y-6 leading-relaxed">
                <p>
                  Smart solutions that allow to control the working of radiators, thermostat and roller shutters may decrease heating bills by 20-30 percent.* Intelligent lighting control may generate extra savings. External roller shutters constitute an important element in this aspect since heat energy is lost through window panes. Already ca. one in five Poles use intelligent solutions in their houses.
                </p>
                <p>
                  Providing the window suite products with the option of smart control by a remote-control device, tablet, or smartphone, which also allows the system to be managed remotely while we are away, is becoming increasingly popular among customers.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-800 font-medium mt-6">
                  <li>Electronic key-operated lock cylinder system</li>
                  <li>Data exchange takes place in a virtual network, where we can assign different access rights to each user and freely control their activity</li>
                  <li>Integration with the building management system.</li>
                </ul>
                <p className="text-xs text-gray-400 italic mt-8">
                  *according to Somfy, 2016 r.
                </p>
              </div>
            </div>
            <div className="text-center">
              <img 
                src="/assets/intelligent-home/smart-en.jpg" 
                alt="Remote Control" 
                className="w-full max-w-md mx-auto shadow-2xl rounded-sm object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Windows, doors, heating Section */}
      <section className="py-20 lg:py-32 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-6 lg:px-16 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-4">
              Windows, doors, heating
            </h2>
            <p className="text-mammut-gold uppercase tracking-widest font-bold">
              Smart window suite control
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="flex flex-col">
              <div className="bg-black aspect-video overflow-hidden mb-6 rounded-sm">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                  <source src="/assets/intelligent-home/Uchyl-Zamkniecie.mp4" type="video/mp4" />
                </video>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest text-black mb-4">
                Window control
              </h3>
              <div className="w-12 h-1 bg-mammut-gold mb-4" />
              <p className="text-gray-600 leading-relaxed text-sm">
                Installation of smart opening and closing systems for windows using a MACO motor. The system can be compatible with management and access control systems.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col">
              <div className="bg-black aspect-video overflow-hidden mb-6 rounded-sm">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                  <source src="/assets/intelligent-home/Grzejnik.mp4" type="video/mp4" />
                </video>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest text-black mb-4">
                Heater control
              </h3>
              <div className="w-12 h-1 bg-mammut-gold mb-4" />
              <p className="text-gray-600 leading-relaxed text-sm">
                It is possible to integrate the window closing system with home heating, so that opening a window can trigger the simultaneous switching off of the heating.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col">
              <div className="bg-black aspect-video overflow-hidden mb-6 rounded-sm">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                  <source src="/assets/intelligent-home/Smart-Drzwi.mp4" type="video/mp4" />
                </video>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest text-black mb-4">
                Automatic door closing system
              </h3>
              <div className="w-12 h-1 bg-mammut-gold mb-4" />
              <p className="text-gray-600 leading-relaxed text-sm">
                The magnet mounted on the striker locks the door independently every time it is closed. The door can be integrated with a motor and management, and access control system based on fingerprint, keypad, etc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tahoma Somfy Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden bg-white">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gray-50 hidden lg:block" />
        <div className="container mx-auto px-6 lg:px-16 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-8 relative">
                Tahoma Somfy
                <div className="absolute -left-6 lg:-left-16 top-1/2 -translate-y-1/2 w-4 lg:w-12 h-[2px] bg-mammut-gold" />
              </h2>
              <div className="text-gray-600 space-y-6 leading-relaxed">
                <p>
                  Somfy TaHoma automatic control system allows us to tailor any equipment in the home to our needs, while making it extremely easy and enjoyable to use.
                </p>
                <p>
                  With the help of the modern Tahoma system, windows, doors, or roller shutters can open or close automatically at preselected times of the day, tilt or slide in integrated groups or individually, providing us with complete control and monitoring of our home, even when we are not inside. By using the phone, we also gain constant surveillance and access to the systems installed in the home at any time of the day or night, if necessary.
                </p>
                <p>
                  Compatibility with all devices using IO technology is guaranteed. Moreover, it is also possible to control many models of devices made in RTS technology, which is still on the market but does not allow verification of command execution.
                </p>
              </div>
            </div>
            <div className="lg:col-span-5 flex items-center justify-center">
              <img 
                src="/assets/intelligent-home/tahoma-main.jpg" 
                alt="Tahoma Somfy" 
                className="w-full max-w-md shadow-xl rounded-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tahoma Details Grid */}
      <section className="py-20 bg-[#1a1a1a] text-white">
        <div className="container mx-auto px-6 lg:px-16 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="h-24 flex items-center justify-center mb-6">
                <img src="/assets/intelligent-home/tahoma-wifi.png" alt="Connect the Tahoma router to Wi-Fi" className="max-h-full object-contain" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-wider mb-4">Connect the Tahoma router to Wi-Fi</h3>
              <div className="w-12 h-1 bg-mammut-gold mx-auto mb-4" />
              <p className="!text-white text-sm leading-relaxed max-w-sm mx-auto">
                Once connected, the router will make the necessary configuration settings automatically. There is a possibility of remote control from a web browser or via an application on mobile devices (IOS, Android).
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-24 flex items-center justify-center mb-6">
                <img src="/assets/intelligent-home/tahoma-realtime.png" alt="Real-time operations" className="max-h-full object-contain" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-wider mb-4">Real-time operations</h3>
              <div className="w-12 h-1 bg-mammut-gold mx-auto mb-4" />
              <p className="!text-white text-sm leading-relaxed max-w-sm mx-auto">
                We issue a command to perform any operation and we simultaneously check whether it has been performed. For example, the garage door is not closed because it encountered an obstacle when closing and automatically opened again.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-24 flex items-center justify-center mb-6">
                <img src="/assets/intelligent-home/tahoma-scenario.png" alt="Scenario planning" className="max-h-full object-contain" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-wider mb-4">Scenario planning</h3>
              <div className="w-12 h-1 bg-mammut-gold mx-auto mb-4" />
              <p className="!text-white text-sm leading-relaxed max-w-sm mx-auto">
                Up to 40 control scenarios can be created on the computer and run manually, automatically at a specific time or depending on sensor signals. Compatibility with all IO devices is guaranteed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BLEBOX Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-16 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-8 relative">
                BLEBOX
                <div className="absolute -left-6 lg:-left-16 top-1/2 -translate-y-1/2 w-4 lg:w-12 h-[2px] bg-mammut-gold" />
              </h2>
              <div className="text-gray-600 space-y-6 leading-relaxed">
                <p>
                  With blebox solutions, DRUTEX customers can open and close windows, doors, and roller shutters.
                </p>
                <p>
                  These are miniature devices that allow you to open and close doors, windows, roller shutters, awnings, facade blinds, gates, manage lighting or the alarm system via your smartphone and tablet from anywhere in the world.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-800 font-medium mt-6">
                  <li>Control via tablet or smartphone.</li>
                  <li>A smart system for opening and closing windows, doors, and roller shutters.</li>
                  <li>Automatic door bolt – locks the door whenever it is closed.</li>
                </ul>
              </div>
            </div>
            <div className="text-center">
              <img 
                src="/assets/intelligent-home/blebox.jpg" 
                alt="Blebox wireless control" 
                className="w-full max-w-md mx-auto shadow-2xl rounded-sm object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
