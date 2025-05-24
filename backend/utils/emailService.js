import nodemailer from "nodemailer"

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

/**
 * Send email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.text - Plain text content
 * @param {String} options.html - HTML content
 * @returns {Promise} - Nodemailer info object
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  }

  return await transporter.sendMail(mailOptions)
}

/**
 * Send welcome email
 * @param {Object} user - User object
 * @returns {Promise} - Nodemailer info object
 */
const sendWelcomeEmail = async (user) => {
  return await sendEmail({
    to: user.email,
    subject: "Welcome to SkinCare!",
    text: `Hi ${user.name},\n\nWelcome to SkinCare! We're excited to have you on board.\n\nBest regards,\nThe SkinCare Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to SkinCare!</h2>
        <p>Hi ${user.name},</p>
        <p>We're excited to have you on board. Start exploring our premium skincare products today!</p>
        <p>Best regards,<br>The SkinCare Team</p>
      </div>
    `,
  })
}

/**
 * Send order confirmation email
 * @param {Object} order - Order object
 * @param {Object} user - User object
 * @returns {Promise} - Nodemailer info object
 */
const sendOrderConfirmationEmail = async (order, user) => {
  return await sendEmail({
    to: user.email,
    subject: `Order Confirmation #${order._id}`,
    text: `
      Hi ${user.name},

      Thank you for your order! We've received your order and will process it shortly.

      Order #: ${order._id}
      Date: ${new Date(order.createdAt).toLocaleDateString()}
      Total: $${order.totalPrice.toFixed(2)}

      Best regards,
      The SkinCare Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Confirmation</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for your order! We've received your order and will process it shortly.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0;">
          <p><strong>Order #:</strong> ${order._id}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Total:</strong> $${order.totalPrice.toFixed(2)}</p>
        </div>
        
        <p>Best regards,<br>The SkinCare Team</p>
      </div>
    `,
  })
}

export { sendEmail, sendWelcomeEmail, sendOrderConfirmationEmail }
