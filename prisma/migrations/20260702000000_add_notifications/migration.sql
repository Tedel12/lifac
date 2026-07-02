model Notification {
  id        String   @id @default(uuid())
  title     String
  message   String
  isRead    Boolean  @default(false)
  type      String   // 'info', 'warning', 'success', 'error'
  createdAt DateTime @default(now())

  @@map("notifications")
}
