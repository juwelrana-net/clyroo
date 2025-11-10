// server/utils/delivery.js

const mongoose = require("mongoose");
const Credential = require("../models/Credential");
const Order = require("../models/Order");
const sendEmail = require("./sendEmail");

// Function ko poori tarah se update kar diya gaya hai
const deliverProduct = async (order) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Step 1: Order quantity ke barabar unsold credentials dhundhein
    const credentialsToDeliver = await Credential.find({
      product: order.product._id,
      isSold: false,
    })
      .limit(order.quantity) // Order quantity ke barabar limit karein
      .session(session);

    // Step 2: Check karein ki stock poora hai ya nahi
    if (credentialsToDeliver.length < order.quantity) {
      throw new Error(
        `Out of stock for Order ${order._id}. Needed ${order.quantity}, found ${credentialsToDeliver.length}`
      );
    }

    // Step 3: Saare credentials ko "Sold" mark karein aur unki IDs collect karein
    const credentialIds = [];
    let formattedDataString = ""; // Email ke liye text
    let formattedHtmlString = ""; // Email ke liye HTML

    for (let i = 0; i < credentialsToDeliver.length; i++) {
      const credential = credentialsToDeliver[i];
      credential.isSold = true;
      await credential.save({ session });
      credentialIds.push(credential._id);

      // Email ke liye content taiyaar karein
      formattedHtmlString += `<div style="font-family: monospace; background-color: #f4f4f4; padding: 10px; border-radius: 5px; margin-bottom: 10px;">`;
      formattedHtmlString += `<p><b>Item #${i + 1}</b></p>`;

      for (const [key, value] of credential.credentialData.entries()) {
        formattedDataString += `Item ${i + 1} - ${key}: ${value}\n`;
        formattedHtmlString += `<p><b>${key}:</b> ${value}</p>`;
      }

      formattedHtmlString += `</div>`;
    }

    // Step 4: Order ko "Completed" mark karein aur credentials ki IDs save karein
    order.status = "Completed";
    order.deliveredCredentials = credentialIds; // Yeh naya array save karein
    await order.save({ session });

    // Step 5: Transaction ko commit karein (confirm)
    await session.commitTransaction();
    session.endSession();

    // Step 6: Customer ko email bhej dein (saare credentials ke saath)
    const emailSubject = `Your Order from Clyroo is Complete! (Order: ${order._id})`;

    // --- YEH EMAIL BODY UPDATE HUA HAI ---
    const emailHtml = `<h1>Thank you!</h1>
                       <p>Product: <b>${order.product.name}</b></p>
                       <p>Quantity: <b>${order.quantity}</b></p>
                       <hr>
                       <p>Your credentials are below:</p>
                       ${formattedHtmlString}
                       <hr>
                       <div style="background-color: #fef9c3; border: 1px solid #fde047; padding: 15px; border-radius: 8px;">
                         <h3 style="color: #ca8a04; margin-top: 0;">Important: Save these details!</h3>
                         <p style="color: #713f12;">You will need both your Order ID and Access Token to inquire about your order in the future.</p>
                         <p style="color: #713f12;"><b>Order ID:</b> ${order._id}</p>
                         <p style="color: #713f12;"><b>Access Token:</b> ${order.customerAccessToken}</p>
                       </div>`;
    // --- EMAIL BODY KHATAM ---

    sendEmail(order.customerEmail, emailSubject, emailHtml);

    // Ab kuchh return karne ki zaroorat nahi hai
    return;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("deliverProduct Error:", error.message);
    throw error; // Error ko aage pass karein taaki admin/webhook ko pata chale
  }
};

module.exports = { deliverProduct };
