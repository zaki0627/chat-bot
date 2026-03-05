export type MessageRole = "user" | "assistant";
export class Message {
  id!: string;
  conversationId!: string;
  role!: string;
  content!: string;
  imageUrl?: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Message) {
    Object.assign(this, data);
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);
  }
}
