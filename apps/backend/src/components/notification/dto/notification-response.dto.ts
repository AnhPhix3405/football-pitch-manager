export class NotificationResponseDto {
  id!: string;
  type!: string;
  title!: string;
  content!: string | null;
  refId!: string | null;
  isRead!: boolean;
  createdAt!: Date;
  link?: string;
}
