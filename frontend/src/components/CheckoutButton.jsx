import React, { useState } from 'react';

const CheckoutButton = ({ userId, showId, seats, totalPrice, movieTitle, userDetails }) => {
  const [loading, setLoading] = useState(false);

  const displayRazorpayModal = async () => {
    setLoading(true);

    try {
      // 1. Create Order on Backend
      const orderResponse = await fetch("https://imovies-backend-9iio.onrender.com/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        alert("Failed to initiate payment.");
        setLoading(false);
        return;
      }

      // 2. Configure Razorpay Options
      const options = {
        key: "rzp_test_TpJqcyjlrycB4Q", // Replace with your key ID
        amount: orderData.amount,
        currency: orderData.currency,
        name: "iMovies Booking",
        description: `Booking for ${movieTitle}`,
        order_id: orderData.order_id,
        handler: async function (response) {
          // 3. Send Payment Credentials + Booking Data to Backend
          try {
            const verifyResponse = await fetch("https://imovies-backend-9iio.onrender.com/api/payment/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: userId,           // Passed from parent component
                showId: showId,           // Passed from parent component
                seats: seats,             // Passed from parent component (e.g., ["A1", "A2"])
                totalPrice: totalPrice,   // Passed from parent component
                userEmail: userDetails?.email,
                userPhone: userDetails?.phone,
                movieTitle: movieTitle,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              alert("Booking & Payment Successful! Check your email and WhatsApp for confirmation.");
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification Error:", err);
          }
        },
        prefill: {
          name: userDetails?.name || "Sumana",
          email: userDetails?.email || "",
          contact: userDetails?.phone || "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Initialization Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={displayRazorpayModal} 
      disabled={loading}
      style={{ padding: "12px 24px", backgroundColor: "#3399cc", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px" }}
    >
      {loading ? "Processing..." : `Pay ₹${totalPrice} & Confirm Seats`}
    </button>
  );
};

export default CheckoutButton;