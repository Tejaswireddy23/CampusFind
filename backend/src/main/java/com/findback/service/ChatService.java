package com.findback.service;

import com.findback.dto.ChatMessageDto;
import com.findback.dto.ChatTypingDto;
import com.findback.dto.UserDto;
import com.findback.exception.ResourceNotFoundException;
import com.findback.model.Item;
import com.findback.model.Message;
import com.findback.model.NotificationType;
import com.findback.model.User;
import com.findback.repository.ItemRepository;
import com.findback.repository.MessageRepository;
import com.findback.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public ChatMessageDto sendMessage(ChatMessageDto dto, User sender) {
        User receiver = userRepository.findById(dto.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        Item item = null;
        if (dto.getItemId() != null) {
            item = itemRepository.findById(dto.getItemId()).orElse(null);
        }

        Message msg = new Message(sender, receiver, item, dto.getContent().trim());
        msg = messageRepository.save(msg);

        ChatMessageDto res = toDto(msg);

        // 1. Live WebSocket direct message delivery
        try {
            messagingTemplate.convertAndSend("/topic/messages/" + receiver.getId(), res);
        } catch (Exception e) {
            logger.warn("WebSocket message delivery error: {}", e.getMessage());
        }

        // 2. Also send real-time notification alert to receiver
        notificationService.createAndSend(
                receiver,
                "New Message from " + sender.getName(),
                dto.getContent().length() > 60 ? dto.getContent().substring(0, 57) + "..." : dto.getContent(),
                NotificationType.MESSAGE,
                "/messages?with=" + sender.getId()
        );

        return res;
    }

    public List<ChatMessageDto> getChatHistory(Long otherUserId, User currentUser) {
        List<Message> history = messageRepository.findChatHistory(currentUser.getId(), otherUserId);

        // Mark unread incoming messages as read
        for (Message m : history) {
            if (m.getReceiver().getId().equals(currentUser.getId()) && !m.getIsRead()) {
                m.setIsRead(true);
                messageRepository.save(m);
            }
        }

        return history.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<UserDto> getConversations(User currentUser) {
        List<Long> partnerIds = messageRepository.findDistinctChatPartners(currentUser.getId());
        List<UserDto> partners = new ArrayList<>();
        for (Long id : partnerIds) {
            userRepository.findById(id).ifPresent(u -> partners.add(userService.toUserDto(u)));
        }
        return partners;
    }

    public void sendTypingStatus(ChatTypingDto typingDto, User sender) {
        typingDto.setSenderId(sender.getId());
        typingDto.setSenderName(sender.getName());
        try {
            messagingTemplate.convertAndSend("/topic/chat/" + typingDto.getReceiverId() + "/typing", typingDto);
        } catch (Exception e) {
            logger.warn("Typing event error: {}", e.getMessage());
        }
    }

    public ChatMessageDto toDto(Message msg) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(msg.getId());
        dto.setSenderId(msg.getSender().getId());
        dto.setSenderName(msg.getSender().getName());
        dto.setReceiverId(msg.getReceiver().getId());
        dto.setReceiverName(msg.getReceiver().getName());
        if (msg.getItem() != null) {
            dto.setItemId(msg.getItem().getId());
        }
        dto.setContent(msg.getContent());
        dto.setIsRead(msg.getIsRead());
        dto.setCreatedAt(msg.getCreatedAt());
        return dto;
    }
}
