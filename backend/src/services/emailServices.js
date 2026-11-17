// backend/src/services/emailServices.js

const nodemailer = require("nodemailer");

// ============================================================
// TRANSPORTER
// ============================================================
const transporter = nodemailer.createTransport({
    
    //port: 587,
    //secure: false, // true for 465, false for other ports
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ============================================================
// 🎨 MASTER EMAIL TEMPLATE (Consistent Branding)
// ============================================================
const wrapEmailHTML = (title, bodyContent) => {
    return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        
        <div style="background-color: #2563EB; padding: 25px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">Satya's Fashion Book</h1>
            <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">${title}</p>
        </div>

        <div style="padding: 30px 20px; color: #333; line-height: 1.6;">
            ${bodyContent}
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0 0 5px;">&copy; ${new Date().getFullYear()} Satya's Fashion Book. All rights reserved.</p>
            <p style="margin: 0;">Need help? Reply to this email or contact support.</p>
        </div>
    </div>
    `;
};

// Helper to send email

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Satya's Fashion Book" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log(`📩 Email sent to ${to}`);
        console.log("Message ID:", info.messageId);

        return info;

    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error);

        throw error; // Important: propagate error to controller
    }
};


// ============================================================
// SMS SENDER (Placeholder for Future Integration)
// ============================================================
// TODO: Integrate with an SMS service provider like Twilio, Fast2SMS, or MSG91 in the future
const sendSMS = async (phone, message) => {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
        throw new Error("The OTP could not be sent to your mobile number.");
    }

    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
            authorization: apiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            route: "q",
            message,
            language: "english",
            numbers: phone,
        }),
    });

    const data = await response.json().catch(() => ({}));
    


console.log("Fast2SMS HTTP Status:", response.status);
console.log("Fast2SMS Response:", data);

if (!response.ok || data.return === false) {
    throw new Error(
        data.message || "Fast2SMS failed to send SMS"
    );
}

return data;

};

const sendPhoneVerificationOTP = async (phone, otp) => {
    const message = `Your Satya's Fashion Book verification code is ${otp}. It is valid for 10 minutes.`;
    await sendSMS(phone, message);
};

// ============================================================
// 1. ORDER CONFIRMATION (Receipt)
// ============================================================
const sendOrderNotifications = async (order, user, formattedAddress, totalAmount, updatedProducts) => {
    const adminEmail = process.env.ADMIN_EMAIL || "22pa1a4214@vishnu.edu.in";
    
    // --- USER EMAIL ---
    const userHtml = wrapEmailHTML("Order Placed", `
        <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
        <p>Thank you for your order! We are getting it ready for shipment.</p>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #2563EB; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Order ID:</strong> ${order._id}</p>
            <p style="margin: 5px 0 0;"><strong>Amount to Pay:</strong> <span style="font-size: 18px; font-weight: bold; color: #2563EB;">₹${totalAmount}</span> (COD)</p>
        </div>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
            ${updatedProducts.map(item => `
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                        <strong>${item.name}</strong>
                        <div style="font-size: 12px; color: #666;">
                            ${item.color ? `Color: ${item.color}` : ''} ${item.size ? `| Size: ${item.size}` : ''}
                        </div>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">x ${item.quantity}</td>
                </tr>
            `).join('')}
        </table>

        <div style="margin-top: 20px;">
            <strong>Delivery Address:</strong><br>
            <span style="color: #555;">
                ${formattedAddress.line1}, ${formattedAddress.city}, ${formattedAddress.state} - ${formattedAddress.pincode}<br>
                Phone: ${formattedAddress.phone}
            </span>
        </div>

        <div style="text-align: center; margin-top: 30px;">
             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/account?view=orders" style="background-color: #2563EB; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Order</a>
        </div>
    `);

    // --- ADMIN EMAIL ---
    const adminHtml = wrapEmailHTML("New Order Received 🛒", `
        <h2 style="color: #2563EB; margin-top:0;">New Order Alert</h2>
        <p><strong>Customer:</strong> ${user.name} (${user.email})</p>
        <p><strong>Total:</strong> ₹${totalAmount}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <h3>Items to Pack:</h3>
        <ul>
            ${updatedProducts.map(item => `
                <li style="margin-bottom: 5px;">
                    <strong>${item.quantity} x</strong> ${item.name} 
                    <span style="background:#eee; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
                        ${item.color || '-'} / ${item.size || '-'}
                    </span>
                </li>
            `).join('')}
        </ul>
    `);

    await Promise.all([
        sendEmail(user.email, `Order Confirmed: #${order._id}`, userHtml),
        sendEmail(adminEmail, `New Order: #${order._id} - ₹${totalAmount}`, adminHtml)
    ]);
};

// ============================================================
// 2. LOW STOCK ALERT
// ============================================================
const sendLowStockAlert = async (product) => {
    const adminEmail = process.env.ADMIN_EMAIL || "22pa1a4214@vishnu.edu.in";
    const html = wrapEmailHTML("Inventory Alert ⚠️", `
        <h2 style="color: #d97706;">Low Stock Warning</h2>
        <p>The stock for <strong>${product.name}</strong> is running low.</p>
        <p style="font-size: 18px;">Remaining Stock: <strong>${product.stock}</strong></p>
        <p>Please restock immediately to prevent potential lost sales.</p>
    `);
    await sendEmail(adminEmail, `Low Stock: ${product.name}`, html);
};

// ============================================================
// 3. PASSWORD RESET EMAIL
// ============================================================
const sendPasswordResetEmail = async (user, resetUrl) => {
    const html = wrapEmailHTML("Reset Your Password 🔒", `
        <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
        <p>We received a request to reset the password for your <strong>Satya's Fashion Book</strong> account.</p>
        
        <div style="text-align: center; margin: 35px 0;">
            <a href="${resetUrl}" style="background-color: #2563EB; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                Reset My Password
            </a>
        </div>

        <p style="color: #666; font-size: 14px;">This link is valid for <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">Or copy and paste this link into your browser:<br> <a href="${resetUrl}" style="color: #2563EB;">${resetUrl}</a></p>
    `);

    await sendEmail(user.email, "Action Required: Reset Your Password", html);
};

// ============================================================
// 4. EMAIL VERIFICATION OTP
// ============================================================
const sendVerificationOTP = async (user, otp) => {
    const html = wrapEmailHTML("Verify Your Email ✉️", `
        <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
        <p>Thank you for registering with <strong>Satya's Fashion Book</strong>. Please use the following OTP to verify your email address.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #2563EB; letter-spacing: 5px; background: #f0f9ff; padding: 10px 20px; border-radius: 8px; border: 1px dashed #2563EB;">
                ${otp}
            </span>
        </div>

        <p style="text-align: center; color: #666; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong>.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
    `);

    await sendEmail(user.email, "Action Required: Verify Your Email", html);
};

// ============================================================
// 5. ORDER CANCELLATION (User)
// ============================================================
const sendCancellationEmailToUser = async (order, user) => {
    const html = wrapEmailHTML("Order Cancelled", `
        <h2 style="color: #dc2626;">Order Cancelled</h2>
        <p>Hi ${user.name},</p>
        <p>Your order <strong>#${order._id}</strong> has been cancelled as per your request.</p>

        <h3 style="margin-top:20px;">Order Summary</h3>
        <ul>
            ${order.products.map(item => `
                <li>
                    <strong>${item.name}</strong> — ${item.quantity} pcs
                    <span style="font-size:12px; color:#666;">
                        ${item.color ? ' | Color: ' + item.color : ''}
                        ${item.size ? ' | Size: ' + item.size : ''}
                    </span>
                </li>
            `).join('')}
        </ul>

        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>

        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;"><strong>Refund Status:</strong></p>
            <p style="margin: 5px 0 0; color: #b91c1c;">
                ${order.paymentMethod === 'Cash on Delivery' ? 'No refund required (COD Order).' : 'Refund has been initiated.'}
            </p>
        </div>

        <p>We hope to serve you again soon!</p>
    `);
    await sendEmail(user.email, `Order Cancelled: #${order._id}`, html);
};

// ============================================================
// 6. ADMIN CANCELLATION ALERT
// ============================================================
const sendCancellationAlertToAdmin = async (order, user) => {
    const adminEmail = process.env.ADMIN_EMAIL || "22pa1a4214@vishnu.edu.in";

    const html = wrapEmailHTML("Order Cancellation 🛑", `
        <h2 style="color: #dc2626;">Order Cancelled by User</h2>

        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Customer:</strong> ${user.name} (${user.email})</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>

        <h3 style="margin-top:20px;">Items</h3>
        <ul>
            ${order.products.map(item => `
                <li>
                    ${item.quantity} × ${item.name}
                    <span style="font-size:12px; color:#666;">
                        ${item.color || '-'} / ${item.size || '-'}
                    </span>
                </li>
            `).join('')}
        </ul>

        <div style="background:#fee2e2; color:#991b1b; padding:10px; text-align:center; font-weight:bold; border-radius:4px;">
            ACTION: DO NOT SHIP THIS ORDER
        </div>
    `);

    await sendEmail(adminEmail, `Cancelled: #${order._id}`, html);
};

// ============================================================
// 7. STATUS UPDATES (Processing / Shipped / Delivered)
// ============================================================
const sendOrderStatusEmail = async (order, user) => {
    let title = "", message = "", color = "#333";

    if (order.status === "Processing") {
        title = "Order Confirmed";
        message = "Your order has been confirmed and is being packed.";
        color = "#d97706";
    } else if (order.status === "Shipped") {
        title = "Order Shipped";
        message = "Good news! Your order is on the way.";
        color = "#2563EB";
    } else if (order.status === "Delivered") {
        title = "Order Delivered";
        message = "Your order has been delivered. Enjoy! \nThank you for shopping with us.";
        color = "#16a34a";
    } else return;

    const html = wrapEmailHTML(title, `
        <h2 style="color: ${color};">${title}</h2>
        <p>Hi ${user.name},</p>
        <p>${message}</p>

        <h3 style="margin-top:20px;">Order Items</h3>
        <ul>
            ${order.products.map(item => `
                <li>
                    ${item.quantity} × ${item.name}
                    <span style="font-size:12px; color:#666;">
                        ${item.color || '-'} / ${item.size || '-'}
                    </span>
                </li>
            `).join('')}
        </ul>

        <p><strong>Total:</strong> ₹${order.totalAmount}</p>

        <div style="margin-top:20px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/account?view=orders"
                style="color:${color}; text-decoration:none; font-weight:bold;">
                View Order Details
            </a>
        </div>
    `);

    await sendEmail(user.email, `${title}: #${order._id}`, html);
};

// ============================================================
// 8. ADMIN REJECTION / FORCED CANCEL
// ============================================================
const sendAdminCancellationEmail = async (order, user, reason) => {
    const html = wrapEmailHTML("Important Order Update", `
        <h2 style="color: #dc2626;">Order Cancelled</h2>
        <p>Hi ${user.name},</p>

        <p>Your order <strong>#${order._id}</strong> has been cancelled by our team.</p>

        <div style="background-color:#fff1f2; padding:15px; border-left:4px solid #e11d48; margin:20px 0;">
            <strong>Reason:</strong> ${reason || "Administrative decision"}
        </div>

        <h3>Order Summary</h3>
        <ul>
            ${order.products.map(item => `
                <li>${item.quantity} × ${item.name}</li>
            `).join('')}
        </ul>

        <p><strong>Total Refund:</strong> ₹${order.totalAmount}</p>
    `);

    await sendEmail(user.email, `Update on Order #${order._id}`, html);
};

// ============================================================
// 9. CANCELLATION REQUEST (Processing Stage)
// ============================================================
const sendCancelRequestEmails = async (order, user, reason) => {
    const adminEmail = process.env.ADMIN_EMAIL || "22pa1a4214@vishnu.edu.in";

    // --- ADMIN EMAIL ---
    const adminHtml = wrapEmailHTML("Cancellation Request ✋", `
        <h2 style="color: #d97706;">User Requested Cancellation</h2>
        <p>The order is currently <strong>${order.status}</strong>.</p>
        <ul>
            <li><strong>Order ID:</strong> ${order._id}</li>
            <li><strong>Customer:</strong> ${user.name} (${user.email})</li>
            <li><strong>Reason:</strong> "${reason}"</li>
        </ul>
        <p>Please review this request in the admin panel.</p>
        <a href="#" style="background: #d97706; color: white; padding: 8px 15px; text-decoration: none; border-radius: 4px;">Open Admin Panel</a>
    `);

    // --- USER EMAIL ---
    const userHtml = wrapEmailHTML("Cancellation Request Received", `
        <h2 style="color:#2563EB; margin-top:0;">Cancellation Request Received</h2>
        
        <p>Hi ${user.name},</p>

        <p>
            We have received your request to cancel your order 
            <strong>#${order._id}</strong>.
        </p>

        <div style="background-color:#f0f9ff; padding:15px; border-left:4px solid #2563EB; border-radius:4px; margin:20px 0;">
            <p style="margin:0;"><strong>Order Status:</strong> ${order.status}</p>
            <p style="margin:5px 0 0;"><strong>Your Reason:</strong> "${reason}"</p>
        </div>

        <p>
            Since your order is already <strong>${order.status}</strong>, our team must manually review your request before stopping shipment.
        </p>

        <p>
            You will get an update once the team reviews your request.  
            Thank you for your patience!
        </p>

        <div style="text-align:center; margin-top:25px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/account?view=orders" 
                style="background-color:#2563EB; color:white; padding:12px 25px; text-decoration:none; border-radius:5px; font-weight:bold;">
                View Your Orders
            </a>
        </div>
    `);

    await Promise.all([
        sendEmail(adminEmail, `Cancel Request: #${order._id}`, adminHtml),
        sendEmail(user.email, `Request Received: Order #${order._id}`, userHtml)
    ]);
};

// ============================================================
// 10. CANCELLATION REQUEST APPROVED (Admin Accepted User Request)
// ============================================================
const sendCancelRequestApprovedEmail = async (order, user) => {
    const html = wrapEmailHTML("Cancellation Request Approved", `
        <h2 style="color:#16a34a; margin-top:0;">Request Approved</h2>

        <p>Hi ${user.name},</p>

        <p>
            We have reviewed your cancellation request for order 
            <strong>#${order._id}</strong> and it has been 
            <strong style="color:#16a34a;">approved</strong>.
        </p>

        <p>Your order has now been officially cancelled.</p>

        <h3 style="margin-top:20px;">Order Summary</h3>
        <ul>
            ${order.products.map(item => `
                <li>${item.quantity} × ${item.name}
                    <span style="font-size:12px; color:#666;">
                        ${item.color || '-'} / ${item.size || '-'}
                    </span>
                </li>
            `).join('')}
        </ul>

        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>

        <div style="background:#dcfce7; padding:12px; border-left:4px solid #16a34a; margin:20px 0;">
            <p style="margin:0;"><strong>Refund Status:</strong> 
                ${order.paymentMethod === 'Cash on Delivery' 
                    ? 'No refund required (COD Order).' 
                    : 'Refund has been initiated to your original payment method.'
                }
            </p>
        </div>

        <p>If you have any questions, feel free to reply to this email.</p>
    `);

    await sendEmail(user.email, `Cancellation Approved: Order #${order._id}`, html);
};

// ============================================================
// 11. CANCELLATION REQUEST REJECTED (Admin Denied User Request)
// ============================================================
const sendCancelRequestRejectedEmail = async (order, user, reason) => {
    const html = wrapEmailHTML("Cancellation Request Rejected", `
        <h2 style="color:#dc2626; margin-top:0;">Request Rejected</h2>

        <p>Hi ${user.name},</p>

        <p>
            We reviewed your request to cancel order 
            <strong>#${order._id}</strong>, but unfortunately it 
            <strong style="color:#dc2626;">cannot be approved</strong>.
        </p>

        <div style="background-color:#fef2f2; padding:15px; border-left:4px solid #dc2626; margin:20px 0;">
            <strong>Reason Provided:</strong><br>
            ${reason || "The order has progressed too far to cancel."}
        </div>

        <p>Your order will continue to be processed normally.</p>

        <h3 style="margin-top:20px;">Order Items</h3>
        <ul>
            ${order.products.map(item => `
                <li>${item.quantity} × ${item.name}
                    <span style="font-size:12px; color:#666;">
                        ${item.color || '-'} / ${item.size || '-'}
                    </span>
                </li>
            `).join('')}
        </ul>

        <p><strong>Total:</strong> ₹${order.totalAmount}</p>

        <p>If you still need help, feel free to reply to this email.</p>
    `);

    await sendEmail(user.email, `Cancellation Request Rejected: Order #${order._id}`, html);
};


module.exports = { 
    sendEmail,
    wrapEmailHTML,
    sendSMS,
    sendPhoneVerificationOTP,
    sendOrderNotifications,
    sendPasswordResetEmail,
    sendVerificationOTP,
    sendLowStockAlert, 
    sendCancellationEmailToUser, 
    sendCancellationAlertToAdmin,
    sendOrderStatusEmail,
    sendAdminCancellationEmail,
    sendCancelRequestEmails,
    sendCancelRequestApprovedEmail,
    sendCancelRequestRejectedEmail
};