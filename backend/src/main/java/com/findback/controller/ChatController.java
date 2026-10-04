package com.findback.controller;

import com.findback.dto.ChatMessageDto;
import com.findback.dto.ChatTypingDto;
import com.findback.dto.UserDto;
import com.findback.model.User;
import com.findback.service.ChatService;
import com.findback.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<ChatMessageDto> sendMessage(
            @Valid @RequestBody ChatMessageDto dto,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(chatService.sendMessage(dto, user));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessageDto>> getChatHistory(
            @RequestParam Long otherUserId,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(chatService.getChatHistory(otherUserId, user));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<UserDto>> getConversations(Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(chatService.getConversations(user));
    }

    @PostMapping("/typing")
    public ResponseEntity<Void> sendTypingStatus(
            @RequestBody ChatTypingDto typingDto,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        chatService.sendTypingStatus(typingDto, user);
        return ResponseEntity.ok().build();
    }
}
