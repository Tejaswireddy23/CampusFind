package com.findback.controller;

import com.findback.dto.ChatMessageDto;
import com.findback.dto.UserDto;
import com.findback.model.User;
import com.findback.service.ChatService;
import com.findback.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDto>> getConversations(Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(chatService.getConversations(user));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<ChatMessageDto>> getConversationMessages(
            @PathVariable Long id,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(chatService.getChatHistory(id, user));
    }
}
