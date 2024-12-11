/* eslint-disable react/prop-types */
import { useState } from "react";

export function LocationPermission({ onEnableLocation, onSearchManually }) {
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location obtained:", position.coords);
          onEnableLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error obtaining location:", error);
          setIsPermissionDenied(true);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser");
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg max-w-md mx-auto mt-8">
      {isPermissionDenied ? (
        <p className="text-red-500">
          Location permission denied. Please enable location permission in your
          browser settings.
        </p>
      ) : (
        <p>Allow location access to automatically select your address.</p>
      )}
      <div className="flex justify-center space-x-4 mt-4">
        <button
          onClick={requestLocation}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Enable Location
        </button>
        <button
          onClick={onSearchManually}
          className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
        >
          Search Manually
        </button>
      </div>
    </div>
  );
}
