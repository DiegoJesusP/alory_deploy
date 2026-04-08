import { Sparkles } from 'lucide-react';

export function AuthBrandMark() {
  return (
    <div className="flex items-center gap-2.5 mb-10">
      <div className="w-8 h-8 rounded-full border border-[#C8B273]/40 flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-[#C8B273]" />
      </div>
      <span className="text-lg font-bold text-[#1C1917]">
        Alory <span className="font-light text-[#78716C]">Cosmetology</span>
      </span>
    </div>
  );
}
