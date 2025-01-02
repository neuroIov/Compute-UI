"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Loader, Moon, Sun, ShoppingCart, Bell } from 'lucide-react'; 
import logoNight from "@/public/logo-night.svg";
import logo from "../public/logo.svg";
import search from "../public/search.svg";
import bell from "../public/bell.svg";
import Signed from "./auth/signed-in";
import { useEffect, useState } from "react";
import { useCart } from '@/app/context/CartContext';

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [ load, setLoad ] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const { state } = useCart();

  const totalItems = (state.gpu ? 1 : 0) + (state.aiModel ? 1 : 0);
  const totalPrice = (state.gpu?.price || 0) + (state.aiModel?.price || 0);

  useEffect(()=> {
    setLoad(true);
  })

  if(!load) return <Loader></Loader>;

  const handleThemeChange = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <div
        className= {`${
          theme === "dark"
          ? "bg-gray-950 text-gray-300"
          : "bg-white text-gray-950 border-b border-gray-300"
        } flex w-full items-center px-10 py-2 text-lg h-[13vh]`}
      >
        <div className="flex flex-row justify-between w-full items-center">
          <div id="logo" className="flex flex-wrap justify-center mr-10 items-center">
            <Link href="/">
            {
              theme === "dark"
              ? <Image src={logo} alt="logo" />
              : <Image src={logoNight} alt="logo" className="w-56"/>
            }
            </Link>
          </div>

          <div
            className={`w-[60%] flex flex-row items-center ${
              theme === "dark"
              ? "bg-black text-gray-300"
              : "bg-gray-200 text-gray-900"
            } rounded-full ml-4 mr-8 px-4 py-2`}
          >
            <Image src={search} alt="search" height={6} width={6} className="w-6" />
            <input
              type="text"
              className={`w-full focus:border-none focus:outline-none mx-4 ${
                theme === "dark" ? 
                 "bg-black" :
                 "bg-gray-200"
              }`}
              placeholder="Search for something" 
            />
          </div>

          <div className="flex justify-between flex-row items-center mr-8">
            <div className="flex flex-row items-center justify-start relative">
              <div
                className={`flex rounded-full p-3 ${
                  theme === "dark" ? 
                   "bg-white" :
                  "bg-gray-200"
                } mr-8`}
              >
                <Image
                  src={bell}
                  alt="bell"
                  className={`h-13 hover:cursor-pointer ${theme === '' ? 
                    "text-gray-900" : "text-gray-950"}`}
                />
              </div>

              <Signed/>

              <div className="relative">
                <button 
                  onClick={() => setShowCart(!showCart)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#222] text-white"
                >
                  <ShoppingCart size={20} />
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-400">{totalItems} items</span>
                    <span className="font-medium">${totalPrice}/hr</span>
                  </div>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-xs rounded-full">
                      {totalItems}
                    </span>
                  )}
                </button>

                {/* Cart Dropdown */}
                {showCart && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#1A1A1A] rounded-lg shadow-lg p-4 z-50">
                    <h3 className="text-lg font-semibold text-white mb-3">Your Cart</h3>
                    <div className="space-y-3">
                      {state.gpu ? (
                        <div className="flex justify-between items-center text-white">
                          <div>
                            <h4 className="font-medium">{state.gpu.name}</h4>
                            <p className="text-sm text-gray-400">GPU Rental</p>
                          </div>
                          <span>${state.gpu.price}/hr</span>
                        </div>
                      ) : (
                        <p className="text-gray-400">No GPU selected</p>
                      )}
                      <div className="border-t border-gray-700 my-2" />
                      {state.aiModel ? (
                        <div className="flex justify-between items-center text-white">
                          <div>
                            <h4 className="font-medium">{state.aiModel.name}</h4>
                            <p className="text-sm text-gray-400">AI Model</p>
                          </div>
                          <span>${state.aiModel.price}/hr</span>
                        </div>
                      ) : (
                        <p className="text-gray-400">No AI Model selected</p>
                      )}

                      {(state.gpu || state.aiModel) && (
                        <>
                          <div className="border-t border-gray-700 my-2" />
                          <div className="flex justify-between items-center text-white">
                            <span className="font-medium">Total</span>
                            <span className="font-medium">${totalPrice}/hr</span>
                          </div>
                          <button 
                            onClick={() => {
                              if (state.gpu && state.aiModel) {
                                // Add compatibility check logic here
                                const isCompatible = true; // Replace with actual check
                                if (isCompatible) {
                                  alert('Compatible! Proceeding to checkout...');
                                } else {
                                  alert('Selected GPU and AI Model are not compatible');
                                }
                              } else {
                                alert('Please select both a GPU and an AI Model');
                              }
                            }}
                            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Check Compatibility
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button 
              className="flex border-none rounded p-2 bg-transparent absolute right-2" 
              onClick={() => {
                // localStorage.setItem('theme', theme || "dark")
                console.log("current theme is", theme)
                setTheme(theme === "dark" ? 'light' : "dark")
                
              }
              }
            >
              {theme === "dark" ? (
                <Sun className="w-6 h-6 rotate-0 scale-100 transition-all duration-150" />
              ) : (
                <Moon className="w-6 h-6 hover:border-slate-100 rotate-0 scale-100 transition-all duration-150" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* <LoginModal /> */}
    </>

  );
};

export default Header;