import React from "react";
import { useState, useEffect } from "react";
import AdminHeader from "./layouts/AdminHeader";
import AdminSideBar from "./layouts/AdminSideBar";
import AdminFooter from "./layouts/AdminFooter";
import { db } from "../firebase";
import { collection, getDocs} from "firebase/firestore";
import InvoiceMaker from "./InvoiceMaker";

function calculateRemainingDays(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const timeDiff = expiry - today;
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
}

export default function Dashboard(props) {
  const [medicines, setMedicines] = useState([]);
  const medicinesCollectionRef = collection(db, "medicine_inventory");

  useEffect(() => {
    const getTypes = async () => {
      const data = await getDocs(medicinesCollectionRef);
      setMedicines(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    getTypes();
  }, [medicinesCollectionRef]);

  const getLowStockOrExpiringMedicines = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return medicines.filter((medicine) => {
      const expiryDate = new Date(medicine.expiry);
      const isExpiringSoon = expiryDate < nextWeek;
      const isLowStock = medicine.stock < 10;
      return isExpiringSoon || isLowStock;
    });
  };

  const lowStockOrExpiringMedicines = getLowStockOrExpiringMedicines();

  return (
    <>
      <AdminHeader />
      <AdminSideBar />
      <div className="main-panel">
        <div className="content">
          <div className="container-fluid">
            <h4 className="page-title">Dashboard</h4>
            <div className="row">
              <div className="col-md-12">
                <div className="card border border-danger">
                  <div className="card-header">
                    <h4 className="card-title">Notifications</h4>
                  </div>
                  <div className="card-body">
                    <ul className="list-group">
                      {lowStockOrExpiringMedicines.map((medicine) => {
                        const remainingDays = calculateRemainingDays(medicine.expiry);
                        let expiryMessage = `Expiring in ${remainingDays} days`;
                        if (remainingDays === 0) {
                          expiryMessage = "Expired today";
                        } else if (remainingDays < 0) {
                          expiryMessage = `Expired ${Math.abs(remainingDays)} day(s) ago`;
                        }
                        return (
                          <li key={medicine.id} className="list-group-item text-danger fw-bold">
                            {medicine.name} - 
                            {medicine.stock < 10 ? `Low Stock (${medicine.stock} left)` : expiryMessage}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
           <div>
              <InvoiceMaker />
            </div>

          </div>
        </div>

        <AdminFooter />
      </div>
    </>
  );
}
