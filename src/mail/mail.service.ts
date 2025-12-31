import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify Your Email - Task Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6b73ff;">Welcome to Task Manager!</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #6b73ff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px;">
              Verify Email
            </a>
          </div>
          <p>Or copy this link:</p>
          <p>${verificationUrl}</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
