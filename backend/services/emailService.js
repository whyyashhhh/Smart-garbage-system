const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
    // For development, use Gmail or any SMTP service
    // For production, use a proper email service like SendGrid, AWS SES, etc.
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASSWORD || 'your-app-password'
        }
    });
};

// Send report resolution email to user
const sendReportResolvedEmail = async (report, user) => {
    try {
        const transporter = createTransporter();

        // Email to user who created the report
        const userMailOptions = {
            from: process.env.EMAIL_USER || 'Smart Garbage System <noreply@garbagesystem.com>',
            to: user.email,
            subject: `✅ Your Report Has Been Resolved - ${report.garbageType}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(to right, #10b981, #059669); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                        .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981; }
                        .label { font-weight: bold; color: #4b5563; }
                        .value { color: #1f2937; margin-left: 10px; }
                        .status-resolved { background: #dcfce7; color: #166534; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
                        .footer { background: #1f2937; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
                        .success-msg { background: #dcfce7; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; border-radius: 4px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Report Resolved!</h1>
                            <p>Smart Garbage Reporting System</p>
                        </div>
                        <div class="content">
                            <div class="success-msg">
                                <p><strong>Good News, ${user.name}!</strong></p>
                                <p>Your garbage report has been successfully resolved by our team. Thank you for helping keep our community clean!</p>
                            </div>
                            
                            <div class="info-box">
                                <h3>Report Details:</h3>
                                <p><span class="label">Report ID:</span><span class="value">${report._id}</span></p>
                                <p><span class="label">Garbage Type:</span><span class="value">${report.garbageType}</span></p>
                                <p><span class="label">Description:</span><span class="value">${report.description}</span></p>
                                <p><span class="label">Location:</span><span class="value">Lat: ${report.latitude.toFixed(4)}, Lng: ${report.longitude.toFixed(4)}</span></p>
                                <p><span class="label">Status:</span><span class="status-resolved">RESOLVED</span></p>
                            </div>

                            <div class="info-box">
                                <p><span class="label">Reported On:</span><span class="value">${new Date(report.createdAt).toLocaleString()}</span></p>
                                <p><span class="label">Resolved On:</span><span class="value">${new Date().toLocaleString()}</span></p>
                            </div>

                            <p style="margin-top: 20px; color: #4b5563;">
                                You can view this report in your dashboard at any time. If you notice any other garbage issues, please don't hesitate to submit a new report.
                            </p>
                        </div>
                        <div class="footer">
                            <p>Smart Garbage Reporting System</p>
                            <p>Thank you for being an active community member!</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Email copy to admin
        const adminMailOptions = {
            from: process.env.EMAIL_USER || 'Smart Garbage System <noreply@garbagesystem.com>',
            to: process.env.ADMIN_EMAIL || 'ocurse30@gmail.com',
            subject: `Report Resolved - ${report.garbageType}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                        .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
                        .label { font-weight: bold; color: #4b5563; }
                        .value { color: #1f2937; margin-left: 10px; }
                        .status-resolved { background: #dcfce7; color: #166534; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
                        .footer { background: #1f2937; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🗑️ Report Resolved (Admin Copy)</h1>
                            <p>Smart Garbage Reporting System</p>
                        </div>
                        <div class="content">
                            <p>A garbage report has been marked as <span class="status-resolved">RESOLVED</span></p>
                            
                            <div class="info-box">
                                <p><span class="label">Report ID:</span><span class="value">${report._id}</span></p>
                                <p><span class="label">Garbage Type:</span><span class="value">${report.garbageType}</span></p>
                                <p><span class="label">Description:</span><span class="value">${report.description}</span></p>
                                <p><span class="label">Location:</span><span class="value">Lat: ${report.latitude.toFixed(4)}, Lng: ${report.longitude.toFixed(4)}</span></p>
                                <p><span class="label">Status:</span><span class="value">${report.status}</span></p>
                            </div>

                            <div class="info-box">
                                <h3>Reported By:</h3>
                                <p><span class="label">Name:</span><span class="value">${user.name}</span></p>
                                <p><span class="label">Email:</span><span class="value">${user.email}</span></p>
                            </div>

                            <div class="info-box">
                                <p><span class="label">Reported On:</span><span class="value">${new Date(report.createdAt).toLocaleString()}</span></p>
                                <p><span class="label">Resolved On:</span><span class="value">${new Date().toLocaleString()}</span></p>
                            </div>

                            <p style="margin-top: 15px; background: #dbeafe; padding: 10px; border-radius: 4px;">
                                ✅ Notification email has been sent to the user (${user.email})
                            </p>
                        </div>
                        <div class="footer">
                            <p>Smart Garbage Reporting System - Admin Copy</p>
                            <p>Automated notification - Do not reply to this email</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Send email to user
        const userInfo = await transporter.sendMail(userMailOptions);
        console.log('✅ Resolution email sent to user:', user.email);

        // Send copy to admin
        const adminInfo = await transporter.sendMail(adminMailOptions);
        console.log('✅ Resolution email copy sent to admin');

        return { success: true, userMessageId: userInfo.messageId, adminMessageId: adminInfo.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
};

// Send new report notification to admin
const sendNewReportNotification = async (report, user) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_USER || 'Smart Garbage System <noreply@garbagesystem.com>',
            to: 'ocurse30@gmail.com',
            subject: `New Report Submitted - ${report.garbageType}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(to right, #ef4444, #f59e0b); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                        .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #ef4444; }
                        .label { font-weight: bold; color: #4b5563; }
                        .value { color: #1f2937; margin-left: 10px; }
                        .status-pending { background: #fef3c7; color: #92400e; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
                        .footer { background: #1f2937; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⚠️ New Report Submitted</h1>
                            <p>Smart Garbage Reporting System</p>
                        </div>
                        <div class="content">
                            <p>A new garbage report requires your attention: <span class="status-pending">PENDING</span></p>
                            
                            <div class="info-box">
                                <p><span class="label">Report ID:</span><span class="value">${report._id}</span></p>
                                <p><span class="label">Garbage Type:</span><span class="value">${report.garbageType}</span></p>
                                <p><span class="label">Description:</span><span class="value">${report.description}</span></p>
                                <p><span class="label">Location:</span><span class="value">Lat: ${report.latitude.toFixed(4)}, Lng: ${report.longitude.toFixed(4)}</span></p>
                            </div>

                            <div class="info-box">
                                <h3>Reported By:</h3>
                                <p><span class="label">Name:</span><span class="value">${user.name}</span></p>
                                <p><span class="label">Email:</span><span class="value">${user.email}</span></p>
                            </div>

                            <p style="margin-top: 20px; text-align: center;">
                                <a href="http://localhost:3002/admin" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View in Admin Panel</a>
                            </p>
                        </div>
                        <div class="footer">
                            <p>Smart Garbage Reporting System</p>
                            <p>Automated notification - Do not reply to this email</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ New report email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendReportResolvedEmail,
    sendNewReportNotification
};
