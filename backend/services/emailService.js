const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

        // Check if email credentials are configured
        if (!emailUser || !emailPass) {
            console.log('⚠️  Email service not configured - email notifications will be skipped');
            console.log('💡 Add EMAIL_USER and EMAIL_PASS to .env to enable Nodemailer emails');
            return;
        }

        try {
            const useServiceTransport = !process.env.EMAIL_HOST;

            this.transporter = useServiceTransport
                ? nodemailer.createTransport({
                    service: process.env.EMAIL_SERVICE || 'gmail',
                    auth: {
                        user: emailUser,
                        pass: emailPass
                    }
                })
                : nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
                    secure: process.env.EMAIL_SECURE === 'true',
                    auth: {
                        user: emailUser,
                        pass: emailPass
                    }
                });

            console.log('✅ Email service initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize email service:', error.message);
        }
    }

    async sendEmail({ to, subject, html, text }) {
        if (!this.transporter) {
            console.log('⚠️  Email service not available - skipping email to:', to);
            return { success: false, message: 'Email service not configured' };
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || `"${process.env.APP_NAME || 'Quiz Platform'}" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                text,
                html
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Failed to send email:', error.message);
            return { success: false, error: error.message };
        }
    }

    async sendEmailVerification(user, verificationUrl) {
        const subject = 'Verify your email address';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
                <h2 style="color: #2563EB;">Verify your email</h2>
                <p>Hello ${user.name},</p>
                <p>Thanks for registering. Please verify your email address before signing in.</p>
                <div style="margin: 24px 0;">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; background-color: #2563EB; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                        Verify Email
                    </a>
                </div>
                <p style="font-size: 14px; color: #4B5563;">This verification link will expire in 24 hours.</p>
                <p style="font-size: 14px; color: #4B5563;">If the button does not work, open this URL manually:</p>
                <p style="font-size: 13px; word-break: break-all; color: #1D4ED8;">${verificationUrl}</p>
            </div>
        `;
        const text = `Hello ${user.name}, verify your email by opening this link: ${verificationUrl}. This link expires in 24 hours.`;

        return this.sendEmail({ to: user.email, subject, html, text });
    }

    // Template: Exam Reminder
    async sendExamReminder(user, exam, hoursUntilExam) {
        const subject = `Reminder: Exam "${exam.title}" starts in ${hoursUntilExam} hours`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Exam Reminder</h2>
                <p>Hello ${user.name},</p>
                <p>This is a reminder that your exam is starting soon:</p>
                <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">${exam.title}</h3>
                    <p><strong>Subject:</strong> ${exam.subject}</p>
                    <p><strong>Start Time:</strong> ${new Date(exam.startTime).toLocaleString()}</p>
                    <p><strong>Duration:</strong> ${exam.questions.length * (exam.timePerQuestion || 1)} minutes</p>
                    <p><strong>Total Marks:</strong> ${exam.totalMarks}</p>
                </div>
                <p>Make sure you're prepared and ready on time!</p>
                <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                    If you have any questions, please contact your teacher.
                </p>
            </div>
        `;
        const text = `Hello ${user.name}, your exam "${exam.title}" starts in ${hoursUntilExam} hours. Start Time: ${new Date(exam.startTime).toLocaleString()}`;

        return this.sendEmail({ to: user.email, subject, html, text });
    }

    // Template: Result Published
    async sendResultNotification(user, exam, result) {
        const subject = `Result Published: ${exam.title}`;
        const percentage = ((result.obtainedMarks / exam.totalMarks) * 100).toFixed(2);
        const passed = percentage >= 40;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: ${passed ? '#10B981' : '#EF4444'};">
                    ${passed ? '🎉 Congratulations!' : '📊 Result Published'}
                </h2>
                <p>Hello ${user.name},</p>
                <p>Your result for the following exam has been published:</p>
                <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">${exam.title}</h3>
                    <p><strong>Marks Obtained:</strong> ${result.obtainedMarks} / ${exam.totalMarks}</p>
                    <p><strong>Percentage:</strong> ${percentage}%</p>
                    ${result.rank ? `<p><strong>Rank:</strong> ${result.rank}</p>` : ''}
                    <p><strong>Status:</strong> <span style="color: ${passed ? '#10B981' : '#EF4444'}; font-weight: bold;">
                        ${passed ? 'PASSED' : 'FAILED'}
                    </span></p>
                </div>
                <p>${passed ? 'Keep up the great work!' : 'Don\'t worry, keep practicing and you\'ll do better next time!'}</p>
                <a href="${process.env.FRONTEND_URL}/results" 
                   style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; margin-top: 20px;">
                    View Detailed Result
                </a>
            </div>
        `;
        const text = `Hello ${user.name}, your result for "${exam.title}" has been published. You scored ${result.obtainedMarks}/${exam.totalMarks} (${percentage}%).`;

        return this.sendEmail({ to: user.email, subject, html, text });
    }

    // Template: Doubt Answered
    async sendDoubtAnsweredNotification(student, doubt, answeredBy) {
        const subject = `Your doubt has been answered!`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">💡 Your Doubt Has Been Answered</h2>
                <p>Hello ${student.name},</p>
                <p>${answeredBy.name} has answered your doubt:</p>
                <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="font-weight: bold; color: #374151;">${doubt.question}</p>
                </div>
                <a href="${process.env.FRONTEND_URL}/doubts/${doubt._id}" 
                   style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; margin-top: 20px;">
                    View Answer
                </a>
            </div>
        `;
        const text = `Hello ${student.name}, ${answeredBy.name} has answered your doubt: "${doubt.question}"`;

        return this.sendEmail({ to: student.email, subject, html, text });
    }

    // Template: Study Group Invitation
    async sendStudyGroupInvitation(user, studyGroup, invitedBy) {
        const subject = `You've been invited to join "${studyGroup.name}"`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">👥 Study Group Invitation</h2>
                <p>Hello ${user.name},</p>
                <p>${invitedBy.name} has invited you to join their study group:</p>
                <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">${studyGroup.name}</h3>
                    <p><strong>Subject:</strong> ${studyGroup.subject}</p>
                    ${studyGroup.description ? `<p>${studyGroup.description}</p>` : ''}
                    <p><strong>Members:</strong> ${studyGroup.members.length}</p>
                </div>
                <a href="${process.env.FRONTEND_URL}/study-groups/${studyGroup._id}" 
                   style="display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; margin-top: 20px;">
                    Join Study Group
                </a>
            </div>
        `;
        const text = `Hello ${user.name}, ${invitedBy.name} has invited you to join the study group "${studyGroup.name}" (${studyGroup.subject})`;

        return this.sendEmail({ to: user.email, subject, html, text });
    }
}

module.exports = new EmailService();
