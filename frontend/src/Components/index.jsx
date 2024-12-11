import { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import axios from "axios";
import { LocationPermission } from "./LocationPermission";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = { lat: 37.7749, lng: -122.4194 }; // Default coordinates (San Francisco)

export function Index() {
  const [selectedPosition, setSelectedPosition] = useState(center);
  const [address, setAddress] = useState([]);
  const [isLocationEnabled, setLocationEnabled] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false); // For showing the form
  const [formData, setFormData] = useState({
    house: "",
    apartment: "",
    category: "Home",
    favorite: false,
  });

  const mapRef = useRef(null); // Reference to the map instance
  const markerRef = useRef(null); // Reference to the marker instance

  useEffect(() => {
    fetchAddresses(); // Fetch addresses when the component mounts
  }, []);

  const enableLocation = (lat, lng) => {
    setSelectedPosition({ lat, lng });
    setLocationEnabled(true);
  };

  const handleAddressSearch = async () => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          manualAddress
        )}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === "OK") {
        const location = data.results[0].geometry.location;
        setSelectedPosition(location);
        setLocationEnabled(true);
        setShowManualInput(false); // Hide input field after search
      } else {
        alert("Address not found. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching geocoding data:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/get");
      setAddress(response.data.getAdresses || []);
    } catch (err) {
      console.error("Error fetching addresses", err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const addressData = {
      userId: "user123", // Placeholder for user ID
      house: formData.house,
      apartment: formData.apartment,
      category: formData.category,
      coordinates: selectedPosition,
      favorite: formData.favorite,
    };
    try {
      if (formData._id) {
        // Update the existing address
        await axios.put(
          `http://localhost:5000/update/${formData._id}`,
          addressData
        );
      } else {
        // Save the new address
        await axios.post("http://localhost:5000/add", addressData);
      }
      fetchAddresses(); // Fetch updated addresses after saving/updating
      setIsFormVisible(false); // Hide the form
    } catch (error) {
      console.error("Error saving/updating address", error);
    }
  };

  const handleUpdate = (addressItem) => {
    setFormData({
      _id: addressItem._id,
      house: addressItem.house,
      apartment: addressItem.apartment,
      category: addressItem.category,
      favorite: addressItem.favorite,
    });
    setIsFormVisible(true); // Show the form to update
  };

  const handleRemove = async (addressItemId) => {
    try {
      await axios.delete(`http://localhost:5000/remove/${addressItemId}`);
      fetchAddresses(); // Fetch updated addresses after deletion
    } catch (error) {
      console.error("Error removing address", error);
    }
  };

  const handleFavoriteToggle = async (addressItemId, currentFavorite) => {
    try {
      await axios.put(`http://localhost:5000/update/${addressItemId}`, {
        favorite: !currentFavorite,
      });
      fetchAddresses(); // Fetch updated addresses after toggling favorite
    } catch (error) {
      console.error("Error toggling favorite", error);
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedPosition({ lat: latitude, lng: longitude });
          setLocationEnabled(true);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Unable to retrieve your location. Please try again.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    // Remove the previous marker if it exists
    if (markerRef.current) {
      markerRef.current.setMap(null); // Remove the previous marker
    }

    // Update the position and add the new marker
    setSelectedPosition({ lat, lng });

    // Add new marker at the clicked location
    if (mapRef.current) {
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapRef.current,
      });
      markerRef.current = marker; // Save the new marker reference
    }
  };

  return (
    <>
      <div className="bg-gray-100 p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
        {!isLocationEnabled && (
          <LocationPermission
            onEnableLocation={enableLocation}
            onSearchManually={() => setShowManualInput(true)}
          />
        )}
        {showManualInput && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter address"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              className="w-full p-2 mb-2 border rounded"
            />
            <button
              onClick={handleAddressSearch}
              className="bg-blue-500 text-white p-2 rounded mr-2"
            >
              Search
            </button>
            <button
              onClick={() => setShowManualInput(false)}
              className="bg-gray-500 text-white p-2 rounded"
            >
              Cancel
            </button>
          </div>
        )}
        {isLocationEnabled && (
          <>
            <h1 className="text-2xl font-semibold mb-4">Location / Address</h1>
            <LoadScript
              googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            >
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={selectedPosition}
                zoom={10}
                onClick={handleMapClick} // Handle click to update marker position
                onLoad={(map) => {
                  mapRef.current = map;
                  console.log("Google Map loaded successfully");

                  // Check if Google Maps is loaded
                  if (window.google && window.google.maps) {
                    const marker = new google.maps.Marker({
                      position: selectedPosition,
                      map: map,
                    });

                    markerRef.current = marker; // Store the marker reference
                  } else {
                    console.log("Google Maps not loaded properly");
                  }
                }}
              >
                {/* Force re-render of the Marker by updating the key */}
                <Marker
                  key={`${selectedPosition.lat}-${selectedPosition.lng}`} // Key based on position
                  position={selectedPosition} // Position based on state
                  label="X"
                />
              </GoogleMap>
            </LoadScript>

            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={() => setIsFormVisible(true)}
                className="bg-blue-500 text-white p-2 rounded"
              >
                Save Address
              </button>
              <button
                onClick={handleLocateMe}
                className="bg-green-500 text-white p-2 rounded"
              >
                Locate Me
              </button>
            </div>

            {isFormVisible && (
              <form onSubmit={handleFormSubmit} className="mt-6">
                <div className="mb-4">
                  <label className="block text-sm font-semibold">House:</label>
                  <input
                    type="text"
                    value={formData.house}
                    onChange={(e) =>
                      setFormData({ ...formData, house: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold">
                    Apartment:
                  </label>
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={(e) =>
                      setFormData({ ...formData, apartment: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold">
                    Category:
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Friends & Family">Friends & Family</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold">
                    Favorite:
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.favorite}
                    onChange={(e) =>
                      setFormData({ ...formData, favorite: e.target.checked })
                    }
                    className="mr-2"
                  />
                </div>

                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded"
                  >
                    {formData._id ? "Update" : "Save"} Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormVisible(false)}
                    className="bg-gray-500 text-white p-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <h2 className="mt-6 text-xl font-semibold">Saved Addresses</h2>
            <ul className="list-disc pl-6">
              {address.length > 0 ? (
                address.map((addressItem) => (
                  <li key={addressItem._id}>
                    {addressItem.house}, {addressItem.apartment},{" "}
                    {addressItem.category}
                    <button
                      onClick={() => handleUpdate(addressItem)}
                      className="bg-yellow-500 text-white p-2 rounded ml-2 my-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemove(addressItem._id)}
                      className="bg-red-500 text-white p-2 rounded ml-2"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() =>
                        handleFavoriteToggle(
                          addressItem._id,
                          addressItem.favorite
                        )
                      }
                      className="bg-indigo-500 text-white p-2 rounded ml-2"
                    >
                      {addressItem.favorite ? "Unfavorite" : "Favorite"}
                    </button>
                  </li>
                ))
              ) : (
                <p>No addresses available.</p>
              )}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
