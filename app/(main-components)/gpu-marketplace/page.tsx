'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterMenu } from '@/components/FilterMenu';
import { AddToCartButton } from '@/app/(secondary-components)/cart/AddToCartButton';
import { Star, Shield, Search } from 'lucide-react';
import Image from 'next/image';

const filterOptions = [
  { name: "Sort by", filters: ["Newest", "Price: Low to High", "Price: High to Low"] },
  { name: "5★ & above", filters: [] },
  { name: "Neurolov Assured", filters: [] },
  { name: "GPU Unavailable?", filters: [] }
];

const gpus = [
  {
    id: '1',
    name: 'NVIDIA GEFORCE RTX 3090',
    image: '/gpu-images/RTX-3090.png',
    available: true,
    backgroundText: 'RTX 3090',
    price: 10
  },
  {
    id: '2',
    name: 'NVIDIA GEFORCE RTX 4090',
    image: '/gpu-images/RTX-4090.png',
    available: true,
    backgroundText: 'RTX 4090',
    price: 15
  },
  {
    id: '3',
    name: 'NVIDIA GEFORCE GT710',
    image: '/gpu-images/gt710.png',
    available: true,
    backgroundText: 'GT 710',
    price: 5
  },
  {
    id: '4',
    name: 'NVIDIA GEFORCE RTX 3090 TI',
    image: '/gpu-images/RTX-3090-ti.png',
    available: true,
    backgroundText: 'RTX 3090 TI',
    price: 12
  },
  {
    id: '5',
    name: 'NVIDIA A5000',
    image: '/gpu-images/A-5000.png',
    available: true,
    backgroundText: 'A5000',
    price: 20
  },
  {
    id: '6',
    name: 'NVIDIA A40',
    image: '/gpu-images/Nvidia-A40.png',
    available: true,
    backgroundText: 'A40',
    price: 25
  }
];

export default function GpuMarketplacePage() {
  return (
    <div className="flex flex-1 w-full min-h-screen flex-col bg-[#111111]">
      {/* Top Filter Bar */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-800">
        {filterOptions.map((option, index) => (
          <div key={index} className="flex items-center">
            {index === 0 ? (
              <FilterMenu name={option.name} filters={option.filters} />
            ) : index === 1 ? (
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#222]">
                <Star size={16} className="text-yellow-500" />
                <span className="text-white">5★ & above</span>
              </button>
            ) : index === 2 ? (
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#222]">
                <Shield size={16} className="text-blue-500" />
                <span className="text-white">Neurolov Assured</span>
              </button>
            ) : (
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#222]">
                <Search size={16} className="text-gray-400" />
                <span className="text-white">GPU Unavailable?</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* GPU Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        <AnimatePresence>
          {gpus.map((gpu) => (
            <motion.div
              key={gpu.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative bg-[#1A1A1A] rounded-xl overflow-hidden aspect-square"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[120px] font-bold text-[#222] opacity-50">
                  {gpu.backgroundText}
                </span>
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <motion.div 
                  className="flex-1 flex items-center justify-center p-8"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Image
                    src={gpu.image}
                    alt={gpu.name}
                    width={300}
                    height={200}
                    className="object-contain"
                  />
                </motion.div>
                <div className="p-4 bg-[#111] border-t border-gray-800">
                  <h3 className="text-lg font-medium text-white mb-4">{gpu.name}</h3>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium text-blue-400">${gpu.price}/hr</span>
                  </div>
                  <AddToCartButton 
                    item={{
                      id: gpu.id,
                      name: gpu.name,
                      price: gpu.price,
                      type: 'gpu'
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}