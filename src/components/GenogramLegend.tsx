
import { X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface GenogramLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GenogramLegend = ({ isOpen, onClose }: GenogramLegendProps) => {
  const t = useTranslation();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-deep-surface border border-ocean-800 rounded-xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-ocean-100">{t.genogramLegend.title}</h2>
          <button onClick={onClose} className="text-ocean-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Gender Symbols */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-ocean-200 mb-4">{t.genogramLegend.genderSymbols}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-blue-500 bg-blue-900/40"></div>
              <div>
                <p className="font-semibold text-ocean-100">{t.genogramLegend.male}</p>
                <p className="text-sm text-ocean-400">{t.genogramLegend.square}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-pink-500 bg-pink-900/40"></div>
              <div>
                <p className="font-semibold text-ocean-100">{t.genogramLegend.female}</p>
                <p className="text-sm text-ocean-400">{t.genogramLegend.circle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-purple-500" 
                   style={{borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderBottom: '20px solid rgb(168, 85, 247)'}}></div>
              <div>
                <p className="font-semibold text-ocean-100">{t.genogramLegend.unknownNonBinary}</p>
                <p className="text-sm text-ocean-400">{t.genogramLegend.triangleOrVariable}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-ocean-500 bg-ocean-900/40" style={{borderRadius: '2px', transform: 'rotate(45deg)'}}></div>
              <div>
                <p className="font-semibold text-ocean-100">{t.genogramLegend.deceased}</p>
                <p className="text-sm text-ocean-400">{t.genogramLegend.xThroughSymbol}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Relationship Lines */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-ocean-200 mb-4">{t.genogramLegend.relationshipTypes}</h3>
          <div className="space-y-3 text-sm">
            <div className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-900/20">
              <p className="font-semibold text-ocean-100">{t.genogramLegend.biologicalRelations}</p>
              <p className="text-ocean-400">{t.genogramLegend.biologicalRelationsDesc}</p>
            </div>
            <div className="border-l-4 border-pink-500 pl-3 py-2 bg-pink-900/20">
              <p className="font-semibold text-ocean-100">{t.genogramLegend.partnerships}</p>
              <p className="text-ocean-400">{t.genogramLegend.partnershipsDesc}</p>
            </div>
            <div className="border-l-4 border-cyan-500 pl-3 py-2 bg-cyan-900/20">
              <p className="font-semibold text-ocean-100">{t.genogramLegend.adoptionGuardianship}</p>
              <p className="text-ocean-400">{t.genogramLegend.adoptionGuardianshipDesc}</p>
            </div>
            <div className="border-l-4 border-green-500 pl-3 py-2 bg-green-900/20">
              <p className="font-semibold text-ocean-100">{t.genogramLegend.relationshipQuality}</p>
              <p className="text-ocean-400">{t.genogramLegend.relationshipQualityDesc}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h4 className="text-ocean-200 font-semibold">{t.genogramLegend.visualLineStyles}</h4>
            <div className="flex items-center gap-4">
              <div className="w-24 h-1 bg-gray-500"></div>
              <div>
                <p className="font-semibold text-ocean-100">{t.genogramLegend.solid}</p>
                <p className="text-sm text-ocean-400">{t.genogramLegend.solidDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-1 border-t-2 border-dashed border-gray-500"></div>
              <div>
                <p className="font-semibold text-ocean-100">{t.genogramLegend.dashed}</p>
                <p className="text-sm text-ocean-400">{t.genogramLegend.dashedDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-1 border-t-4 border-blue-400"></div>
              <div>
                <p className="font-semibold text-ocean-100">{t.genogramLegend.thick}</p>
                <p className="text-sm text-ocean-400">{t.genogramLegend.thickDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-1 border-t-2 border-dotted border-gray-400"></div>
              <div>
                <p className="font-semibold text-ocean-100">{t.genogramLegend.dotted}</p>
                <p className="text-sm text-ocean-400">{t.genogramLegend.dottedDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <svg width="96" height="8" viewBox="0 0 96 8" className="flex-shrink-0">
                <path d="M0 4 Q8 0, 16 4 T32 4 T48 4 T64 4 T80 4 T96 4" stroke="#ef4444" strokeWidth="2" fill="none" />
              </svg>
              <div>
                <p className="font-semibold text-ocean-100">{t.genogramLegend.jagged}</p>
                <p className="text-sm text-ocean-400">{t.genogramLegend.jaggedDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-6 h-1 bg-gray-500"></div>
                <div className="w-6 h-1 bg-gray-500"></div>
              </div>
              <div>
                <p className="font-semibold text-ocean-100">{t.genogramLegend.horizontalSiblings}</p>
                <p className="text-sm text-ocean-400">{t.genogramLegend.horizontalSiblingsDesc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Points */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-ocean-200 mb-4">{t.genogramLegend.connectionPoints}</h3>
          <div className="bg-deep p-4 rounded border border-ocean-800">
            <p className="text-ocean-300 mb-3">{t.genogramLegend.connectionPointsDesc}</p>
            <ul className="space-y-2 text-sm text-ocean-400">
              <li><span className="font-semibold text-ocean-300">{t.genogramLegend.top}</span> - {t.genogramLegend.topDesc}</li>
              <li><span className="font-semibold text-ocean-300">{t.genogramLegend.bottom}</span> - {t.genogramLegend.bottomDesc}</li>
              <li><span className="font-semibold text-ocean-300">{t.genogramLegend.leftRight}</span> - {t.genogramLegend.leftRightDesc}</li>
            </ul>
          </div>
        </div>

        {/* Special Features */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-ocean-200 mb-4">{t.genogramLegend.specialFeatures}</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-yellow-400 mt-1 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-ocean-100">{t.genogramLegend.principal}</p>
                <p className="text-sm text-ocean-400">{t.genogramLegend.principalDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-red-500 text-lg">X</div>
              <div>
                <p className="font-semibold text-ocean-100">{t.genogramLegend.deceasedStatus}</p>
                <p className="text-sm text-ocean-400">{t.genogramLegend.deceasedStatusDesc}</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-ocean-600 hover:bg-ocean-500 text-white py-2 rounded font-semibold transition-colors"
        >
          {t.genogramLegend.close}
        </button>
      </div>
    </div>
  );
};

