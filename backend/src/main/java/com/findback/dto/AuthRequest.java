package com.findback.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthRequest {
    private String email;

    private String studentId;

    private String loginIdentifier;

    @NotBlank(message = "Password is required")
    private String password;

    public AuthRequest() {}

    public AuthRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { 
        this.email = email; 
        if (this.loginIdentifier == null) this.loginIdentifier = email;
    }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { 
        this.studentId = studentId; 
        if (this.loginIdentifier == null) this.loginIdentifier = studentId;
    }

    public String getLoginIdentifier() {
        if (loginIdentifier != null && !loginIdentifier.trim().isEmpty()) {
            return loginIdentifier.trim();
        }
        if (studentId != null && !studentId.trim().isEmpty()) {
            return studentId.trim();
        }
        return email != null ? email.trim() : "";
    }
    public void setLoginIdentifier(String loginIdentifier) {
        this.loginIdentifier = loginIdentifier;
        if (this.email == null) this.email = loginIdentifier;
    }

    public void setIdentifier(String identifier) {
        setLoginIdentifier(identifier);
    }



    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
