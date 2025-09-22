"use client";

import React from "react";

export default function TailwindTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="py-6 mb-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 animate-pulse">
            Tailwind CSS Test Page
          </h1>
          <p className="mt-4 text-lg text-blue-200">
            Demonstrating vibrant styling and responsive layouts
          </p>
        </header>

        <main className="space-y-12">
          {/* Color Palette Section */}
          <section className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-yellow-300">Color Palette</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Red", color: "bg-red-500" },
                { name: "Blue", color: "bg-blue-500" },
                { name: "Green", color: "bg-green-500" },
                { name: "Yellow", color: "bg-yellow-500" },
                { name: "Purple", color: "bg-purple-500" },
                { name: "Pink", color: "bg-pink-500" },
                { name: "Indigo", color: "bg-indigo-500" },
                { name: "Teal", color: "bg-teal-500" },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full ${item.color} shadow-lg mb-2 transform hover:scale-110 transition-transform duration-300`}></div>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Typography Section */}
          <section className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-yellow-300">Typography</h2>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">Heading 1</h1>
              <h2 className="text-3xl font-semibold">Heading 2</h2>
              <h3 className="text-2xl font-medium">Heading 3</h3>
              <p className="text-lg">
                This is a paragraph with <span className="font-bold text-purple-400">bold text</span> and{" "}
                <span className="italic text-pink-400">italic text</span>. Tailwind CSS makes it easy to style text with utility classes.
              </p>
            </div>
          </section>

          {/* Buttons Section */}
          <section className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-yellow-300">Interactive Elements</h2>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-bold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
                Gradient Button
              </button>
              <button className="px-6 py-3 bg-pink-500 rounded-full font-bold hover:bg-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg">
                Solid Button
              </button>
              <button className="px-6 py-3 border-2 border-yellow-400 text-yellow-400 rounded-full font-bold hover:bg-yellow-400 hover:text-gray-900 transform hover:scale-105 transition-all duration-300">
                Outline Button
              </button>
            </div>
          </section>

          {/* Cards Section */}
          <section className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-yellow-300">Responsive Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div 
                  key={item} 
                  className="bg-gradient-to-br from-indigo-800/50 to-purple-800/50 rounded-xl p-6 transform hover:scale-105 transition-all duration-300 shadow-xl border border-white/10"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg mb-4"></div>
                  <h3 className="text-xl font-bold mb-2">Card {item}</h3>
                  <p className="text-blue-200 mb-4">
                    This card demonstrates responsive design and hover effects.
                  </p>
                  <button className="text-sm font-semibold text-yellow-300 hover:text-yellow-200">
                    Learn More →
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Animation Section */}
          <section className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-yellow-300">Animations</h2>
            <div className="flex flex-wrap gap-8 justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-bounce"></div>
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin"></div>
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full animate-pulse"></div>
              <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full animate-ping"></div>
            </div>
          </section>
        </main>

        <footer className="mt-12 py-6 text-center text-blue-200 border-t border-white/10">
          <p>All dependencies are working correctly!</p>
        </footer>
      </div>
    </div>
  );
}