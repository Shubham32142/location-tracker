import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  house: String,
  apartment: String,
  category: {
    type: String,
    enum: ["Home", "Office", "Friends & Family"],
    default: "Home",
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  favorite: { type: Boolean, default: false },
});

export const Address = mongoose.model("Address", AddressSchema);
