import { useState } from 'react';
import { MapPin, Star, Shuffle, Navigation } from 'lucide-react';

export default function App() {
  const [distance, setDistance] = useState(10);
  const [rating, setRating] = useState('any');
  const [excludeCuisines, setExcludeCuisines] = useState('none');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF7E47] via-[#FF9A56] to-[#FFB347] p-4 pb-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center py-8 text-white">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Shuffle className="w-6 h-6 text-[#FF7E47]" />
            </div>
            <h1 className="text-4xl">Shuffood</h1>
          </div>
          <p className="text-white/90">Can't decide? Shuffle!</p>
        </div>

        {/* Location */}
        <div className="flex items-center justify-center gap-2 mb-6 text-white">
          <Navigation className="w-4 h-4 text-[#FF5722]" />
          <span>San Jose</span>
        </div>

        {/* Filters Card */}
        <div className="bg-[#FFF8F0] rounded-2xl shadow-lg p-6 mb-6">
          {/* Distance */}
          <div className="mb-6">
            <label className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎯</span>
              <span className="text-gray-800">Distance: {distance} miles</span>
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full h-2 bg-[#FFE4D6] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF7E47] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF7E47] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>

          {/* Min Rating */}
          <div className="mb-6">
            <label className="flex items-center gap-2 mb-3">
              <span className="text-xl">⭐</span>
              <span className="text-gray-800">Min Rating: Any</span>
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#FFE4D6] rounded-lg appearance-none cursor-pointer text-gray-700"
            >
              <option value="any">All ratings</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </div>

          {/* Don't show */}
          <div>
            <label className="flex items-center gap-2 mb-3">
              <span className="text-xl">🚫</span>
              <span className="text-gray-800">Don't show: None</span>
            </label>
            <select
              value={excludeCuisines}
              onChange={(e) => setExcludeCuisines(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#FFE4D6] rounded-lg appearance-none cursor-pointer text-gray-700"
            >
              <option value="none">Select cuisines to exclude</option>
              <option value="mexican">Mexican</option>
              <option value="italian">Italian</option>
              <option value="chinese">Chinese</option>
            </select>
          </div>
        </div>

        {/* Shuffle Button */}
        <button className="w-full bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all mb-6 flex items-center justify-center gap-2">
          <Shuffle className="w-5 h-5" />
          <span>Find & Shuffle</span>
        </button>

        {/* Featured Result */}
        <div className="bg-[#FFF8F0] rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl text-gray-900 mb-2">La Costenita ( Food Truck)</h2>
          <p className="text-gray-600 italic mb-3">food</p>
          <p className="text-gray-700 mb-4">398-346 Royal Ave, San Jose, CA 95126, USA</p>
          <div className="flex items-center justify-between pt-4 border-t border-[#FFE4D6]">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-[#FF9A56] text-[#FF9A56]" />
              <span className="text-gray-900">4.8</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-[#FF5722]" />
              <span>0.3 mi</span>
            </div>
          </div>
        </div>

        {/* Available Restaurants */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
            <span className="text-xl">📋</span>
            <span>Available Restaurants</span>
          </div>
        </div>

        {/* Restaurant List */}
        <div className="bg-[#FFF8F0] rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF7E47] to-[#FF9A56] rounded-full flex items-center justify-center text-white">
                1
              </div>
              <div>
                <h3 className="text-gray-900">México Bakery (food truck)</h3>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#FF7E47]">0.1 mi</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#FF9A56] text-[#FF9A56]" />
                <span className="text-gray-700">3.7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
