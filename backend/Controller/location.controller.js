import { Address } from "../Model/location.model.js";
export async function postAddress(req, res) {
  try {
    const newAddress = await Address(req.body);
    await newAddress.save();
    res.status(201).json({ newAddress });
  } catch (error) {
    res.status(500).json({ error: "Failed to add address" });
  }
}

export async function getAddress(req, res) {
  try {
    const getAdresses = await Address.find();
    res.status(200).json({ message: "All adresses", getAdresses });
  } catch (error) {
    res.status(500).json({ error: "Can't get address" });
  }
}

export async function updateAdress(req, res) {
  try {
    const { id } = req.params;
    const updateAddress = await Address.findByIdAndUpdate(id, req.body);
    res.status(200).json({ message: "updated address", updateAddress });
  } catch (error) {
    res.status(500).json({ error: "failed to update address" });
  }
}

export async function deleteAdress(req, res) {
  try {
    const { id } = req.params;
    const deleteAddress = await Address.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "Address deleted successfully", deleteAddress });
  } catch (error) {
    res.status(500).json({ message: "failed to delete address" });
  }
}
