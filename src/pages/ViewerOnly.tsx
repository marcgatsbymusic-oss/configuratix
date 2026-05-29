import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Child1 } from '../components/configurator/Child1';
import { F100TViewer } from '../components/configurator/F100TViewer';
import { ThreejsWindowEngine } from '../components/configurator/ThreejsWindowEngine';

export const ViewerOnly: React.FC = () => {
  const [searchParams] = useSearchParams();
  const typology = searchParams.get('typology') || 'F101B';
  const width = parseInt(searchParams.get('w') || '1000', 10);
  const height = parseInt(searchParams.get('h') || '1000', 10);
  
  // Hex Colors
  const colorExt = searchParams.get('cExt') ? decodeURIComponent(searchParams.get('cExt')!) : '#e8e0d4';
  const colorInt = searchParams.get('cInt') ? decodeURIComponent(searchParams.get('cInt')!) : '#f0ece6';
  const colorGsk = searchParams.get('cGsk') ? decodeURIComponent(searchParams.get('cGsk')!) : '#1c1c1c';
  const colorSpacer = searchParams.get('cSpc') ? decodeURIComponent(searchParams.get('cSpc')!) : '#b0b5b9';
  
  // Textures
  const colorExtTexture = searchParams.get('cExtTex') ? decodeURIComponent(searchParams.get('cExtTex')!) : undefined;
  const colorIntTexture = searchParams.get('cIntTex') ? decodeURIComponent(searchParams.get('cIntTex')!) : undefined;

  return (
    <div className="w-screen h-screen overflow-hidden bg-white relative">
      {typology === 'F100T' ? (
        <F100TViewer
          width={width}
          height={height}
          colorExt={colorExt}
          colorInt={colorInt}
          colorExtTexture={colorExtTexture}
          colorIntTexture={colorIntTexture}
          colorGsk={colorGsk}
          colorSpacer={colorSpacer}
        />
      ) : typology === 'F101B' ? (
        <Child1
          widthMm={width}
          heightMm={height}
          colorExt={colorExt}
          colorInt={colorInt}
          colorExtTexture={colorExtTexture}
          colorIntTexture={colorIntTexture}
          colorGsk={colorGsk}
          colorSpacer={colorSpacer}
        />
      ) : (
        <ThreejsWindowEngine
          width={width}
          height={height}
          colorExt={colorExt}
          colorInt={colorInt}
          colorExtTexture={colorExtTexture}
          colorIntTexture={colorIntTexture}
          spacerColor={colorSpacer}
          typology={typology}
        />
      )}
    </div>
  );
};
