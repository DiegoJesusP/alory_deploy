import { Star } from 'lucide-react';
import type { ServiceCardItem } from '@/types/service.types';

interface Props {
  service: ServiceCardItem;
}

export default function ServiceCard({ service }: Props) {
  return (
    <article className="overflow-hidden group hover:shadow-xl transition rounded-xl bg-white border border-neutral-200">
      <div className="h-56">
        <img
          src={service.imageUrl}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-110 transition"
        />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{service.title}</h3>
        <p className="text-gray-600 mb-4">{service.description}</p>

        <div className="flex justify-between items-center">
          <span className="text-[#C8B273] font-bold">
            {service.price}
          </span>

          <button className="inline-flex items-center text-sm bg-yellow-600 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-700 transition">
            <Star className="w-4 h-4 mr-1" />
            Reservar
          </button>
        </div>
      </div>
    </article>
  );
}
