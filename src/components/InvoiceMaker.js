import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function InvoiceMaker() {
    const [medicines, setMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMedicines, setSelectedMedicines] = useState([]);
    const medicinesCollectionRef = collection(db, "medicine_inventory");

    useEffect(() => {
        const getMedicines = async () => {
            const data = await getDocs(medicinesCollectionRef);
            setMedicines(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        };

        getMedicines();
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const handleSelectMedicine = (medicine) => {
        setSelectedMedicines((prevSelected) => {
            if (prevSelected.some((m) => m.id === medicine.id)) {
                return prevSelected.filter((m) => m.id !== medicine.id);
            } else {
                return [...prevSelected, { ...medicine, quantity: 1 }];
            }
        });
    };

    const handleQuantityChange = (id, quantity) => {
        setSelectedMedicines((prevSelected) =>
            prevSelected.map((medicine) =>
                medicine.id === id ? { ...medicine, quantity: parseInt(quantity) || 1 } : medicine
            )
        );
    };

    const calculateTotal = () => {
        return selectedMedicines.reduce(
            (total, medicine) => total + medicine.price * medicine.quantity,
            0
        );
    };

    // Filter medicines based on the search term
    const filteredMedicines = medicines.filter((medicine) =>
        medicine.name.toLowerCase().includes(searchTerm)
    );

    return (
        <div>
            <h2>Invoice Maker</h2>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Type to search for a medicine..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            {/* Show table only if there is a search term */}
            {searchTerm && (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>Name</th>
                            <th>Available Stock</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMedicines.map((medicine) => (
                            <tr key={medicine.id}>
                                <td>
                                    <button
                                        onClick={() => handleSelectMedicine(medicine)}
                                        disabled={selectedMedicines.some((m) => m.id === medicine.id)}
                                    >
                                        {selectedMedicines.some((m) => m.id === medicine.id)
                                            ? "Added"
                                            : "Add"}
                                    </button>
                                </td>
                                <td>{medicine.name}</td>
                                <td>{medicine.stock}</td>
                                <td>{medicine.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <h3>Selected Medicines</h3>
            <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedMedicines.map((medicine) => (
                        <tr key={medicine.id}>
                            <td>{medicine.name}</td>
                            <td>
                                <input
                                    type="number"
                                    value={medicine.quantity}
                                    min="1"
                                    max={medicine.stock}
                                    onChange={(e) =>
                                        handleQuantityChange(medicine.id, e.target.value)
                                    }
                                />
                            </td>
                            <td>{medicine.price}</td>
                            <td>{medicine.price * medicine.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h3>Total Amount: {calculateTotal()}</h3>
        </div>
    );
}
