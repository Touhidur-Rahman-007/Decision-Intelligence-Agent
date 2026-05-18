import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendWelcomeEmail(_email: string) {
    return { queued: true };
  }
}
