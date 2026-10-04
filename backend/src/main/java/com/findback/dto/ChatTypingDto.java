package com.findback.dto;

public class ChatTypingDto {
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private Boolean isTyping;

    public ChatTypingDto() {}

    public ChatTypingDto(Long senderId, String senderName, Long receiverId, Boolean isTyping) {
        this.senderId = senderId;
        this.senderName = senderName;
        this.receiverId = receiverId;
        this.isTyping = isTyping;
    }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public Boolean getIsTyping() { return isTyping; }
    public void setIsTyping(Boolean isTyping) { this.isTyping = isTyping; }
}
